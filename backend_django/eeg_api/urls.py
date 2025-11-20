"""
EEG API URL Configuration
"""
from django.urls import path
from . import views

urlpatterns = [
    path('health', views.health_check, name='health'),
    path('eeg-info', views.get_eeg_info, name='eeg-info'),
    path('eeg-data', views.get_eeg_data, name='eeg-data'),
    path('eeg-topomap/<float:time_point>', views.generate_topomap, name='eeg-topomap'),
    path('eeg-psd', views.get_psd, name='eeg-psd'),
    path('eeg-bands', views.get_frequency_bands, name='eeg-bands'),
]
