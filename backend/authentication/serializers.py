from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User
import datetime

# general user serializer:
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'username', 'date_of_birth', 'field_of_work', 'date_joined']
        read_only_fields = ('id', 'date_joined')
# TODO: Studying the serialyzer documentation when having the internet.
    def to_representation(self, instance):
        data = super().to_representation(instance)
        print(f"debug representational data: {data}")
        if instance.user_type == 'costumer':
            data.pop('field_of_work', None)
        elif instance.user_type == 'company':
            data.pop('birth_date', None)
        return data
    
# login user serializer:
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Invalid email or password.")
            if not user.is_active:
                raise serializers.ValidationError("user acount is disabled.")
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError("Must include email and passwrd.")
        
# when the user is a costumer:
class CostumerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'date_of_birth', 'password', 'password_confirm')


    def validate(self, attrs):
        #check if password and password_confirm match.
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password confirmation doesn't match")
       
        #check if the user is at least 18 years old.
        dob = attrs.get('date_of_birth')
        if dob:
            today = datetime.date.today()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day)) # full difrence  minus year if the birthday happened or not.
            if age < 18:
                raise serializers.ValidationError("You must be at least 18 years old to register.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')  # you had a typo 'passwor_confirm'
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            user_type='costumer',
            date_of_birth=validated_data['date_of_birth']
        )
        return user


class CompanyRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    # field_of_work choices are in the model.
    class Meta:
        model = User
        fields = ('email', 'username', 'field_of_work', 'password', 'password_confirm')

    def validate(self, data):
        print(f"the data in the company serializer is: {data}")
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Password confirmation doesn't match")
        return data
    
    def create(self, valid_data):
        valid_data.pop('password_confirm')
        print(f"the valid data in the company serializer is: {valid_data}")
        user = User.objects.create_user(
            email=valid_data['email'],
            username=valid_data['username'],
            password=valid_data['password'],
            user_type='company',
            field_of_work=valid_data['field_of_work']
        )
        return user

