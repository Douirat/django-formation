#!/bin/bash

URL="http://127.0.0.1:8000/customers/login/"

echo "Testing login endpoint..."

curl -X POST http://127.0.0.1:8000/customers/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tester3",
    "password": "secret123"
  }'

echo -e "\n"
