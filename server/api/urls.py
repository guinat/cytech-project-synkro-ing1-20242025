from django.urls import path, include
from . import views

urlpatterns = [
    path('users/', include('users.urls')),
]
