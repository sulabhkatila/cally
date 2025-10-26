#!/usr/bin/env python3
"""
Test script for TrialMonitor agent REST endpoints
"""

import requests
import json
import time

# Base URL for the TrialMonitor agent
BASE_URL = "http://localhost:8004"


def test_health_endpoint():
    """Test the health check endpoint"""
    print("🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"   Agent address: {data['agent_address']}")
            print(f"   Capabilities: {len(data['capabilities'])} available")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False


def test_data_extraction_endpoint():
    """Test the data extraction endpoint"""
    print("\n📊 Testing data extraction endpoint...")
    try:
        test_data = {
            "fileName": "test_crf.pdf",
            "content": "Patient ID: SUB-001\nAssessment Date: 2024-01-01\nDAS28 Score: 4.2\nSwollen Joint Count: 8",
            "dataPoints": [
                "patient_id",
                "assessment_date",
                "das28_score",
                "swollen_joint_count",
            ],
        }

        response = requests.post(
            f"{BASE_URL}/extract-data",
            headers={"Content-Type": "application/json"},
            json=test_data,
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Data extraction successful: {data['success']}")
            print(f"   File: {data['fileName']}")
            print(f"   Extracted points: {len(data['extractedDataPoints'])}")
            print(f"   Points: {data['extractedDataPoints']}")
            return True
        else:
            print(f"❌ Data extraction failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Data extraction error: {e}")
        return False


def test_data_verification_endpoint():
    """Test the data verification endpoint"""
    print("\n✅ Testing data verification endpoint...")
    try:
        test_data = {
            "crfData": "Patient ID: SUB-001\nDAS28 Score: 4.2\nSwollen Joint Count: 8",
            "esourceData": "Patient: SUB-001\nDAS28: 4.2\nSwollen Joints: 8",
            "crfDataPoints": ["patient_id", "das28_score", "swollen_joint_count"],
            "esourceDataPoints": ["patient_id", "das28", "swollen_joints"],
        }

        response = requests.post(
            f"{BASE_URL}/verify-data",
            headers={"Content-Type": "application/json"},
            json=test_data,
        )

        if response.status_code == 200:
            data = response.json()
            print(f"✅ Data verification successful: {data['success']}")
            print(f"   Verified: {data['verified']}")
            print(f"   Verified points: {len(data['verifiedDataPoints'])}")
            print(f"   Unverified points: {len(data['unverifiedDataPoints'])}")
            return True
        else:
            print(f"❌ Data verification failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Data verification error: {e}")
        return False


def main():
    """Run all tests"""
    print("🧪 Testing TrialMonitor Agent REST Endpoints")
    print("=" * 50)

    # Test health endpoint
    health_ok = test_health_endpoint()

    if not health_ok:
        print("\n❌ Agent is not running or not accessible")
        print("   Please start the TrialMonitor agent first:")
        print("   cd agents2 && python trial_monitor_agent.py")
        return

    # Test data extraction
    extraction_ok = test_data_extraction_endpoint()

    # Test data verification
    verification_ok = test_data_verification_endpoint()

    # Summary
    print("\n" + "=" * 50)
    print("📋 Test Summary:")
    print(f"   Health Check: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Data Extraction: {'✅ PASS' if extraction_ok else '❌ FAIL'}")
    print(f"   Data Verification: {'✅ PASS' if verification_ok else '❌ FAIL'}")

    if all([health_ok, extraction_ok, verification_ok]):
        print(
            "\n🎉 All tests passed! TrialMonitor agent REST endpoints are working correctly."
        )
    else:
        print("\n⚠️  Some tests failed. Check the agent logs for details.")


if __name__ == "__main__":
    main()
