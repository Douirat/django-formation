#!/bin/bash

# -----------------------------
# Logout Test Script
# -----------------------------

# Hardcoded token from login
TOKEN="5353caeb24a21f873ec81014db99077ab030ed13"

echo "Testing logout endpoint with token: $TOKEN"

curl -X POST http://127.0.0.1:8000/customers/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN"

echo -e "\n"
