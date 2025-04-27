from django.urls import path
from .views import RoomViewSet

app_name = 'rooms' 

urlpatterns = [
    path('<uuid:home_pk>/rooms/', 
         RoomViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='room-list'),
    
    path('<uuid:home_pk>/rooms/<uuid:pk>/', 
         RoomViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='room-detail'),
] 