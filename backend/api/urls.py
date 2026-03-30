from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NGOViewSet, AlertViewSet, RouteStopViewSet, DeliveryViewSet

router = DefaultRouter()
router.register(r'ngos', NGOViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'routes', RouteStopViewSet)
router.register(r'deliveries', DeliveryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
