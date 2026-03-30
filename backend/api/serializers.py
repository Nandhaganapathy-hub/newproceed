from rest_framework import serializers
from .models import NGO, Alert, RouteStop, Delivery, SystemPreference, PredictionLog, Footfall, SurplusFood

class NGOSerializer(serializers.ModelSerializer):
    class Meta:
        model = NGO
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'

class RouteStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStop
        fields = '__all__'

class DeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery
        fields = '__all__'

class SystemPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemPreference
        fields = '__all__'

class PredictionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionLog
        fields = '__all__'

class FootfallSerializer(serializers.ModelSerializer):
    capacity_utilization = serializers.SerializerMethodField()
    surplus_plates = serializers.SerializerMethodField()

    class Meta:
        model = Footfall
        fields = '__all__'

    def get_capacity_utilization(self, obj):
        return obj.capacity_utilization()

    def get_surplus_plates(self, obj):
        return obj.surplus_plates()

class SurplusFoodSerializer(serializers.ModelSerializer):
    calculated_surplus = serializers.SerializerMethodField()
    distributed_to_name = serializers.SerializerMethodField()

    class Meta:
        model = SurplusFood
        fields = '__all__'

    def get_calculated_surplus(self, obj):
        return obj.calculate_surplus()

    def get_distributed_to_name(self, obj):
        return obj.distributed_to.name if obj.distributed_to else None
