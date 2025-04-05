from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DeviceTypeViewSet, DeviceViewSet, 
    DeviceDataPointViewSet, DeviceCommandViewSet,
    HomeViewSet, RoomViewSet
)

router = DefaultRouter()
router.register(r'device-types', DeviceTypeViewSet)
router.register(r'devices', DeviceViewSet)
router.register(r'data-points', DeviceDataPointViewSet)
router.register(r'commands', DeviceCommandViewSet)
router.register(r'homes', HomeViewSet, basename='home')
router.register(r'rooms', RoomViewSet, basename='room')

urlpatterns = [
    path('', include(router.urls)),
] 