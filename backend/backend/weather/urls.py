# urls.py
from django.urls import path
from .views import forecast_view,graph_data_view

urlpatterns = [
    path("forecast/", forecast_view, name="forecast"),
     path('graph/', graph_data_view, name='graph-data'),
]