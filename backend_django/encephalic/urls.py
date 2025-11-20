"""
URL configuration for Encephalic project.
"""
from django.urls import path, include

urlpatterns = [
    path('api/', include('eeg_api.urls')),
]
