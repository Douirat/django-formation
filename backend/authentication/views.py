from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import (
    UserSerializer,
    LoginSerializer,
    CompanyRegistrationSerializer,
    CostumerRegistrationSerializer
)
from django.contrib.auth import authenticate, login, logout, get_user_model
from rest_framework.authtoken.models import Token
# from django.contrib.auth import get_user_model

# Customer = get_user_model()  # this will get the custom user model to help with authentication and token generation and database operations.
#------------
# ===> Login:
#------------
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login API endpoint
    POST /auth/login/
    {
        "email": "user@example.com",
        "password": "password13"
    }
    """
    serialized_user = LoginSerializer(data=request.data)
    if serialized_user.is_valid():
        user = serialized_user.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,  # serialized user
                'message': "Login successful"
            },
            status=status.HTTP_200_OK
        )
    return Response(serialized_user.errors, status=status.HTTP_400_BAD_REQUEST)

#-------------
# ===> Logout:
#-------------
@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    '''
    Logout API endpoint
    POST /auth/logout
    Headers: Authorization: Token your_token_here
    '''
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    except:
        return Response({'error': 'Error logging out'}, status=status.HTTP_400_BAD_REQUEST)

# ------------------
# ===> REGISTRATION
# ------------------

# ====> Costumer:
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def customer_register_view(request):
    """
    Customer registration API endpoint
    POST /api/auth/register/customer/
    {
        "email": "customer@example.com",
        "username": "customer_name",
        "date_of_birth": "1990-01-01",
        "password": "password123",
        "password_confirm": "password123"
    }
    """
    costumer_serializer = CostumerRegistrationSerializer(data=request.data)
    if costumer_serializer.is_valid():
        user = costumer_serializer.save()
        print
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "token": token.key,
                "user": UserSerializer(user).data,
                'messsage': 'Costumer registration successful'
            },
            status=status.HTTP_200_OK
        )
    return Response(costumer_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ====> Company:
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def company_register_view(request):
    """
    Company registration API endpoint
    POST /api/auth/register/company/
    {
        "email": "company@example.com",
        "username": "company_name",
        "field_of_work": "Plumbing",
        "password": "password123",
        "password_confirm": "password123"
    }
    """
    serialized_company = CompanyRegistrationSerializer(data=request.data)
    if serialized_company.is_valid():
        user = serialized_company.save()
        token, _ = Token.objects.get_or_create(user=user)
        print(f"the new created company is: {user}")
        return Response(
            {
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': "Company registration successful"
            },
            status=status.HTTP_200_OK
        )
    return Response(serialized_company.errors, status=status.HTTP_400_BAD_REQUEST)