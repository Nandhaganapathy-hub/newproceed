from django.contrib import admin
from .models import NGO, Alert, RouteStop, Delivery, SystemPreference, PredictionLog, Footfall, SurplusFood

admin.site.register(NGO)
admin.site.register(Alert)
admin.site.register(RouteStop)
admin.site.register(Delivery)
admin.site.register(SystemPreference)
admin.site.register(PredictionLog)


@admin.register(Footfall)
class FootfallAdmin(admin.ModelAdmin):
    list_display = ('date', 'time_slot', 'student_count', 'capacity_utilization', 'surplus_plates')
    list_filter = ('time_slot', 'date')
    ordering = ('-date',)


@admin.register(SurplusFood)
class SurplusFoodAdmin(admin.ModelAdmin):
    list_display = ('dish_name', 'quantity_kg', 'status', 'is_distributed', 'distributed_to', 'created_at')
    list_filter = ('status', 'is_distributed')
    search_fields = ('dish_name',)

