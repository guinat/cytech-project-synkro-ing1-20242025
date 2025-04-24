from django.urls import path
from .views import HomeViewSet, HomeInvitationViewSet
from devices.views import HomeDeviceListView, DeviceViewSet, DeviceCommandViewSet
from rooms.views import RoomViewSet

app_name = 'homes'

urlpatterns = [
    path('', 
         HomeViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='home-list'),
    
    path('<uuid:pk>/', 
         HomeViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='home-detail'),
    
    path('<uuid:pk>/set_primary/', 
         HomeViewSet.as_view({'post': 'set_primary'}),
         name='home-set-primary'),
    
    path('<uuid:home_pk>/devices/',
         HomeDeviceListView.as_view(),
         name='home-device-list'),

    path('<uuid:home_pk>/rooms/',
         RoomViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='room-list'),
    path('<uuid:home_pk>/rooms/<uuid:pk>/',
         RoomViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='room-detail'),

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

    path('<uuid:home_pk>/invitations/', 
         HomeInvitationViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='home-invitations-list'),
    
    path('<uuid:home_pk>/invitations/<uuid:pk>/', 
         HomeInvitationViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}),
         name='home-invitation-detail'),

    path('invitations/accept-by-token/',
         HomeInvitationViewSet.as_view({'post': 'accept_by_token'}),
         name='accept-invitation-by-token'),

    path('invitations/reject-by-token/',
         HomeInvitationViewSet.as_view({'post': 'reject_by_token'}),
         name='reject-invitation-by-token'),
] 