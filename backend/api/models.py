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
