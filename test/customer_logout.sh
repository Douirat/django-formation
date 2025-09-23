#!/bin/bash

# -----------------------------
# Logout Test Script
# -----------------------------

# Hardcoded token from login
TOKEN="110ae0b33ff8dfeadc5a3d36a1c8ee91a23e23c4"

echo "Testing logout endpoint with token: $TOKEN"

curl -X POST http://127.0.0.1:8000/customers/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN"

echo -e "\n"
