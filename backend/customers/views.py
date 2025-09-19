#  Here we control the logic of our application and hande requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password # TODO: check password will be imported later for login.
from .serializers import CustomerSerializer
from .models import Customer


#1.  we need to import api_view to define the type of request (GET, POST, etc)
#  the purpose of api_view is to specify which HTTP method the views will accept.
#  ex: @api_view(['POST']) means this view will only handle POST requests.

# 2.  we import Response to send back HTTP responses from our view functions.
#  Response is a subclass of Django's standard HttpResponse that allows us to return
#  data in various formats (like JSON) and set HTTP status codes easily.

# 3. we import status to use standard HTTP status codes in our responses.

# 4.  we import check_password to verify hashed passwords during login and authentication
#  and to hash passwords before storing them in the database.

# 5.  we import CustomerSerializer to convert Customer model instances to and from JSON.
#  and we import the Customer model to interact with the database records.

# specify the method of the request:
@api_view(['post'])
def register_customer(request): # we provide the request as a parameter so the function can have access to the requested data:
    #  we create a serializer instance with the data from the request:
    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid(): # we check if the data is valid according to the serializer's rules:
        customer = Customer(
            email = serializer.validated_data['email'],
            username = serializer.validated_data['username'],
            password = make_password(serializer.validated_data['password']) 
            )# If the data is valid we extract the customer from the serializer to save it using the model in respect to the MVS: 
        customer.save() # this will save the new customer to data base because the class custemer inherits from models.Model and have access the save method.
        return Response(serializer.data, status=status.HTTP_201_CREATED) # we return the serialized data with a 201 status code (created):
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST) # if the data is not valid we return the errors with a 400 status code (bad request):

# TODO: login here later.