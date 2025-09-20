from django.db import models
from django.contrib.auth.models import AbstractUser

from django.db import models
from django.contrib.auth.models import AbstractUser

class Customer(AbstractUser):
    email = models.EmailField(unique=True)
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.username


'''
CREATE TABLE customers_customer (
    id SERIAL PRIMARY KEY,               -- Auto-incremented ID
    email VARCHAR(254) NOT NULL UNIQUE,  -- Email, unique
    username VARCHAR(150) NOT NULL,      -- Username
    password VARCHAR(128) NOT NULL,      -- Password
    birth_date DATE NOT NULL             -- Required birth date
);
#  under the hood, Django will create a table named "customers_customer" (appname_modelname)
'''
