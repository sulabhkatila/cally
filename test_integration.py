#!/usr/bin/env python3
"""
Simple integration test to verify frontend-backend connectivity.
This script tests the same endpoints that the frontend will use.
"""

import requests
import json
import time

BASE_URL = "http://localhost:5001"


def test_backend_connectivity():
    """Test that the backend is accessible from the frontend perspective."""
    print("=" * 60)
    print("FRONTEND-BACKEND INTEGRATION TEST")
    print("=" * 60)

    # Wait a moment for server to start
    time.sleep(2)

    try:
        # Test 1: Health check
        print("1. Testing health check...")
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("   ✅ Backend is running and accessible")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False

        # Test 2: Get studies (what StudiesDashboard will call)
        print("2. Testing studies endpoint...")
        response = requests.get(f"{BASE_URL}/api/studies", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Studies endpoint working: {data['total_count']} studies")
        else:
            print(f"   ❌ Studies endpoint failed: {response.status_code}")
            return False

        # Test 3: Get users (what frontend might call)
        print("3. Testing users endpoint...")
        response = requests.get(f"{BASE_URL}/api/users", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Users endpoint working: {data['total_count']} users")
        else:
            print(f"   ❌ Users endpoint failed: {response.status_code}")
            return False

        # Test 4: Test CORS headers
        print("4. Testing CORS headers...")
        response = requests.options(f"{BASE_URL}/api/studies", timeout=5)
        cors_headers = {
            "Access-Control-Allow-Origin": response.headers.get(
                "Access-Control-Allow-Origin"
            ),
            "Access-Control-Allow-Methods": response.headers.get(
                "Access-Control-Allow-Methods"
            ),
            "Access-Control-Allow-Headers": response.headers.get(
                "Access-Control-Allow-Headers"
            ),
        }
        if cors_headers["Access-Control-Allow-Origin"] == "*":
            print("   ✅ CORS headers are properly configured")
        else:
            print(f"   ⚠️  CORS headers: {cors_headers}")

        # Test 5: Test study creation (what CreateStudy will call)
        print("5. Testing study creation...")
        test_study = {
            "title": "Frontend Integration Test Study",
            "protocol": "Test protocol for frontend integration",
            "sponsor": "Test Sponsor",
            "phase": "Phase I",
            "indication": "Test Indication",
        }
        response = requests.post(
            f"{BASE_URL}/api/studies",
            json=test_study,
            headers={"Content-Type": "application/json"},
            timeout=5,
        )
        if response.status_code == 201:
            data = response.json()
            print(f"   ✅ Study creation working: {data['study']['id']}")
        else:
            print(f"   ❌ Study creation failed: {response.status_code}")
            return False

        print("\n" + "=" * 60)
        print("🎉 ALL INTEGRATION TESTS PASSED!")
        print("The backend is ready for frontend integration.")
        print("=" * 60)
        return True

    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server.")
        print("Make sure the backend is running on http://localhost:5001")
        return False
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False


if __name__ == "__main__":
    success = test_backend_connectivity()
    exit(0 if success else 1)
