from django.urls import path, include
from . import views

urlpatterns = [
    # API root
    path('', views.api_root, name='api-root'),
    
    path('users/', include('users.urls')),
    path('devices/', include('devices.urls')),
    
]
