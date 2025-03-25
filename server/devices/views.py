from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from .models import TV, Light, SmartLock
from .serializers import TVSerializer, LightSerializer, SmartLockSerializer

class TVViewSet(viewsets.ModelViewSet):
    queryset = TV.objects.all()
    serializer_class = TVSerializer

class LightViewSet(viewsets.ModelViewSet):
    queryset = Light.objects.all()
    serializer_class = LightSerializer

class SmartLockViewSet(viewsets.ModelViewSet):
    queryset = SmartLock.objects.all()
    serializer_class = SmartLockSerializer