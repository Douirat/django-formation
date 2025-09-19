from django.db import models

class Customer(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=128)

    def __str__(self):
        return self.username

# CREATE TABLE Customer (
#     id INT AUTO_INCREMENT PRIMARY KEY,   -- automatically added by Django
#     email VARCHAR(254) UNIQUE NOT NULL,  -- EmailField translates to VARCHAR in most databases
#     password VARCHAR(128) NOT NULL,      -- CharField with max length 128
#     username VARCHAR(150) UNIQUE NOT NULL
# );
#  under the hood, Django will create a table named "customers_customer" (appname_modelname)
