#!/bin/bash
echo "Testing endpoint..."

curl -X POST http://127.0.0.1:8000/authentication/register_company/ \
  -H "Content-Type: application/json" \
  -d '{
      "email": "company@example.com",
      "username": "company_name",
      "field_of_work": "Plumbing",
      "password": "BenDoe123",
      "password_confirm": "BenDoe123"
    }'

echo -e "\n"

