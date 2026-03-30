from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NGOViewSet, AlertViewSet, RouteStopViewSet, DeliveryViewSet,
    SystemPreferenceViewSet, PredictionLogViewSet,
    FootfallViewSet, SurplusFoodViewSet,
    ml_predict, ml_forecast, ml_risks, ml_suggestions, ml_train, ml_model_info,
    firebase_test_connection
)

router = DefaultRouter()
router.register(r'ngos', NGOViewSet)
router.register(r'alerts', AlertViewSet)
router.register(r'routes', RouteStopViewSet)
router.register(r'deliveries', DeliveryViewSet)
router.register(r'preferences', SystemPreferenceViewSet)
router.register(r'predictions', PredictionLogViewSet)
router.register(r'footfall', FootfallViewSet)
router.register(r'surplus', SurplusFoodViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # ML API endpoints
    path('ml/predict/', ml_predict, name='ml-predict'),
    path('ml/forecast/', ml_forecast, name='ml-forecast'),
    path('ml/risks/', ml_risks, name='ml-risks'),
    path('ml/suggestions/', ml_suggestions, name='ml-suggestions'),
    path('ml/train/', ml_train, name='ml-train'),
    path('ml/model-info/', ml_model_info, name='ml-model-info'),
    path('firebase-test/', firebase_test_connection, name='firebase-test'),
]
