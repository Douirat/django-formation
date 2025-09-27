from django.urls import path
from . import views


urlpatterns = [
    path('register_costumer/', views.costumer_register_view, name='register_costumer'),
    path('register_company/', views.company_register_view, name='register_company'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('authenticate/', views.authenticate_view, name='authenticate'),
   # add profile and update profile paths later.
]