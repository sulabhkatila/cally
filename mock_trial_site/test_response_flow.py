#!/usr/bin/env python3
"""
Test script for the access request/response flow
"""
import requests
import time

BACKEND_URL = "http://localhost:5500"

print("🧪 Testing Access Request/Response Flow")
print("=" * 60)

# Step 1: Trigger access request
print("\n1️⃣ Triggering access request...")
try:
    response = requests.post(f"{BACKEND_URL}/api/request-access")
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Access request sent: {data['message']}")
    else:
        print(f"   ❌ Failed to send request: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Step 2: Check response status (should be pending)
print("\n2️⃣ Checking response status (should be pending)...")
try:
    response = requests.get(f"{BACKEND_URL}/api/check-access-response")
    if response.status_code == 200:
        data = response.json()
        print(f"   Status: {data['status']}")
        print(f"   Pending: {data['pending']}")
        assert data['status'] == 'pending', "Expected status to be 'pending'"
        print("   ✅ Status is 'pending' as expected")
    else:
        print(f"   ❌ Failed to check status: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Step 3: Simulate user granting access
print("\n3️⃣ Simulating user response: GRANTED...")
try:
    response = requests.post(
        f"{BACKEND_URL}/api/access-response",
        json={"granted": True}
    )
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Response sent: {data['message']}")
    else:
        print(f"   ❌ Failed to send response: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Step 4: Check response status (should be granted)
print("\n4️⃣ Checking response status (should be granted)...")
try:
    response = requests.get(f"{BACKEND_URL}/api/check-access-response")
    if response.status_code == 200:
        data = response.json()
        print(f"   Status: {data['status']}")
        print(f"   Granted: {data['granted']}")
        assert data['status'] == 'granted', "Expected status to be 'granted'"
        print("   ✅ Status is 'granted' as expected")
    else:
        print(f"   ❌ Failed to check status: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Test denied flow
print("\n" + "=" * 60)
print("🔄 Testing DENIED flow...")

# Trigger new request
print("\n5️⃣ Triggering new access request...")
try:
    response = requests.post(f"{BACKEND_URL}/api/request-access")
    if response.status_code == 200:
        print("   ✅ Access request sent")
    else:
        print(f"   ❌ Failed: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Simulate denied response
print("\n6️⃣ Simulating user response: DENIED...")
try:
    response = requests.post(
        f"{BACKEND_URL}/api/access-response",
        json={"granted": False}
    )
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Response sent: {data['message']}")
    else:
        print(f"   ❌ Failed to send response: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Check response status (should be denied)
print("\n7️⃣ Checking response status (should be denied)...")
try:
    response = requests.get(f"{BACKEND_URL}/api/check-access-response")
    if response.status_code == 200:
        data = response.json()
        print(f"   Status: {data['status']}")
        print(f"   Denied: {data['denied']}")
        assert data['status'] == 'denied', "Expected status to be 'denied'"
        print("   ✅ Status is 'denied' as expected")
    else:
        print(f"   ❌ Failed to check status: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

print("\n" + "=" * 60)
print("✅ ALL TESTS PASSED!")
print("\nThe access request/response flow is working correctly.")
print("The SDV frontend can now poll for responses and display them.")
