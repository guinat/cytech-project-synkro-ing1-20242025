from django.urls import path, include
from .views import ApiRoot

urlpatterns = [
    path('', ApiRoot.as_view(), name='api-root'),
]

api_patterns = [
    path('users/', include('users.urls')),
    path('auth/', include('auth.urls')),
    path('me/', include('users.me_urls')),
    path('homes/', include('homes.urls')),
    path('rooms/', include('rooms.urls')),
    path('devices/', include('devices.urls')),
]