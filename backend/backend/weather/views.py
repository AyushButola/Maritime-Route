from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests

from .utils import (
    get_5day_forecast,
    move_north,
    predict_weather_from_api,
    get_graph_data,
    calculate_route_weather,
    calculate_fog_percentage,
     calculate_alert_level
)

API_KEY = "efe89ee12c2c4e8cd6e027fcf9504f15"



def calculate_fog_percentage(visibility):
    return max(0, min(100, (10000 - visibility) / 100))

def calculate_alert_level(alerts):
    return len(alerts) * 10  # simple example

@api_view(["GET"])
def weather_analytics_view(request):
    lat = request.GET.get("lat")
    lon = request.GET.get("lon")

    if not lat or not lon:
        return Response({"error": "lat and lon are required"}, status=400)

    try:
        # Get live weather data
        url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        response = requests.get(url).json()

        # Extract required fields
        visibility = response.get("visibility", 10000)
        alerts = []

        if "rain" in response:
            alerts.append("🌧️ Rain")
        if response.get("weather", [{}])[0].get("main", "").lower() in ["thunderstorm", "storm"]:
            alerts.append("⚡ Thunderstorm")
        if visibility < 3000:
            alerts.append("🌫️ Fog")

        # Compute percentages
        fog = calculate_fog_percentage(visibility)
        alert_level = calculate_alert_level(alerts)

        return Response({
            "fog_detection": fog,
            "alert_level": alert_level,
            "alerts": alerts
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
def forecast_view(request):
    try:
        # --- Input validation ---
        lat_param = request.query_params.get("lat")
        lon_param = request.query_params.get("lon")
        if not lat_param or not lon_param:
            return Response({"error": "Missing required parameters: lat, lon"}, status=400)

        lat = float(lat_param)
        lon = float(lon_param)
        km_north = float(request.query_params.get("km", 100))

        # --- Move location north ---
        new_lat, new_lon = move_north(lat, lon, km_north)

        # --- Forecast data ---
        forecast_list = get_5day_forecast(lat,lon)

        # --- ML Prediction + alerts ---
        try:
            prediction_result = predict_weather_from_api(lat, lon)
            predicted_label = prediction_result["prediction"]
            api_data = prediction_result["api_data"]
            weather_alerts = prediction_result["alerts"]
        except Exception as ml_error:
            predicted_label = None
            api_data = {}
            weather_alerts = [f"⚠️ ML model error: {str(ml_error)}"]

        return Response({
            "lat": new_lat,
            "lon": new_lon,
            "api_weather_data": api_data,
            "ml_prediction": predicted_label,
            "forecast": forecast_list,
            "alerts": weather_alerts
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
def graph_data_view(request):
    try:
        # --- Input validation ---
        lat_param = request.query_params.get("lat")
        lon_param = request.query_params.get("lon")
        if not lat_param or not lon_param:
            return Response({"error": "Missing required parameters: lat, lon"}, status=400)

        lat = float(lat_param)
        lon = float(lon_param)

        # --- Graph data ---
        data = get_graph_data(lat, lon)
        return Response(data)

    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['GET'])
def route_weather(request):
    try:
        lat1 = float(request.query_params.get("lat1"))
        lon1 = float(request.query_params.get("lon1"))
        lat2 = float(request.query_params.get("lat2"))
        lon2 = float(request.query_params.get("lon2"))
        speed = float(request.query_params.get("speed"))

        result = calculate_route_weather(lat1, lon1, lat2, lon2, speed)
        return Response(result)

    except Exception as e:
        return Response({"error": str(e)}, status=400)