// Manual Search Button
document.querySelector(".btn.btn--primary").addEventListener("click", () => {
  const lat = document.getElementById("latInput").value;
  const lon = document.getElementById("lonInput").value;

  if (!lat || !lon) {
    alert("Please enter valid latitude and longitude.");
    return;
  }

  fetchForecast(lat, lon);
});

// GPS Button
document.querySelector(".btn.btn--secondary").addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchForecast(lat, lon);
      },
      () => {
        alert("Failed to get your location.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

// Fetch forecast from Django API
function fetchForecast(lat, lon) {
  fetch(`http://127.0.0.1:8000/weather/forecast/?lat=${lat}&lon=${lon}`)
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
  const weather = data.api_data;

  document.getElementById("currentTemp").innerText = `${weather.temperature}°C`;
  document.getElementById("weatherDescription").innerText = data.prediction;
  document.getElementById("feelsLike").innerText = `Feels like ${weather.feels_like ?? "--"}°C`;

  document.getElementById("humidity").innerText = `${weather.humidity}%`;
  document.getElementById("pressure").innerText = `${weather.pressure} hPa`;
  document.getElementById("windSpeed").innerText = `${weather.wind_speed} m/s`;
  document.getElementById("visibility").innerText = `${(weather.visibility / 1000).toFixed(1)} km`;
  document.getElementById("uvIndex").innerText = weather.uvi ?? "--";

  // Alerts
  const alertsContainer = document.getElementById("alertsContainer");
  alertsContainer.innerHTML = "";
  if (!data.alerts || data.alerts.length === 0) {
    alertsContainer.innerHTML = "<div class='alert-item'>No alerts available</div>";
  } else {
    data.alerts.forEach((alert) => {
      const alertItem = document.createElement("div");
      alertItem.className = "alert-item";
      alertItem.innerText = alert;
      alertsContainer.appendChild(alertItem);
    });
  }

  // Location
  document.getElementById("locationName").innerText = `Location: Latitude ${lat}, Longitude ${lon}`;
}
