from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import get_5day_forecast, move_north, predict_weather_from_api

@api_view(['GET'])
def forecast_view(request):
    """
    Example: /api/forecast?lat=30.3165&lon=78.0322
    - Takes current coordinates (lat, lon).
    - Moves 100 km north.
    - Returns:
        - New coordinates
        - 5-day forecast from OpenWeather
        - ML predicted weather label
    """
    try:
        # Get lat/lon from request
        lat = float(request.query_params.get("lat"))
        lon = float(request.query_params.get("lon"))
        km_north = 100  # distance to move north

        # Calculate new location
        new_lat, new_lon = move_north(lat, lon, km_north)

        # Get OpenWeather 5-day forecast
        forecast_list = get_5day_forecast(new_lat, new_lon)

        # Get ML prediction
        predicted_label, api_data = predict_weather_from_api(new_lat, new_lon)

        return Response({
            "lat": new_lat,
            "lon": new_lon,
            "api_weather_data": api_data,          # raw features used
            "ml_prediction": predicted_label,      # RNN output
            "forecast": forecast_list              # 5-day forecast
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)
