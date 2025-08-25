# urls.py
from django.urls import path
from .views import forecast_view,graph_data_view,route_weather,weather_analytics_view

urlpatterns = [
    path("forecast/", forecast_view, name="forecast"),
    path('graph/', graph_data_view, name='graph-data'),
    path("route-weather/", route_weather, name="route-weather"),
    path("analytics/",weather_analytics_view,name="analytics")
]