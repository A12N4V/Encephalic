from django.apps import AppConfig


class EegApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'eeg_api'
    verbose_name = 'EEG Analysis API'
