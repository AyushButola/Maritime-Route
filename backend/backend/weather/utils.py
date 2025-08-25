import requests
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model

# -------------------------------
# CONFIG
# -------------------------------
API_KEY = os.getenv("API_KEY")   # OpenWeather API Key
R = 6371  # Earth radius in km

# ML model paths
MODEL_PATH = "ml-model/weather_rnn_model.h5"
SCALER_PATH = "ml-model/weather_scaler.pkl"
ENCODER_PATH = "ml-model/weather_label_encoder.pkl"
FEATURES_PATH = "ml-model/weather_features.pkl"

# -------------------------------
# Load ML artifacts ONCE at import
# -------------------------------
try:
    model = load_model(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    label_encoder = joblib.load(ENCODER_PATH)
    train_features = joblib.load(FEATURES_PATH)
except Exception as e:
    print(f"[WARNING] Could not load ML model/scaler/encoder: {e}")
    model, scaler, label_encoder, train_features = None, None, None, None

timesteps = 5


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
    return data.get("list", [])


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
        "wind_speed": response["wind"]["speed"]
    }

    df = pd.DataFrame([api_data])

    # Ensure same feature order as training
    for col in train_features:
        if col not in df.columns:
            df[col] = 0
    df = df[train_features]

    return df, api_data


def predict_weather_from_api(lat, lon):
    """Fetch → preprocess → predict with ML model"""
    if model is None or scaler is None or label_encoder is None:
        raise Exception("ML model/scaler/encoder not loaded.")

    df, api_data = get_weather_features(lat, lon)

    # Scale features
    X_scaled = scaler.transform(df)

    # Sequence for RNN
    X_seq = np.array([np.tile(X_scaled, (timesteps, 1))])

    # Predict
    pred = model.predict(X_seq)
    pred_label = label_encoder.inverse_transform([np.argmax(pred)])

    return pred_label[0], api_data
