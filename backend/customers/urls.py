from django.urls import path
from . import views


urlpatterns = [
    path('register/', views.register_customer, name='register'),
    path('login/', views.login_customer, name='login_customer'),
    path('logout/', views.logout_customer, name='logout_customer')
# add profile and update profile paths later.
]