from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import CustomerSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

Customer = get_user_model()  # this will get the custom user model to help with authentication and token generation and database operations.

# -------------
# REGISTRATION
# -------------

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow any user (authenticated or not) to access this view
def register_customer(request):
    print
    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
            validated_data = serializer.validated_data
            print(f'Validated data: {validated_data}')  # Debug
            password = validated_data.pop('password')
            user = Customer(**validated_data)
            user.set_password(password)  # Hash the password
            user.save()
            print(f'User {user.username} created successfully.')  # Debug
            token, created = Token.objects.get_or_create(user=user)
            if created:
                print(f'Token created for user {user.username}: {token.key}')
            else:
                print(f'Token already exists for user {user.username}: {token.key}')

            return Response(
            {
                'token': token.key,
                'customer': CustomerSerializer(user).data
            },
        status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# -------------
# LOGIN
# -------------
@api_view(['POST'])
@permission_classes([AllowAny])  # Allow any user (authenticated or not) to access.
def login_customer(request):
    username = request.data.get('username')
    password = request.data.get('password')
    print(f'Attempting to authenticate user with username: {username}')
    user = authenticate(username=username, password=password)
    print(f'Authentication result for user {username}: {user}')  # Debug
    
    if user:
        token, created = Token.objects.get_or_create(user = user)
        if created:
            print(f'Token created for user {user.username}: {token.key}')
        else:
            print(f'Token already exists for user {user.username}: {token.key}')
            return Response(
                {
                    'token': token.key,
                    'customer': CustomerSerializer(user).data
                },
                status=status.HTTP_200_OK
            )
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# -------------
# LOGOUT
# -------------


@api_view(['POST'])
@permission_classes([AllowAny])  # Allow any user (authenticated or not) to access.
@csrf_exempt
def logout_customer(request):
     user = request.user
     if user.is_authenticated:
         Token.objects.filter(user=user).delete()
         return Response({'success': 'Logged out successfully'}, status=status.HTTP_200_OK)
     return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)