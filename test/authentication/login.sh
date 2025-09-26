#!/bin/bash
echo "Testing login endpoint..."

curl -X POST http://127.0.0.1:8000/authentication/login/ \
  -H "Content-Type: application/json" \
  -d '{
        "email": "company@example.com",
        "password": "BenDoe123"
    }'

echo -e "\n"
