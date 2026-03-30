from django.contrib import admin
from .models import NGO, Alert, RouteStop, Delivery

admin.site.register(NGO)
admin.site.register(Alert)
admin.site.register(RouteStop)
admin.site.register(Delivery)
