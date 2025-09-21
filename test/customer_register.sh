#!/bin/bash

URL="http://127.0.0.1:8000/customers/register/"

echo "Testing registration endpoint..."

curl -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com",
    "password": "secret123",
    "username": "tester3",
    "birth_date": "1995-05-20"
  }'

echo -e "\n"
# python manage.py makemigrations
# python manage.py migrate
