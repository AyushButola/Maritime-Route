let tempChartInstance;
let windWaveChartInstance;

// Initial call to fetch data on page load
document.addEventListener("DOMContentLoaded", () => {
    // Attempt to get the user's location via GPS
    if (navigator.geolocation) {
        showLoading();
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                fetchWeather(lat, lon);
            },
            (error) => {
                // Fallback to hardcoded values if GPS fails or is denied
                console.error("Geolocation failed, using default coordinates:", error);
                const defaultLat = 28.6139;
                const defaultLon = 77.2090;
                fetchWeather(defaultLat, defaultLon);
            }
        );
    } else {
        // Browser does not support Geolocation, use fallback
        console.error("Geolocation is not supported by this browser. Using default coordinates.");
        const defaultLat = 28.6139;
        const defaultLon = 77.2090;
        fetchWeather(defaultLat, defaultLon);
    }
});

/**
 * Fetches weather graph data from the API and plots the charts.
 * @param {number} lat - Latitude.
 * @param {number} lon - Longitude.
 */
async function fetchWeather(lat, lon) {
    showLoading();

    try {
        const res = await fetch(`http://172.16.78.170:8000/weather/graph/?lat=${lat}&lon=${lon}`);
        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();

        // Check if the expected data is present
        if (!data || !data.labels || !data.temperature || !data.wind_speed || !data.wave_height) {
            throw new Error("Invalid data structure received from API.");
        }

        // --- Plot Charts ---
        const { labels, temperature, wind_speed, wave_height } = data;
        drawTempChart(labels, temperature);
        drawWindWaveChart(labels, wind_speed, wave_height);

    } catch (err) {
        console.error("Failed to fetch weather data:", err);
        alert("Failed to fetch weather data. Please try again later.");
    } finally {
        hideLoading();
    }
}

/**
 * Draws the temperature trend chart.
 * @param {string[]} labels - Chart labels (e.g., hours).
 * @param {number[]} temps - Temperature data.
 */
function drawTempChart(labels, temps) {
    // Destroy existing chart instance to prevent conflicts
    if (tempChartInstance) {
        tempChartInstance.destroy();
    }
    const ctx = document.getElementById("tempChart").getContext("2d");
    tempChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Temperature (°C)",
                data: temps,
                borderColor: "cyan",
                backgroundColor: "transparent",
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: "°C" }
                }
            }
        }
    });
}

/**
 * Draws the wind and wave height chart.
 * @param {string[]} labels - Chart labels (e.g., hours).
 * @param {number[]} wind - Wind speed data.
 * @param {number[]} waves - Wave height data.
 */
function drawWindWaveChart(labels, wind, waves) {
    // Destroy existing chart instance to prevent conflicts
    if (windWaveChartInstance) {
        windWaveChartInstance.destroy();
    }
    const ctx = document.getElementById("windWaveChart").getContext("2d");
    windWaveChartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Wind Speed (m/s)",
                    data: wind,
                    borderColor: "gold",
                    backgroundColor: "transparent",
                    tension: 0.3
                },
                {
                    label: "Wave Height (m)",
                    data: waves,
                    borderColor: "tomato",
                    backgroundColor: "transparent",
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: { display: true, text: "m/s or m" }
                }
            }
        }
    });
}

// Loading spinner functions
function showLoading() {
    const spinner = document.querySelector(".loading-spinner");
    if (spinner) {
        spinner.classList.remove("hidden");
    }
}

function hideLoading() {
    const spinner = document.querySelector(".loading-spinner");
    if (spinner) {
        spinner.classList.add("hidden");
    }
}