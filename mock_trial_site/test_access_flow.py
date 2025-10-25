"""
Test script to demonstrate the access request popup flow
This shows how the backend sends a request and frontend receives it
"""

import requests
import time

BASE_URL = "http://localhost:5003"


def test_access_flow():
    print("🧪 Testing Access Request Flow\n")
    print("=" * 60)

    # Step 1: Check initial state
    print("\n1️⃣ Checking initial state...")
    response = requests.get(f"{BASE_URL}/api/check-access-request")
    data = response.json()
    print(f"   Active: {data['active']}")
    print(f"   Message: {data['message']}")

    # Step 2: Trigger access request
    print("\n2️⃣ Triggering access request...")
    response = requests.post(f"{BASE_URL}/api/request-access")
    trigger_data = response.json()
    print(f"   Success: {trigger_data['success']}")
    print(f"   Message: {trigger_data['message']}")

    # Step 3: Check that request is now active
    print("\n3️⃣ Checking if request is now active...")
    time.sleep(0.5)  # Small delay
    response = requests.get(f"{BASE_URL}/api/check-access-request")
    data = response.json()
    print(f"   Active: {data['active']}")
    print(f"   Message: '{data['message']}'")

    if data["active"]:
        print("   ✅ Access request is ACTIVE - Frontend should show popup now!")
        print("\n   📱 Open the frontend at http://localhost:3000")
        print("   👀 You should see a popup asking 'Give access to the system?'")

    # Step 4: Simulate user response (Yes)
    print("\n4️⃣ Simulating user response (Granting access)...")
    time.sleep(2)  # Wait a bit to show the popup
    response = requests.post(f"{BASE_URL}/api/access-response", json={"granted": True})
    response_data = response.json()
    print(f"   Success: {response_data['success']}")
    print(f"   Granted: {response_data['granted']}")
    print(f"   Message: {response_data['message']}")

    # Step 5: Verify request is cleared
    print("\n5️⃣ Verifying request is cleared...")
    response = requests.get(f"{BASE_URL}/api/check-access-request")
    data = response.json()
    print(f"   Active: {data['active']}")
    print(f"   Message: '{data['message']}'")

    if not data["active"]:
        print("   ✅ Access request is cleared!")

    print("\n" + "=" * 60)
    print("\n✅ Test completed!")
    print("\n📋 Summary:")
    print("   1. POST to /api/request-access sets request to active")
    print("   2. Frontend polls /api/check-access-request every 5 seconds")
    print("   3. When active=true, frontend shows popup")
    print("   4. User clicks Yes/No, frontend sends to /api/access-response")
    print("   5. Backend clears the request (active=false)")
    print("\n💡 Try it:")
    print("   1. Start backend: python app.py")
    print("   2. Start frontend: npm start")
    print("   3. Open browser to http://localhost:3000")
    print("   4. Run this test: python test_access_flow.py")
    print("   5. Watch the popup appear!")


if __name__ == "__main__":
    try:
        test_access_flow()
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to backend at http://localhost:5003")
        print("   Make sure the backend is running: python app.py")
    except Exception as e:
        print(f"❌ Error: {e}")
