"""
Database manager for the SDV Platform backend.
This module handles database operations for users and studies.
Currently uses in-memory storage, but can be extended to use a real database.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from models import User, Study, Site, StudyFile
from mock_data import MOCK_USERS, MOCK_STUDIES


class DatabaseManager:
    """Database manager for handling users and studies data."""

    def __init__(self):
        """Initialize the database manager."""
        self.users = {}
        self.studies = {}
        self._initialize_data()

    def _initialize_data(self):
        """Initialize the database with mock data."""
        # Load users (only if not already loaded)
        for company, users in MOCK_USERS.items():
            for user in users:
                if user.email_address not in self.users:
                    self.users[user.email_address] = user

        # Load studies (only if not already loaded)
        for study in MOCK_STUDIES:
            if study.id not in self.studies:
                self.studies[study.id] = study

    # User operations
    def get_all_users(self) -> List[User]:
        """Get all users."""
        return list(self.users.values())

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email address."""
        return self.users.get(email)

    def get_users_by_company(self, company: str) -> List[User]:
        """Get users by company."""
        return [
            user for user in self.users.values() if user.company_association == company
        ]

    def get_users_by_role(self, role: str) -> List[User]:
        """Get users by role."""
        return [user for user in self.users.values() if user.role == role]

    def add_user(self, user: User) -> bool:
        """Add a new user."""
        if user.email_address in self.users:
            return False  # User already exists

        self.users[user.email_address] = user
        return True

    def update_user(self, email: str, updated_user: User) -> bool:
        """Update an existing user."""
        if email not in self.users:
            return False

        self.users[email] = updated_user
        return True

    def delete_user(self, email: str) -> bool:
        """Delete a user."""
        if email not in self.users:
            return False

        del self.users[email]
        return True

    # Study operations
    def get_all_studies(self) -> List[Study]:
        """Get all studies."""
        return list(self.studies.values())

    def get_study_by_id(self, study_id: str) -> Optional[Study]:
        """Get study by ID."""
        return self.studies.get(study_id)

    def get_studies_by_sponsor(self, sponsor: str) -> List[Study]:
        """Get studies by sponsor."""
        return [study for study in self.studies.values() if study.sponsor == sponsor]

    def get_studies_by_status(self, status: str) -> List[Study]:
        """Get studies by status."""
        return [study for study in self.studies.values() if study.status == status]

    def add_study(self, study: Study) -> bool:
        """Add a new study."""
        if study.id in self.studies:
            return False  # Study already exists

        self.studies[study.id] = study
        return True

    def update_study(self, study_id: str, updated_study: Study) -> bool:
        """Update an existing study."""
        if study_id not in self.studies:
            return False

        self.studies[study_id] = updated_study
        return True

    def delete_study(self, study_id: str) -> bool:
        """Delete a study."""
        if study_id not in self.studies:
            return False

        del self.studies[study_id]
        return True

    def add_investigator_to_study(
        self, study_id: str, investigator: Dict[str, str]
    ) -> bool:
        """Add principal investigator to a study."""
        study = self.get_study_by_id(study_id)
        if not study:
            return False

        study.set_principal_investigator(investigator)
        return True

    # Statistics
    def get_user_count(self) -> int:
        """Get total number of users."""
        return len(self.users)

    def get_study_count(self) -> int:
        """Get total number of studies."""
        return len(self.studies)

    def get_users_by_company_count(self) -> Dict[str, int]:
        """Get user count by company."""
        counts = {}
        for user in self.users.values():
            company = user.company_association
            counts[company] = counts.get(company, 0) + 1
        return counts

    def get_studies_by_status_count(self) -> Dict[str, int]:
        """Get study count by status."""
        counts = {}
        for study in self.studies.values():
            status = study.status
            counts[status] = counts.get(status, 0) + 1
        return counts

    def get_studies_without_investigator_count(self) -> int:
        """Get count of studies without principal investigator."""
        return len(
            [
                study
                for study in self.studies.values()
                if not study.has_principal_investigator()
            ]
        )

    # Database management
    def clear_all_data(self):
        """Clear all data from the database."""
        self.users.clear()
        self.studies.clear()

    def reset_to_mock_data(self):
        """Reset database to initial mock data."""
        self.clear_all_data()
        self._initialize_data()

    def ensure_data_loaded(self):
        """Ensure all mock data is loaded (safe to call multiple times)."""
        self._initialize_data()

    def export_data(self) -> Dict[str, Any]:
        """Export all data as dictionaries."""
        return {
            "users": [user.to_dict() for user in self.users.values()],
            "studies": [study.to_dict() for study in self.studies.values()],
            "statistics": {
                "total_users": self.get_user_count(),
                "total_studies": self.get_study_count(),
                "users_by_company": self.get_users_by_company_count(),
                "studies_by_status": self.get_studies_by_status_count(),
                "studies_without_investigator": self.get_studies_without_investigator_count(),
            },
        }


# Global database manager instance
db_manager = DatabaseManager()


# Convenience functions that use the global database manager
def get_all_users() -> List[User]:
    """Get all users."""
    return db_manager.get_all_users()


def get_users_by_company(company: str) -> List[User]:
    """Get users by company."""
    return db_manager.get_users_by_company(company)


def get_users_by_role(role: str) -> List[User]:
    """Get users by role."""
    return db_manager.get_users_by_role(role)


def get_study_by_id(study_id: str) -> Optional[Study]:
    """Get study by ID."""
    return db_manager.get_study_by_id(study_id)


def get_studies_by_sponsor(sponsor: str) -> List[Study]:
    """Get studies by sponsor."""
    return db_manager.get_studies_by_sponsor(sponsor)


def get_studies_by_status(status: str) -> List[Study]:
    """Get studies by status."""
    return db_manager.get_studies_by_status(status)


def add_investigator_to_study(study_id: str, investigator: Dict[str, str]) -> bool:
    """Add principal investigator to a study."""
    return db_manager.add_investigator_to_study(study_id, investigator)


def get_database_statistics() -> Dict[str, Any]:
    """Get database statistics."""
    return {
        "total_users": db_manager.get_user_count(),
        "total_studies": db_manager.get_study_count(),
        "users_by_company": db_manager.get_users_by_company_count(),
        "studies_by_status": db_manager.get_studies_by_status_count(),
        "studies_without_investigator": db_manager.get_studies_without_investigator_count(),
    }
