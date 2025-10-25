#!/usr/bin/env python3
"""
Database setup script for the SDV Platform backend.
This script initializes the database with users and studies data.
"""

import os
import sys
from datetime import datetime
from models import User, Study, Site, StudyFile
from mock_data import MOCK_USERS, MOCK_STUDIES


def setup_users_database():
    """Setup users in the database (currently using in-memory storage)."""
    print("Setting up users database...")

    total_users = 0
    for company, users in MOCK_USERS.items():
        print(f"  - Adding {len(users)} users from {company}")
        total_users += len(users)

        # In a real database, you would save each user here
        # For now, we're just using the mock data
        for user in users:
            print(f"    * {user.get_full_name()} ({user.role}) - {user.email_address}")

    print(f"✅ Successfully setup {total_users} users")
    return total_users


def setup_studies_database():
    """Setup studies in the database (currently using in-memory storage)."""
    print("Setting up studies database...")

    total_studies = 0
    for study in MOCK_STUDIES:
        print(f"  - Adding study: {study.title} ({study.id})")
        print(f"    * Sponsor: {study.sponsor}")
        print(f"    * Status: {study.status}")
        print(
            f"    * Sites: {study.get_total_sites()} (Active: {study.get_active_sites()})"
        )
        print(f"    * Has PI: {study.has_principal_investigator()}")

        if study.principal_investigator:
            pi = study.principal_investigator
            print(f"    * Principal Investigator: {pi['name']} ({pi['specialty']})")

        print(
            f"    * Files: {len(study.e_source_files)} eSource, {len(study.crf_files)} CRF"
        )
        total_studies += 1

    print(f"✅ Successfully setup {total_studies} studies")
    return total_studies


def setup_database():
    """Main setup function to initialize the database."""
    print("=" * 60)
    print("SDV PLATFORM DATABASE SETUP")
    print("=" * 60)
    print()

    try:
        # Setup users
        user_count = setup_users_database()
        print()

        # Setup studies
        study_count = setup_studies_database()
        print()

        print("=" * 60)
        print("DATABASE SETUP COMPLETED")
        print("=" * 60)
        print(f"Total Users: {user_count}")
        print(f"Total Studies: {study_count}")
        print()
        print("The database is now ready for use!")
        print("You can start the server with: python start_server.py")
        print("=" * 60)

    except Exception as e:
        print(f"❌ Error during database setup: {e}")
        sys.exit(1)


def reset_database():
    """Reset the database (clear all data)."""
    print("Resetting database...")
    print("⚠️  This will clear all existing data!")

    # In a real database, you would clear the tables here
    # For now, we're just using mock data, so this is a no-op
    print("✅ Database reset completed")
    print("Note: Using in-memory mock data - no persistent data to clear")


def show_database_status():
    """Show current database status."""
    print("=" * 60)
    print("DATABASE STATUS")
    print("=" * 60)

    # Count users
    total_users = sum(len(users) for users in MOCK_USERS.values())
    print(f"Users: {total_users}")
    for company, users in MOCK_USERS.items():
        print(f"  - {company}: {len(users)} users")

    print()

    # Count studies
    print(f"Studies: {len(MOCK_STUDIES)}")
    for study in MOCK_STUDIES:
        status_icon = (
            "🟢"
            if study.status == "active"
            else "🟡" if study.status == "draft" else "🔴"
        )
        pi_icon = "👤" if study.has_principal_investigator() else "❌"
        print(f"  - {status_icon} {study.id}: {study.title}")
        print(
            f"    {pi_icon} PI: {'Yes' if study.has_principal_investigator() else 'No'}"
        )
        print(f"    🏥 Sites: {study.get_active_sites()}/{study.get_total_sites()}")

    print("=" * 60)


def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()

        if command == "setup":
            setup_database()
        elif command == "reset":
            reset_database()
        elif command == "status":
            show_database_status()
        elif command == "help":
            print("Usage: python setup_database.py [command]")
            print()
            print("Commands:")
            print("  setup   - Initialize database with users and studies")
            print("  reset   - Reset database (clear all data)")
            print("  status  - Show current database status")
            print("  help    - Show this help message")
            print()
            print("If no command is provided, 'setup' will be run by default.")
        else:
            print(f"Unknown command: {command}")
            print("Use 'help' to see available commands.")
            sys.exit(1)
    else:
        # Default to setup if no command provided
        setup_database()


if __name__ == "__main__":
    main()
