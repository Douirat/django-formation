#!/bin/bash

URL="http://127.0.0.1:8000/customers/register/"

echo "Testing registration endpoint..."

curl -X POST $URL \
  -H "Content-Type: application/json" \
  -d '{
        "email": "test@mail.com",
        "username": "bendoe",
        "password": "pass1234"
      }'

echo -e "\n"
# python manage.py makemigrations
# python manage.py migrate
