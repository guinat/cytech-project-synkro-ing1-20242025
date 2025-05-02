from django.urls import path
from .views import DeviceTypePublicListView, DeviceViewSet, DeviceCommandViewSet, HomeDeviceListView, RoomDeviceListView, EnergyConsumptionView, DeviceConsumptionHistoryView

app_name = 'devices'

urlpatterns = [

    path('consumption/history/', DeviceConsumptionHistoryView.as_view(), name='device-consumption-history'),
    path('energy/consumption/', EnergyConsumptionView.as_view(), name='energy-consumption'),

    path('device-types/', DeviceTypePublicListView.as_view(), name='device-type-public-list'),

    path('<uuid:home_pk>/rooms/<uuid:room_pk>/devices/', 
         DeviceViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='room-device-list'),
    path('<uuid:home_pk>/rooms/<uuid:room_pk>/devices/<uuid:pk>/', 
         DeviceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='room-device-detail'),

    path('<uuid:home_pk>/rooms/<uuid:room_pk>/devices/<uuid:device_pk>/commands/', 
         DeviceCommandViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='device-commands-list'),
    path('<uuid:home_pk>/rooms/<uuid:room_pk>/devices/<uuid:device_pk>/commands/<uuid:pk>/',
         DeviceCommandViewSet.as_view({'get': 'retrieve'}),
         name='device-commands-detail'),
]