#!/bin/bash

# -----------------------------
# Logout Test Script
# -----------------------------

# Hardcoded token from login
TOKEN="551a4ec6d4429e8578fea6d687a54035b6bf76db"

echo "Testing logout endpoint..."

curl -X POST http://127.0.0.1:8000/authentication/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN"

echo -e "\n"
