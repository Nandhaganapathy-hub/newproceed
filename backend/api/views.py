from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .models import NGO, Alert, RouteStop, Delivery, SystemPreference, PredictionLog, Footfall, SurplusFood
from .serializers import (
    NGOSerializer, AlertSerializer, RouteStopSerializer,
    DeliverySerializer, SystemPreferenceSerializer, PredictionLogSerializer,
    FootfallSerializer, SurplusFoodSerializer
)
from . import ml_engine
from .firebase_config import get_firestore_db
from firebase_admin import firestore

class NGOViewSet(viewsets.ModelViewSet):
    queryset = NGO.objects.all()
    serializer_class = NGOSerializer

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.all().order_by('-created_at')
    serializer_class = AlertSerializer

class RouteStopViewSet(viewsets.ModelViewSet):
    queryset = RouteStop.objects.all()
    serializer_class = RouteStopSerializer

class DeliveryViewSet(viewsets.ModelViewSet):
    queryset = Delivery.objects.all()
    serializer_class = DeliverySerializer

class SystemPreferenceViewSet(viewsets.ModelViewSet):
    queryset = SystemPreference.objects.all()
    serializer_class = SystemPreferenceSerializer

class PredictionLogViewSet(viewsets.ModelViewSet):
    queryset = PredictionLog.objects.all()
    serializer_class = PredictionLogSerializer


class FootfallViewSet(viewsets.ModelViewSet):
    queryset = Footfall.objects.all()
    serializer_class = FootfallSerializer


class SurplusFoodViewSet(viewsets.ModelViewSet):
    queryset = SurplusFood.objects.all()
    serializer_class = SurplusFoodSerializer

    @action(detail=True, methods=['post'])
    def distribute(self, request, pk=None):
        """Mark surplus food as distributed to a specific NGO."""
        surplus = self.get_object()
        ngo_id = request.data.get('ngo_id')
        if not ngo_id:
            return Response({'error': 'ngo_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            ngo = NGO.objects.get(pk=ngo_id)
        except NGO.DoesNotExist:
            return Response({'error': 'NGO not found'}, status=status.HTTP_404_NOT_FOUND)
        surplus.is_distributed = True
        surplus.status = 'distributed'
        surplus.distributed_to = ngo
        surplus.distributed_at = timezone.now()
        surplus.save()
        return Response(SurplusFoodSerializer(surplus).data, status=status.HTTP_200_OK)


# ─── ML API Endpoints ─────────────────────────────────────────────

@api_view(['POST'])
def ml_predict(request):
    """Run ML prediction for given conditions and log to DB."""
    try:
        params = request.data or {}
        result = ml_engine.predict_day(params)

        # Log prediction to database
        PredictionLog.objects.create(
            day_of_week=int(params.get('day_of_week', result['predicted_footfall'] % 7)),
            month=int(params.get('month', __import__('datetime').datetime.now().month)),
            temperature=float(params.get('temperature', 28)),
            rain_probability=float(params.get('rain_probability', 0.2)),
            campus_event=bool(params.get('campus_event', False)),
            is_holiday=bool(params.get('is_holiday', False)),
            predicted_footfall=result['predicted_footfall'],
            predicted_surplus_kg=result['predicted_surplus_kg'],
            confidence=result['confidence'],
            sensitivity=int(params.get('sensitivity', 72)),
        )

        return Response(result, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def ml_forecast(request):
    """Get 7-day waste variance forecast from ML model."""
    try:
        forecast = ml_engine.predict_week()
        return Response(forecast, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def ml_risks(request):
    """Analyze risk variables using ML feature importance."""
    try:
        risks = ml_engine.analyze_risks()
        return Response(risks, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def ml_suggestions(request):
    """Get AI-driven suggestions based on current predictions."""
    try:
        suggestions = ml_engine.get_ai_suggestion()
        return Response(suggestions, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def ml_train(request):
    """Re-train ML models with fresh synthetic data."""
    try:
        metrics = ml_engine.train_models()
        return Response(metrics, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def ml_model_info(request):
    """Get info about currently loaded ML models."""
    try:
        info = ml_engine.get_model_info()
        return Response(info, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ─── Firebase Testing ─────────────────────────────────────────────

@api_view(['GET'])
def firebase_test_connection(request):
    """Test connection to Firebase Firestore Database."""
    try:
        db = get_firestore_db()
        # A simple write to test connectivity
        doc_ref = db.collection('test_connection').document('status')
        doc_ref.set({
            'connected': True,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'message': 'Successfully connected Django to Firebase Firestore!'
        })
        
        # Read it back to verify
        doc = doc_ref.get()
        return Response(doc.to_dict(), status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
