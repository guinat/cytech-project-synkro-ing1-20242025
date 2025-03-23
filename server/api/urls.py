from django.urls import path, include
from . import views

urlpatterns = [
    # Future API endpoints will be added here
    path('', views.api_root, name='api-root'),
    path('users/', include('users.urls')),
    path('admin/', include('users.admin_urls')),
    path('devices/', include('devices.urls')),
]
