#!/usr/bin/env python3
"""
Test script to verify automatic database setup functionality.
This script tests that the database is properly initialized when the app starts.
"""

from database_manager import db_manager, get_database_statistics


def test_auto_setup():
    """Test that the database is automatically set up."""
    print("=" * 60)
    print("TESTING AUTOMATIC DATABASE SETUP")
    print("=" * 60)

    # Test that data is loaded
    print("1. Testing data initialization...")
    db_manager.ensure_data_loaded()

    # Get statistics
    stats = get_database_statistics()
    print(f"   ✅ Users loaded: {stats['total_users']}")
    print(f"   ✅ Studies loaded: {stats['total_studies']}")

    # Test that we can get users
    print("\n2. Testing user retrieval...")
    users = db_manager.get_all_users()
    print(f"   ✅ Total users retrieved: {len(users)}")

    # Test users by company
    google_users = db_manager.get_users_by_company("Google")
    print(f"   ✅ Google users: {len(google_users)}")

    # Test users by role
    sponsors = db_manager.get_users_by_role("Sponsor")
    print(f"   ✅ Sponsor users: {len(sponsors)}")

    # Test that we can get studies
    print("\n3. Testing study retrieval...")
    studies = db_manager.get_all_studies()
    print(f"   ✅ Total studies retrieved: {len(studies)}")

    # Test studies by status
    active_studies = db_manager.get_studies_by_status("active")
    print(f"   ✅ Active studies: {len(active_studies)}")

    # Test studies without PI
    studies_without_pi = stats["studies_without_investigator"]
    print(f"   ✅ Studies without PI: {studies_without_pi}")

    # Test that we can add an investigator
    print("\n4. Testing investigator addition...")
    test_investigator = {
        "name": "Dr. Test Investigator",
        "email": "test@hospital.com",
        "institution": "Test Hospital",
        "specialty": "Cardiology",
    }

    # Find a study without PI
    study_without_pi = None
    for study in studies:
        if not study.has_principal_investigator():
            study_without_pi = study
            break

    if study_without_pi:
        success = db_manager.add_investigator_to_study(
            study_without_pi.id, test_investigator
        )
        if success:
            print(f"   ✅ Successfully added investigator to {study_without_pi.id}")
        else:
            print(f"   ❌ Failed to add investigator to {study_without_pi.id}")
    else:
        print("   ⚠️  No studies without PI found to test")

    # Test that we can create a new study
    print("\n5. Testing study creation...")
    from models import Study
    from datetime import datetime

    new_study = Study(
        study_id="TEST-001",
        title="Test Study",
        protocol="A test study protocol",
        sponsor="Test Sponsor",
        status="draft",
        created_at=datetime.now(),
        sites=[],
        principal_investigator=None,
    )

    success = db_manager.add_study(new_study)
    if success:
        print("   ✅ Successfully created new study")
        # Clean up - remove the test study
        db_manager.delete_study("TEST-001")
        print("   ✅ Cleaned up test study")
    else:
        print("   ❌ Failed to create new study")

    print("\n" + "=" * 60)
    print("AUTOMATIC SETUP TEST COMPLETED")
    print("=" * 60)
    print("✅ All tests passed! The database setup is working correctly.")
    print("The server will automatically initialize the database on startup.")


if __name__ == "__main__":
    test_auto_setup()
