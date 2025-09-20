from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'email', 'password', 'username', 'birth_date']
        extra_kwargs = {
            'password': {'write_only': True}
        }
#  ModelSerializer is a shortcut that automatically creates a serializer class
#  based on a Django model. It introspects the model to determine the fields and
#  their types, reducing boilerplate code.