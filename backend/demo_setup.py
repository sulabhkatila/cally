#!/usr/bin/env python3
"""
Demonstration script showing how the database setup works.
This script shows the before and after state of the database.
"""

from database_manager import db_manager, get_database_statistics


def show_database_state(title):
    """Show current database state."""
    print(f"\n{'='*60}")
    print(f"{title}")
    print(f"{'='*60}")

    stats = get_database_statistics()
    print(f"Total Users: {stats['total_users']}")
    print(f"Total Studies: {stats['total_studies']}")
    print(f"Studies without PI: {stats['studies_without_investigator']}")

    print("\nUsers by Company:")
    for company, count in stats["users_by_company"].items():
        print(f"  - {company}: {count}")

    print("\nStudies by Status:")
    for status, count in stats["studies_by_status"].items():
        print(f"  - {status}: {count}")


def main():
    """Demonstrate database setup functionality."""
    print("SDV PLATFORM DATABASE SETUP DEMONSTRATION")
    print("This script shows how the database setup works")

    # Show initial state
    show_database_state("INITIAL DATABASE STATE")

    # Show some sample data
    print(f"\n{'='*60}")
    print("SAMPLE DATA")
    print(f"{'='*60}")

    # Show first few users
    users = db_manager.get_all_users()
    print(f"\nFirst 3 Users:")
    for i, user in enumerate(users[:3]):
        print(
            f"  {i+1}. {user.get_full_name()} ({user.role}) - {user.company_association}"
        )

    # Show first few studies
    studies = db_manager.get_all_studies()
    print(f"\nFirst 3 Studies:")
    for i, study in enumerate(studies[:3]):
        pi_status = "Has PI" if study.has_principal_investigator() else "No PI"
        print(f"  {i+1}. {study.title} ({study.id}) - {pi_status}")

    # Show final state
    show_database_state("FINAL DATABASE STATE")

    print(f"\n{'='*60}")
    print("SETUP COMPLETE!")
    print("The database is now ready for use.")
    print("You can start the server with: python start_server.py")
    print("Or test the API with: python test_endpoints.py")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
