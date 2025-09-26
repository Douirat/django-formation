from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

class User(AbstractUser):

    USER_TYPE_CHOICES = (
        ('costumer', 'Costumer'),
        ('company', 'Company')
    )

    FIELD_OF_WORK_CHOICES = (
        ('Air Conditioner', 'Air Conditioner'),
        ('All in One', 'All in One'),
        ('Carpentry', 'Carpentry'),
        ('Electricity', 'Electricity'),
        ('Gardening', 'Gardening'),
        ('Home Machines', 'Home Machines'),
        ('Housekeeping', 'Housekeeping'),
        ('Interior Design', 'Interior Design'),
        ('Locks', 'Locks'),
        ('Painting', 'Painting'),
        ('Plumbing', 'Plumbing'),
        ('Water Heaters', 'Water Heaters'),
    )

    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    # Costumer specific field.
    date_of_birth = models.DateField(null=True, blank=True)


    # Company specfic field.
    field_of_work = models.CharField(
        max_length=20,
        choices=FIELD_OF_WORK_CHOICES,
        null=True,
        blank=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def clean(self):
        super().clean()
        if self.user_type == 'costumer' and not  self.date_of_birth:
            raise ValidationError('Date of birth is required.')
        if self.user_type == 'company' and not self.field_of_work:
            raise ValidationError("Field of work is required.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email
    

    def get_is_costumer(self, obj):
        return obj.user_type == 'costumer'

    def get_is_company(self, obj):
        return obj.user_type == 'company'
    