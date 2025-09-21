#!/bin/bash

# -----------------------------
# Logout Test Script
# -----------------------------

# Hardcoded token from login
TOKEN="ca869656913bba3dcaed3c6e9a78496a7252e3be"

echo "Testing logout endpoint with token: $TOKEN"

curl -X POST http://127.0.0.1:8000/customers/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN"

echo -e "\n"
