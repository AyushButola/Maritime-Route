import requests
import time



# calculate next location 
def move_north(lat, lon, km):
    R = 6371  # Earth radius in km
    new_lat = lat + (km / R) * (180 / 3.14159)
    new_lon = lon
    return new_lat, new_lon




import requests

API_KEY = "efe89ee12c2c4e8cd6e027fcf9504f15"  # your working key

def get_5day_forecast(lat, lon):
    """
    Fetch the full 5-day / 3-hour forecast from OpenWeather
    for the given latitude and longitude.
    Returns the list of forecast entries.
    """
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    response = requests.get(url)

    if response.status_code != 200:
        raise Exception(f"API request failed: {response.status_code}, {response.text}")

    data = response.json()
    # Return the full list of forecasts (~40 entries)
    return data.get("list", [])

