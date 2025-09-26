#!/bin/bash
echo "Testing costumer registration with a minor..."

curl -X POST http://127.0.0.1:8000/authentication/register_costumer/ \
  -H "Content-Type: application/json" \
  -d '{
        "email": "minor@example.com",
        "username": "minor_user",
        "date_of_birth": "2000-09-26",
        "password": "BenDoe123",
        "password_confirm": "BenDoe123"
    }'

echo -e "\n"
