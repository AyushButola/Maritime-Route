from django.shortcuts import render

# Create your views here.
# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import get_5day_forecast, move_north

@api_view(['GET'])
def forecast_view(request):
    """
    Frontend sends ?lat=...&lon=...
    Backend calculates a point 100km north and returns 5-day / 3-hour forecast.
    """
    try:
        # Get current coordinates from request query params
        lat = float(request.query_params.get("lat"))
        lon = float(request.query_params.get("lon"))
        km_north = 100  # distance to move north

        # Calculate new lat/lon
        new_lat, new_lon = move_north(lat, lon, km_north)

        # Fetch 5-day / 3-hour forecast
        forecast_list = get_5day_forecast(new_lat, new_lon)

        # Return the forecast directly (no serializer needed)
        return Response({"lat": new_lat, "lon": new_lon, "forecast": forecast_list})

    except Exception as e:
        return Response({"error": str(e)}, status=400)
