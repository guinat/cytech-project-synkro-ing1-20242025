from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DeviceTypeViewSet, DeviceViewSet, 
    DeviceDataPointViewSet, DeviceCommandViewSet,
    HomeViewSet, RoomViewSet, LightViewSet
)

router = DefaultRouter()
router.register(r'device-types', DeviceTypeViewSet)
router.register(r'devices', DeviceViewSet, basename='device')
router.register(r'data-points', DeviceDataPointViewSet, basename='datapoint')
router.register(r'commands', DeviceCommandViewSet, basename='command')
router.register(r'homes', HomeViewSet, basename='home')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'lights', LightViewSet, basename='light') 


urlpatterns = [
    path('', include(router.urls)),
] 