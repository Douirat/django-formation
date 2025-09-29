from .serializers import ServiceSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def create_service_view(request):
    user = request.user
    print(f"called from user: {user}")
    
    return Response(
        "message", "tested for good.",
        status=status.HTTP_200_OK
    )
