// forecast.js

document.addEventListener("DOMContentLoaded", () => {
    // DOM element references
    const forecastLatInput = document.getElementById("forecastLat");
    const forecastLonInput = document.getElementById("forecastLon");
    const manualForecastBtn = document.getElementById("manualForecastBtn");
    const gpsForecastBtn = document.getElementById("gpsForecastBtn");
    const forecastCardsContainer = document.getElementById("forecastCardsContainer");
    const loadingSpinner = document.querySelector(".loading-spinner");
    const currentLocationDisplay = document.getElementById("currentLocationDisplay");

    // WMO Weather Code to Description and Icon Mapping
    const WMO_CODE_MAP = {
        0: { description: "Clear Sky", icon: "fas fa-sun" },
        1: { description: "Mainly Clear", icon: "fas fa-cloud-sun" },
        2: { description: "Partly Cloudy", icon: "fas fa-cloud-sun" },
        3: { description: "Overcast", icon: "fas fa-cloud" },
        45: { description: "Fog", icon: "fas fa-smog" },
        48: { description: "Depositing Rime Fog", icon: "fas fa-smog" },
        51: { description: "Light Drizzle", icon: "fas fa-cloud-rain" },
        53: { description: "Moderate Drizzle", icon: "fas fa-cloud-rain" },
        55: { description: "Dense Drizzle", icon: "fas fa-cloud-rain" },
        56: { description: "Light Freezing Drizzle", icon: "fas fa-cloud-showers-heavy" },
        57: { description: "Dense Freezing Drizzle", icon: "fas fa-cloud-showers-heavy" },
        61: { description: "Slight Rain", icon: "fas fa-cloud-rain" },
        63: { description: "Moderate Rain", icon: "fas fa-cloud-rain" },
        65: { description: "Heavy Rain", icon: "fas fa-cloud-rain" },
        66: { description: "Light Freezing Rain", icon: "fas fa-cloud-showers-heavy" },
        67: { description: "Heavy Freezing Rain", icon: "fas fa-cloud-showers-heavy" },
        71: { description: "Slight Snow Fall", icon: "fas fa-snowflake" },
        73: { description: "Moderate Snow Fall", icon: "fas fa-snowflake" },
        75: { description: "Heavy Snow Fall", icon: "fas fa-snowflake" },
        77: { description: "Snow Grains", icon: "fas fa-snowflake" },
        80: { description: "Slight Rain Showers", icon: "fas fa-cloud-showers-heavy" },
        81: { description: "Moderate Rain Showers", icon: "fas fa-cloud-showers-heavy" },
        82: { description: "Violent Rain Showers", icon: "fas fa-cloud-showers-heavy" },
        85: { description: "Slight Snow Showers", icon: "fas fa-snowflake" },
        86: { description: "Heavy Snow Showers", icon: "fas fa-snowflake" },
        95: { description: "Thunderstorm", icon: "fas fa-bolt" },
        96: { description: "Thunderstorm with Slight Hail", icon: "fas fa-cloud-bolt" },
        99: { description: "Thunderstorm with Heavy Hail", icon: "fas fa-cloud-bolt" },
    };

    // Event listeners for buttons
    if (manualForecastBtn) {
        manualForecastBtn.addEventListener("click", handleManualSearch);
    }
    if (gpsForecastBtn) {
        gpsForecastBtn.addEventListener("click", handleGpsSearch);
    }

    // Initial load: Try to get forecast using GPS
    handleGpsSearch();

    /**
     * Handles manual latitude/longitude input for forecast search.
     */
    function handleManualSearch() {
        const lat = forecastLatInput.value;
        const lon = forecastLonInput.value;

        if (!lat || !lon) {
            alert("Please enter both latitude and longitude for manual search.");
            return;
        }
        if (isNaN(lat) || isNaN(lon)) {
            alert("Please enter valid numerical values for latitude and longitude.");
            return;
        }
        fetch7DayForecast(lat, lon);
    }

    /**
     * Handles fetching forecast using the browser's geolocation.
     */
    function handleGpsSearch() {
        currentLocationDisplay.innerText = "Location: Using GPS...";
        if (navigator.geolocation) {
            showLoading();
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    forecastLatInput.value = lat; // Populate inputs
                    forecastLonInput.value = lon;
                    fetch7DayForecast(lat, lon);
                },
                (error) => {
                    hideLoading();
                    console.error("Geolocation error:", error);
                    alert("Failed to get your location. Please allow location access in your browser or enter manually.");
                    currentLocationDisplay.innerText = "Location: GPS unavailable.";
                }
            );
        } else {
            alert("Geolocation is not supported by this browser. Please enter latitude and longitude manually.");
            currentLocationDisplay.innerText = "Location: GPS not supported.";
        }
    }

    /**
     * Fetches the 7-day weather forecast from the Open-Meteo API.
     * @param {string} lat - Latitude.
     * @param {string} lon - Longitude.
     */
    async function fetch7DayForecast(lat, lon) {
        showLoading();
        currentLocationDisplay.innerText = `Location: Lat ${lat}, Lon ${lon}`;
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia/Kolkata`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            updateForecastUI(data);
        } catch (error) {
            console.error("Failed to fetch 7-day forecast:", error);
            alert(`Error fetching forecast: ${error.message}. Please try again.`);
            forecastCardsContainer.innerHTML = `<p class="error-message">Could not load forecast. Please try again.</p>`;
        } finally {
            hideLoading();
        }
    }

    /**
     * Updates the UI with the 7-day forecast data.
     * @param {object} data - The forecast data from the API.
     */
    function updateForecastUI(data) {
        forecastCardsContainer.innerHTML = ""; // Clear previous cards

        if (!data || !data.daily || !data.daily.time || data.daily.time.length === 0) {
            forecastCardsContainer.innerHTML = `<p class="no-data">No forecast data available.</p>`;
            return;
        }

        data.daily.time.forEach((dateString, index) => {
            const maxTemp = data.daily.temperature_2m_max[index];
            const minTemp = data.daily.temperature_2m_min[index];
            const weatherCode = data.daily.weathercode[index];

            const date = new Date(dateString);
            const dayOfWeek = date.toLocaleString('en-US', { weekday: 'short' });
            const formattedDate = date.toLocaleString('en-US', { month: 'short', day: 'numeric' });

            const weatherInfo = WMO_CODE_MAP[weatherCode] || { description: "Unknown", icon: "fas fa-question-circle" };

            const card = document.createElement("div");
            card.classList.add("forecast-card");
            card.innerHTML = `
                <h3>${dayOfWeek}</h3>
                <p class="date">${formattedDate}</p>
                <i class="icon ${weatherInfo.icon}"></i>
                <p class="temp-range">${maxTemp.toFixed(0)}°C / ${minTemp.toFixed(0)}°C</p>
                <p class="description">${weatherInfo.description}</p>
            `;
            forecastCardsContainer.appendChild(card);
        });
    }

    /**
     * Displays the loading spinner.
     */
    function showLoading() {
        loadingSpinner.classList.remove("hidden");
    }

    /**
     * Hides the loading spinner.
     */
    function hideLoading() {
        loadingSpinner.classList.add("hidden");
    }
});