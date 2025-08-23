from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import (
    get_5day_forecast,
    move_north,
    predict_weather_from_api,
    get_graph_data
)


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
        forecast_list = get_5day_forecast(new_lat, new_lon)

        # --- ML Prediction + alerts ---
        try:
            prediction_result = predict_weather_from_api(new_lat, new_lon)
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
