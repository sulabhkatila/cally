#!/usr/bin/env python3
"""
Test script for the backend API endpoints.
Run this script to test the User and Study endpoints.
"""

import requests
import json
from datetime import datetime


BASE_URL = "http://localhost:5001"


def test_health_check():
    """Test health check endpoint."""
    print("Testing health check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()


def test_get_all_users():
    """Test getting all users."""
    print("Testing get all users...")
    response = requests.get(f"{BASE_URL}/api/users")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total users: {data.get('total_count', 0)}")
    if data.get("users"):
        print(f"First user: {data['users'][0]}")
    print()


def test_get_users_by_company():
    """Test getting users by company."""
    print("Testing get users by company (Google)...")
    response = requests.get(f"{BASE_URL}/api/users/google")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Google users: {data.get('total_count', 0)}")
    if data.get("users"):
        print(f"First Google user: {data['users'][0]}")
    print()


def test_get_users_by_role():
    """Test getting users by role."""
    print("Testing get users by role (Sponsor)...")
    response = requests.get(f"{BASE_URL}/api/users?role=Sponsor")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Sponsor users: {data.get('total_count', 0)}")
    if data.get("users"):
        print(f"First sponsor: {data['users'][0]}")
    print()


def test_get_all_studies():
    """Test getting all studies."""
    print("Testing get all studies...")
    response = requests.get(f"{BASE_URL}/api/studies")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Total studies: {data.get('total_count', 0)}")
    if data.get("studies"):
        print(f"First study: {data['studies'][0]['title']}")
        print(f"Study ID: {data['studies'][0]['id']}")
    print()


def test_get_study_by_id():
    """Test getting a specific study."""
    print("Testing get study by ID (STD-001)...")
    response = requests.get(f"{BASE_URL}/api/studies/STD-001")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        study = data.get("study", {})
        print(f"Study: {study.get('title')}")
        print(f"Sponsor: {study.get('sponsor')}")
        print(f"Status: {study.get('status')}")
        print(f"Has PI: {study.get('hasPrincipalInvestigator')}")
    else:
        print(f"Error: {response.json()}")
    print()


def test_get_studies_by_status():
    """Test getting studies by status."""
    print("Testing get studies by status (active)...")
    response = requests.get(f"{BASE_URL}/api/studies?status=active")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Active studies: {data.get('total_count', 0)}")
    if data.get("studies"):
        for study in data["studies"]:
            print(f"- {study['title']} ({study['id']})")
    print()


def test_add_investigator():
    """Test adding investigator to a study."""
    print("Testing add investigator to study (STD-002)...")
    investigator_data = {
        "name": "Dr. Test Investigator",
        "email": "test.investigator@hospital.com",
        "institution": "Test Hospital",
        "specialty": "Cardiology",
    }

    response = requests.post(
        f"{BASE_URL}/api/studies/STD-002/investigator",
        json=investigator_data,
        headers={"Content-Type": "application/json"},
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Message: {data.get('message')}")
        study = data.get("study", {})
        print(f"Study now has PI: {study.get('hasPrincipalInvestigator')}")
        if study.get("principalInvestigator"):
            pi = study["principalInvestigator"]
            print(f"PI Name: {pi.get('name')}")
    else:
        print(f"Error: {response.json()}")
    print()


def test_create_study():
    """Test creating a new study."""
    print("Testing create new study...")
    study_data = {
        "title": "Test Phase II Study",
        "protocol": "A test study protocol for demonstration purposes.",
        "sponsor": "Test Pharmaceuticals",
        "phase": "Phase II",
        "indication": "Test Indication",
        "principalInvestigator": {
            "name": "Dr. Test PI",
            "email": "test.pi@hospital.com",
            "institution": "Test Medical Center",
            "specialty": "Internal Medicine",
        },
    }

    response = requests.post(
        f"{BASE_URL}/api/studies",
        json=study_data,
        headers={"Content-Type": "application/json"},
    )
    print(f"Status: {response.status_code}")
    if response.status_code == 201:
        data = response.json()
        print(f"Message: {data.get('message')}")
        study = data.get("study", {})
        print(f"New study ID: {study.get('id')}")
        print(f"New study title: {study.get('title')}")
    else:
        print(f"Error: {response.json()}")
    print()


def test_database_stats():
    """Test database statistics endpoint."""
    print("Testing database statistics...")
    response = requests.get(f"{BASE_URL}/api/database/stats")
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        stats = data.get("statistics", {})
        print(f"Total Users: {stats.get('total_users', 0)}")
        print(f"Total Studies: {stats.get('total_studies', 0)}")
        print(f"Studies without PI: {stats.get('studies_without_investigator', 0)}")

        users_by_company = stats.get("users_by_company", {})
        if users_by_company:
            print("Users by company:")
            for company, count in users_by_company.items():
                print(f"  - {company}: {count}")

        studies_by_status = stats.get("studies_by_status", {})
        if studies_by_status:
            print("Studies by status:")
            for status, count in studies_by_status.items():
                print(f"  - {status}: {count}")
    else:
        print(f"Error: {response.json()}")
    print()


def main():
    """Run all tests."""
    print("=" * 60)
    print("BACKEND API ENDPOINT TESTS")
    print("=" * 60)
    print()

    try:
        test_health_check()
        test_get_all_users()
        test_get_users_by_company()
        test_get_users_by_role()
        test_get_all_studies()
        test_get_study_by_id()
        test_get_studies_by_status()
        test_add_investigator()
        test_create_study()
        test_database_stats()

        print("=" * 60)
        print("ALL TESTS COMPLETED")
        print("=" * 60)

    except requests.exceptions.ConnectionError:
        print("ERROR: Could not connect to backend server.")
        print("Make sure the Flask server is running on http://localhost:5001")
        print("Run: python app.py")
    except Exception as e:
        print(f"ERROR: {e}")


if __name__ == "__main__":
    main()
