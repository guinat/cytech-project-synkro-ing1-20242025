from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TVViewSet, LightViewSet, SmartLockViewSet

router = DefaultRouter()
router.register(r'tv', TVViewSet)
router.register(r'lights', LightViewSet)
router.register(r'smartlock', SmartLockViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]


