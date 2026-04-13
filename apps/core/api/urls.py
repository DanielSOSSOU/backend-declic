from django.urls import path

from .views import HealthcheckAPIView

urlpatterns = [
    path('health/', HealthcheckAPIView.as_view(), name='healthcheck'),
]