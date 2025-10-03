from .serializers import ServiceSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from .models import Service


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def create_service_view(request):
    data = request.data.copy()
    data['company'] = request.user.id
    serialized_service = ServiceSerializer(data=data)
    if serialized_service.is_valid():
        service = serialized_service.save()  # Use .save() instead of create()
        return Response(
            {"message": "Service created successfully"},
            status=status.HTTP_201_CREATED
        )
    print(f"ERROR: {serialized_service.errors}")
    return Response(
        {"message": serialized_service.errors},
        status=status.HTTP_400_BAD_REQUEST
    )
