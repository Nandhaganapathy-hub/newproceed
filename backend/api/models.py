from django.db import models

class NGO(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    frequency = models.CharField(max_length=50)
    status = models.CharField(max_length=50) # 'verified', 'pending', 'new'
    lat = models.FloatField()
    lng = models.FloatField()
    capacity = models.IntegerField(default=100)
    reliability = models.IntegerField(default=100)
    foodType = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Alert(models.Model):
    TYPES = [('critical', 'Critical'), ('warning', 'Warning'), ('info', 'Info')]
    alert_type = models.CharField(max_length=20, choices=TYPES)
    icon = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    has_actions = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class RouteStop(models.Model):
    stop_id = models.CharField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    is_main = models.BooleanField(default=False)
    lat = models.FloatField()
    lng = models.FloatField()

    def __str__(self):
        return self.label

class Delivery(models.Model):
    name = models.CharField(max_length=100)
    items = models.CharField(max_length=200)
    weight = models.CharField(max_length=50)
    status = models.CharField(max_length=50) # 'In Transit', 'Loading', 'Queued'
    eta = models.CharField(max_length=50, null=True, blank=True)

    def __str__(self):
        return self.name

class SystemPreference(models.Model):
    # Profile
    full_name = models.CharField(max_length=100, default="Alex Rivera")
    email = models.EmailField(default="alex.rivera@ledger.org")
    phone = models.CharField(max_length=20, default="+1 (555) 042-1988")
    role = models.CharField(max_length=50, default="Canteen Manager")
    
    # System Parameters
    surplus_threshold = models.CharField(max_length=50, default="25kg (Standard)")
    prediction_model = models.CharField(max_length=50, default="Neural V4.2 (Recommended)")
    auto_redistribution = models.BooleanField(default=True)
    real_time_sensor_sync = models.BooleanField(default=True)
    predictive_route_optimization = models.BooleanField(default=False)
    
    # Communication Channels
    email_notifications = models.BooleanField(default=True)
    sms_alerts = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    ngo_broadcasts = models.BooleanField(default=True)

    def __str__(self):
        return "System Preferences"

class PredictionLog(models.Model):
    """Stores ML prediction results for historical tracking"""
    predicted_at = models.DateTimeField(auto_now_add=True)
    day_of_week = models.IntegerField()
    month = models.IntegerField()
    temperature = models.FloatField()
    rain_probability = models.FloatField()
    campus_event = models.BooleanField(default=False)
    is_holiday = models.BooleanField(default=False)
    predicted_footfall = models.IntegerField()
    predicted_surplus_kg = models.FloatField()
    actual_footfall = models.IntegerField(null=True, blank=True)
    actual_surplus_kg = models.FloatField(null=True, blank=True)
    confidence = models.FloatField()
    sensitivity = models.IntegerField(default=72)

    class Meta:
        ordering = ['-predicted_at']

    def __str__(self):
        return f"Prediction {self.predicted_at.strftime('%Y-%m-%d %H:%M')}"


class Footfall(models.Model):
    """Tracks daily canteen foot traffic by time slot."""
    TIME_SLOTS = [
        ('breakfast', 'Breakfast (7:00–9:00)'),
        ('lunch', 'Lunch (12:00–14:00)'),
        ('snacks', 'Snacks (16:00–17:30)'),
        ('dinner', 'Dinner (19:00–21:00)'),
    ]

    date = models.DateField()
    time_slot = models.CharField(max_length=20, choices=TIME_SLOTS)
    student_count = models.IntegerField(default=0)
    recorded_at = models.DateTimeField(auto_now_add=True)

    FIXED_CAPACITY = 500  # Maximum plates the canteen can serve per slot

    class Meta:
        ordering = ['-date', 'time_slot']
        unique_together = ['date', 'time_slot']  # One entry per slot per day

    def capacity_utilization(self):
        """Returns capacity utilisation as a percentage."""
        return round((self.student_count / self.FIXED_CAPACITY) * 100, 1)

    def surplus_plates(self):
        """Returns the number of unused plates for this slot."""
        return max(0, self.FIXED_CAPACITY - self.student_count)

    def __str__(self):
        return f"{self.date} | {self.get_time_slot_display()} — {self.student_count} students"


class SurplusFood(models.Model):
    """Tracks leftover food available for redistribution to NGOs."""
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('reserved', 'Reserved for NGO'),
        ('distributed', 'Distributed'),
        ('expired', 'Expired'),
    ]

    dish_name = models.CharField(max_length=200)
    quantity_kg = models.FloatField()
    is_distributed = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    footfall = models.ForeignKey(
        Footfall, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='surplus_items',
        help_text='Links surplus to the footfall record that generated it'
    )
    distributed_to = models.ForeignKey(
        NGO, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='received_surplus',
        help_text='The NGO this food was sent to'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    distributed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Surplus food'

    def calculate_surplus(self, actual_consumption_plates=None):
        """
        Calculates estimated surplus weight based on a fixed capacity of 500 plates.
        Uses the linked footfall record if available, or an explicit count.
        Formula: surplus_kg = (capacity - actual) * avg_weight_per_plate
        """
        AVG_WEIGHT_PER_PLATE_KG = 0.35  # ~350g average per plate

        if actual_consumption_plates is not None:
            unused = max(0, Footfall.FIXED_CAPACITY - actual_consumption_plates)
        elif self.footfall:
            unused = self.footfall.surplus_plates()
        else:
            return self.quantity_kg  # Fallback: return manually entered weight

        return round(unused * AVG_WEIGHT_PER_PLATE_KG, 2)

    def __str__(self):
        tag = "✅ Distributed" if self.is_distributed else "🟡 Available"
        return f"{self.dish_name} ({self.quantity_kg}kg) — {tag}"
