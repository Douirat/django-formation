from rest_framework import serializers
from .models import Service

# create a service serializer:
class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['id', 'company', 'name', 'description', 'price_per_hour', 'field', 'created_at']

