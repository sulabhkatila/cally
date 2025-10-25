"""
Test script to verify the complete mock trial site flow
Tests backend API and frontend connectivity
"""

import requests
import time
import webbrowser


def test_backend_api(backend_port=5500):
    """Test backend API endpoints"""
    print("🧪 Testing Mock Trial Site Backend API\n")
    print("=" * 50)

    base_url = f"http://localhost:{backend_port}"

    # Test health endpoint
    print("1️⃣ Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Backend is healthy")
            print(f"   📁 Data directory: {data['data_directory']}")
            print(f"   📍 Data exists: {data['data_directory_exists']}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Cannot connect to backend: {e}")
        return False

    # Test patients endpoint
    print("\n2️⃣ Testing patients endpoint...")
    try:
        response = requests.get(f"{base_url}/api/patients")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Found {data['total_patients']} patients")

            for patient_id, patient_data in data["patients"].items():
                print(f"   👤 {patient_id}: {patient_data['file_count']} documents")
                for file in patient_data["files"][:3]:  # Show first 3 files
                    print(f"      📄 {file['filename']}")
                if len(patient_data["files"]) > 3:
                    print(f"      ... and {len(patient_data['files']) - 3} more")
        else:
            print(f"   ❌ Patients endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error fetching patients: {e}")
        return False

    return True


def test_frontend():
    """Test frontend connectivity"""
    print("\n3️⃣ Testing frontend connectivity...")
    try:
        response = requests.get("http://localhost:3002")
        if response.status_code == 200:
            if "Hospital Document Management" in response.text:
                print("   ✅ Frontend is running and accessible")
                return True
            else:
                print("   ❌ Frontend content doesn't match expected")
                return False
        else:
            print(f"   ❌ Frontend not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Cannot connect to frontend: {e}")
        return False


def test_access_request_flow():
    """Test the access request flow"""
    print("\n4️⃣ Testing access request flow...")

    base_url = "http://localhost:5500"

    # Trigger access request
    try:
        response = requests.post(f"{base_url}/api/request-access")
        if response.status_code == 200:
            data = response.json()
            print("   ✅ Access request triggered successfully")
            print(f"   📨 Message: {data['message']}")
        else:
            print(f"   ❌ Failed to trigger access request: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error triggering access request: {e}")
        return False

    # Check if request is active
    time.sleep(1)
    try:
        response = requests.get(f"{base_url}/api/check-access-request")
        if response.status_code == 200:
            data = response.json()
            if data["active"]:
                print("   ✅ Access request is active - frontend should show popup!")
            else:
                print("   ❌ Access request is not active")
                return False
        else:
            print(f"   ❌ Failed to check access request: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error checking access request: {e}")
        return False

    return True


def main():
    print("🏥 Mock Trial Site - Complete Flow Test")
    print("=" * 60)

    # Load config to get backend port
    try:
        import json

        with open("mock_trial_site/config.json", "r") as f:
            config = json.load(f)
            backend_port = config.get("backend_port", 5500)
    except:
        backend_port = 5500

    if not test_backend_api(backend_port):
        print(
            f"\n❌ Backend tests failed. Make sure backend is running on port {backend_port}:"
        )
        print("   cd mock_trial_site/backend && python app.py")
        return

    # Test frontend
    if not test_frontend():
        print("\n❌ Frontend tests failed. Make sure frontend is running:")
        print("   cd mock_trial_site/frontend && PORT=3002 npm start")
        return

    # Test access request flow
    if not test_access_request_flow():
        print("\n❌ Access request flow failed")
        return

    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED!")
    print("\n📋 Summary:")
    print("   • Backend API is working correctly")
    print("   • Patient documents are being served")
    print("   • Frontend is accessible")
    print("   • Access request flow is functional")

    print("\n🌐 Open these URLs in your browser:")
    print("   • Mock Trial Site: http://localhost:3002")
    print("   • SDV Platform: http://localhost:3000")

    print("\n💡 To test the complete flow:")
    print("   1. Open http://localhost:3002 (Mock Trial Site)")
    print("   2. You should see patient_1 with 11 documents")
    print("   3. Click on patient_1 to view documents")
    print("   4. Open http://localhost:3000 (SDV Platform)")
    print("   5. Login as a sponsor and click 'Connect to Investigator'")
    print("   6. Go back to Mock Trial Site - popup should appear!")

    # Ask if user wants to open browser
    try:
        open_browser = (
            input("\n🌐 Open Mock Trial Site in browser? (y/n): ").lower().strip()
        )
        if open_browser in ["y", "yes"]:
            webbrowser.open("http://localhost:3002")
            print("   ✅ Opened http://localhost:3002")
    except KeyboardInterrupt:
        print("\n   👋 Test completed!")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
