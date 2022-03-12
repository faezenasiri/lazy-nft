from django.apps import AppConfig


class LazyConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'lazy'
