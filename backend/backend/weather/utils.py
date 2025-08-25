import os
import requests
import pandas as pd
import numpy as np
import joblib
from django.conf import settings
from tensorflow.keras.models import load_model
import math
from datetime import datetime, timedelta

# -------------------------------
# CONFIG
# -------------------------------
API_KEY = "efe89ee12c2c4e8cd6e027fcf9504f15"   # OpenWeather API Key
R = 6371  # Earth radius in km
timesteps = 5
APP_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths to ML artifacts
MODEL_PATH = os.path.join(APP_DIR, "ml-model", "weather_rnn_model.h5")
SCALER_PATH = os.path.join(APP_DIR, "ml-model", "weather_scaler.pkl")
ENCODER_PATH = os.path.join(APP_DIR, "ml-model", "weather_label_encoder.pkl")
FEATURES_PATH = os.path.join(APP_DIR, "ml-model", "weather_features.pkl")

# -------------------------------
# Load ML artifacts ONCE
# -------------------------------
try:
    model = load_model(MODEL_PATH, compile=False)
    scaler = joblib.load(SCALER_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    train_features = joblib.load(FEATURES_PATH)
except Exception as e:
    model, scaler, label_encoder, train_features = None, None, None, None
    load_error = str(e)
else:
    load_error = None


# -------------------------------
# GEO UTILS
# -------------------------------
def move_north(lat, lon, km):
    """Return coordinates moved km north"""
    new_lat = lat + (km / R) * (180 / 3.14159)
    new_lon = lon
    return new_lat, new_lon


# -------------------------------
# WEATHER FORECAST
# -------------------------------
def get_5day_forecast(lat, lon):
    """Fetch 5-day / 3-hour forecast list"""
    url = f"https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"API request failed: {response.status_code}, {response.text}")
    data = response.json()
    full_list= data.get("list", [])
    return full_list[:8]


# -------------------------------
# WEATHER PREDICTION UTILS
# -------------------------------
def get_weather_features(lat, lon):
    """Fetch current weather and align features with training data"""
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    response = requests.get(url).json()

    api_data = {
    "temperature": response["main"]["temp"],
    "humidity": response["main"]["humidity"],
    "pressure": response["main"]["pressure"],
    "wind_speed": response["wind"]["speed"],
    "uvi": 0,  # Not included in /weather API
    "rain_flag": 1 if response.get("rain", {}).get("1h", 0) > 0 else 0,
    "storm_flag": 1 if response.get("weather", [{}])[0].get("main", "").lower() == "thunderstorm" else 0,
    "snow_flag": 1 if response.get("snow", {}).get("1h", 0) > 0 else 0,
    "visibility": response.get("visibility", 10000)
}


    df = pd.DataFrame([api_data])

    # Ensure same feature order as training
    for col in train_features:
        if col not in df.columns:
            df[col] = 0
    df = df[train_features]

    return df, api_data


def get_weather_alerts(data):
    """Generate alerts based on weather conditions"""
    alerts = []
    if data["temperature"] > 40:
        alerts.append("⚠️ High Temperature")
    elif data["temperature"] < 5:
        alerts.append("⚠️ Low Temperature")
    if data["humidity"] > 90:
        alerts.append("⚠️ Very High Humidity")
    if data["wind_speed"] > 15:
        alerts.append("⚠️ Strong Winds")
    if data["visibility"] < 5000:
        alerts.append("⚠️ Poor Visibility")
    if data.get("uvi", 0) > 7:
        alerts.append("⚠️ High UV Index")
    if data.get("rain_flag", 0) == 1:
        alerts.append("⚠️ Rain Expected")
    if data.get("storm_flag", 0) == 1:
        alerts.append("⚠️ Storm Risk")
    if data.get("snow_flag", 0) == 1:
        alerts.append("⚠️ Snow Conditions")
    return alerts


def predict_weather_from_api(lat, lon):
    """Fetch → preprocess → predict with ML model + alerts"""
    if model is None or scaler is None or label_encoder is None:
        raise Exception(f"ML artifacts not loaded. Error: {load_error}")

    df, api_data = get_weather_features(lat, lon)

    # Scale features
    X_scaled = scaler.transform(df)

    # Sequence for RNN
    X_seq = np.array([np.tile(X_scaled, (timesteps, 1))])

    # Predict
    pred = model.predict(X_seq)
    pred_label = label_encoder.inverse_transform([np.argmax(pred)])

    weather_alerts = get_weather_alerts(api_data)

    return {
        "prediction": pred_label[0],
        "api_data": api_data,
        "alerts": weather_alerts
    }


# -------------------------------
# CHECK WATER OR LAND
# -------------------------------
def is_water(lat, lon):
    """Check if coordinates are over water using OSM + OpenWeather"""
    try:
        # ✅ First check with Nominatim (OSM)
        url = f"https://nominatim.openstreetmap.org/reverse?format=json&lat={lat}&lon={lon}"
        r = requests.get(url, headers={"User-Agent": "weather-app"}).json()

        # Check category/type fields
        if r.get("category") in ["water", "natural"] and r.get("type") in ["sea", "ocean", "bay", "reservoir", "river"]:
            return True

        display_name = r.get("display_name", "").lower()
        if any(word in display_name for word in ["sea", "ocean", "bay", "lake", "river", "water"]):
            return True

        # ✅ Fallback: use OpenWeather current API (sea_level field)
        url2 = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        res2 = requests.get(url2).json()
        if "sea_level" in res2.get("main", {}):
            return True

        return False
    except Exception:
        return False

# -------------------------------
# WEATHER GRAPH DATA (Improved)
# -------------------------------
def get_graph_data(lat, lon):
    """Return 24h forecast data (3h intervals) with wave_height estimate"""
    forecast = get_5day_forecast(lat, lon)[:9]

    temperature = [round(item['main']['temp'], 1) for item in forecast]
    wind_speed = [round(item['wind']['speed'], 1) for item in forecast]

    # ✅ Wave height estimation
    if is_water(lat, lon):
        # simple formula: wave height ~ 0.2 × wind_speed (m)
        wave_height = [round(ws * 0.2, 1) for ws in wind_speed]
    else:
        wave_height = [0 for _ in forecast]

    labels = ["Now", "3h", "6h", "9h", "12h", "15h", "18h", "21h", "24h"]

    return {
        "labels": labels,
        "temperature": temperature,
        "wind_speed": wind_speed,
        "wave_height": wave_height
    }

import requests
import math
from datetime import datetime, timedelta

#API_KEY = "0f292dd4f556d0ca5c8c2bbf5ce7c950"

# Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def get_forecast(lat2, lon2, arrival_time):
    url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat2}&lon={lon2}&appid={API_KEY}&units=metric"
    res = requests.get(url)
    data = res.json()

    if "list" not in data:
        return None

    # Find forecast closest to arrival time
    closest = min(data['list'], key=lambda x: abs(datetime.fromtimestamp(x['dt']) - arrival_time))

    return {
        "description": closest['weather'][0]['description'],
        "temp": closest['main']['temp'],
        "feels_like": closest['main']['feels_like'],
        "humidity": closest['main']['humidity'],
        "pressure": closest['main']['pressure'],
        "wind": closest['wind']['speed'],
        "cloudiness": closest['clouds']['all'],
        "visibility": closest.get('visibility', 0) / 1000,
        "rain": closest.get('rain', {}).get('3h', 0),
        "snow": closest.get('snow', {}).get('3h', 0)
    }

def calculate_route_weather(lat1, lon1, lat2, lon2, speed):
    # Distance & travel time
    distance = haversine(lat1, lon1, lat2, lon2)
    hours = distance / speed
    arrival_time = datetime.now() + timedelta(hours=hours)

    # Forecast
    forecast = get_forecast(lat2, lon2, arrival_time)

    return {
        "distance": round(distance, 2),
        "travel_time_hours": round(hours, 2),
        "travel_time_days": round(hours/24, 1),
        "arrival_time": arrival_time.strftime('%Y-%m-%d %H:%M:%S'),
        "forecast": forecast
    }
from math import ceil
def calculate_fog_percentage(visibility):
    """Return fog detection percentage based on low visibility."""
    # visibility < 1000m → 100%, 10,000m+ → 0%, linear inverse
    visibility = min(10000, max(visibility, 0))
    return ceil((1 - (visibility / 10000.0)) * 100)

def calculate_alert_level(alerts):
    """Return alert level percentage based on number of triggered alerts."""
    max_possible_alerts = 5  # Adjust as per your system
    count = len(alerts)
    return min(100, ceil((count / max_possible_alerts) * 100))