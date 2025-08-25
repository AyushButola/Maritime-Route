// ---------- INDEX.HTML LOGIC ----------

// Manual Search Button
const searchBtn = document.querySelector(".btn.btn--primary");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const lat = document.getElementById("latInput").value;
    const lon = document.getElementById("lonInput").value;

    if (!lat || !lon) {
      alert("Please enter valid latitude and longitude.");
      return;
    }

    fetchForecast(lat, lon);
  });
}

// GPS Button
const gpsBtn = document.querySelector(".btn.btn--secondary");
if (gpsBtn) {
  gpsBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          fetchForecast(lat, lon);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Failed to get your location. Please allow location access in your browser.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });
}

// Fetch forecast from Django API
function fetchForecast(lat, lon) {
  fetch(`http://172.16.78.170:8000/weather/forecast/?lat=${lat}&lon=${lon}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        alert("Error: " + data.error);
        return;
      }
      updateWeatherUI(data, lat, lon);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert("Unable to fetch weather data.");
    });
}

// Update DOM elements with weather data
function updateWeatherUI(data, lat, lon) {
  const weather = data.api_weather_data;

  if (document.getElementById("currentTemp"))
    document.getElementById("currentTemp").innerText = `${weather.temperature}°C`;
  if (document.getElementById("weatherDescription"))
    document.getElementById("weatherDescription").innerText = data.ml_prediction;
  if (document.getElementById("feelsLike"))
    document.getElementById("feelsLike").innerText = `Feels like ${weather.temperature ?? "--"}°C`;

  if (document.getElementById("humidity"))
    document.getElementById("humidity").innerText = `${weather.humidity}%`;
  if (document.getElementById("pressure"))
    document.getElementById("pressure").innerText = `${weather.pressure} hPa`;
  if (document.getElementById("windSpeed"))
    document.getElementById("windSpeed").innerText = `${weather.wind_speed} m/s`;
  if (document.getElementById("visibility"))
    document.getElementById("visibility").innerText = `${(weather.visibility / 1000).toFixed(1)} km`;
  if (document.getElementById("uvIndex"))
    document.getElementById("uvIndex").innerText = weather.uvi ?? "--";

  // Alerts
  const alertsContainer = document.getElementById("alertsContainer");
  if (alertsContainer) {
    alertsContainer.innerHTML = "";

    // Always show ML prediction as first alert
    if (data.ml_prediction) {
      const mlAlert = document.createElement("div");
      mlAlert.className = "alert-item";
      mlAlert.innerText = `Prediction: ${data.ml_prediction}`;
      alertsContainer.appendChild(mlAlert);
    }

    if (!data.alerts || data.alerts.length === 0) {
      alertsContainer.innerHTML += "<div class='alert-item'>No alerts available</div>";
    } else {
      data.alerts.forEach((alert) => {
        const alertItem = document.createElement("div");
        alertItem.className = "alert-item";
        alertItem.innerText = alert;
        alertsContainer.appendChild(alertItem);
      });
    }
  }

  // Location
  if (document.getElementById("locationName"))
    document.getElementById("locationName").innerText = `Location: Latitude ${lat}, Longitude ${lon}`;
}

// ---------- GRAPH.HTML LOGIC ----------

if (document.getElementById('forecast')) {
  // Set your default coordinates or get from user input
  const lat = 30.2730;
  const lon = 78.9999;

  fetch(`http://172.16.78.170:8000/weather/forecast/?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      // Prepare data for charts
      const temps = data.forecast.map(f => f.main.temp);
      const windSpeeds = data.forecast.map(f => f.wind.speed);
      const waveHeights = data.forecast.map(f => f.wave_height ?? 0);
      const labels = data.forecast.map(f => {
        const d = new Date(f.dt_txt);
        return d.toLocaleString('en-US', { weekday: 'short', hour: '2-digit', hour12: false });
      });

      // Temperature Trend Chart
      const tempChartElem = document.getElementById("tempChart");
      if (tempChartElem) {
        const tempCtx = tempChartElem.getContext("2d");
        new Chart(tempCtx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "Temperature (°C)",
              data: temps,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255,99,132,0.2)",
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true }
            }
          }
        });
      }

      // Wind & Waves Chart
      const windChartElem = document.getElementById("windChart");
      if (windChartElem) {
        const windCtx = windChartElem.getContext("2d");
        new Chart(windCtx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Wind Speed (m/s)",
                data: windSpeeds,
                backgroundColor: "rgba(54, 162, 235, 0.6)"
              },
              {
                label: "Wave Height (m)",
                data: waveHeights,
                backgroundColor: "rgba(75, 192, 192, 0.6)"
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true }
            }
          }
        });
      }

      // Forecast cards
      const forecastContainer = document.getElementById('forecastCards');
      if (forecastContainer) {
        forecastContainer.innerHTML = '';
        data.forecast.forEach(f => {
          const card = document.createElement('div');
          card.classList.add('forecast-card');
          card.innerHTML = `
            <h4>${new Date(f.dt_txt).toLocaleString('en-US', { weekday: 'short', hour: '2-digit', hour12: false })}</h4>
            <p>${f.main.temp}°C</p>
            <p>${f.weather[0].description}</p>
          `;
          forecastContainer.appendChild(card);
        });
      }
    })
    .catch(err => {
      console.error("Forecast fetch error:", err);
      // Optionally show an error message in the UI
    });
}





