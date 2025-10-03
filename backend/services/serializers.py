from rest_framework import serializers
from .models import Service

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'  # Include all fields
        read_only_fields = ['id', 'created_at']  # These are managed by Django/database
