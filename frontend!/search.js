// search.js

document.addEventListener("DOMContentLoaded", () => {
    // Get references to all necessary DOM elements
    const lat1Input = document.getElementById("lat1");
    const lon1Input = document.getElementById("lon1");
    const lat2Input = document.getElementById("lat2");
    const lon2Input = document.getElementById("lon2");
    const speedInput = document.getElementById("speed");
    const calculateBtn = document.getElementById("calculateBtn");
    const loadingSpinner = document.querySelector(".loading-spinner");
    const outputContainer = document.getElementById("output-container");

    // Route calculation output elements
    const distanceElem = document.getElementById("distance");
    const travelTimeElem = document.getElementById("travelTime");
    const travelTimeHoursElem = document.getElementById("travelTimeHours");
    const arrivalTimeElem = document.getElementById("arrivalTime");

    // Forecast output elements
    const tempElem = document.getElementById("temp");
    const cloudinessElem = document.getElementById("cloudiness");
    const windElem = document.getElementById("wind");
    const humidityElem = document.getElementById("humidity");
    const pressureElem = document.getElementById("pressure");
    const visibilityElem = document.getElementById("visibility");

    // Add event listener to the "Calculate Route" button
    if (calculateBtn) {
        calculateBtn.addEventListener("click", calculateRoute);
    }

    /**
     * Handles the route calculation process.
     * Fetches input values, validates them, and makes an API call.
     */
    async function calculateRoute() {
        // Retrieve values from input fields
        const lat1 = lat1Input.value;
        const lon1 = lon1Input.value;
        const lat2 = lat2Input.value;
        const lon2 = lon2Input.value;
        const speed = speedInput.value;

        // Simple validation for required fields
        if (!lat1 || !lon1 || !lat2 || !lon2 || !speed) {
            alert("Please fill in all route details (start/end coordinates and speed).");
            return;
        }

        // Validate if coordinates and speed are numbers
        if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2) || isNaN(speed)) {
            alert("Please enter valid numerical values for coordinates and speed.");
            return;
        }

        // Show loading spinner while fetching data
        showLoading();
        outputContainer.classList.add("hidden"); // Hide previous results

        try {
            // Construct the API URL with dynamic parameters
            const apiUrl = `http://127.0.0.1:8000/weather/route-weather/?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&speed=${speed}`;

            // Make the API call
            const response = await fetch(apiUrl);

            // Check if the response was successful
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({})); // Try to parse error message
                throw new Error(`HTTP error! Status: ${response.status}. ${errorData.detail || response.statusText}`);
            }

            // Parse the JSON response
            const data = await response.json();

            // Update the UI with the fetched data
            updateUI(data);

        } catch (error) {
            console.error("Error calculating route:", error);
            alert(`Failed to calculate route: ${error.message}. Please check your inputs and try again.`);
        } finally {
            // Hide loading spinner regardless of success or failure
            hideLoading();
        }
    }

    /**
     * Updates the HTML elements with the data received from the API.
     * @param {object} data - The JSON data from the API response.
     */
    function updateUI(data) {
        // Update Route Details
        distanceElem.innerText = `${data.distance.toFixed(1)} km`;
        travelTimeElem.innerText = `${data.travel_time_days.toFixed(1)} days`;
        travelTimeHoursElem.innerText = `${data.travel_time_hours.toFixed(1)} hours`;

        // Format arrival time nicely
        const arrivalDate = new Date(data.arrival_time);
        arrivalTimeElem.innerText = arrivalDate.toLocaleString(); // Uses local format for date and time

        // Update Forecast Details
        const forecast = data.forecast;
        tempElem.innerText = `${forecast.temp.toFixed(1)}°C`;
        cloudinessElem.innerText = `${forecast.cloudiness}%`;
        windElem.innerText = `${forecast.wind.toFixed(1)} m/s`;
        humidityElem.innerText = `${forecast.humidity}%`;
        pressureElem.innerText = `${forecast.pressure} hPa`;
        visibilityElem.innerText = `${forecast.visibility.toFixed(1)} km`;

        // Show the output container
        outputContainer.classList.remove("hidden");
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