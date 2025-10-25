from datetime import datetime
from typing import List, Optional, Dict, Any
import uuid


class User:
    """User model matching frontend structure."""

    def __init__(
        self,
        first_name: str,
        last_name: str,
        email_address: str,
        company_association: str,
        role: str,
    ):
        self.first_name = first_name
        self.last_name = last_name
        self.email_address = email_address
        self.company_association = company_association
        self.role = role

    def get_full_name(self) -> str:
        """Get full name of the user."""
        return f"{self.first_name} {self.last_name}"

    def get_display_name(self) -> str:
        """Get display name with role and company."""
        return f"{self.role} - {self.company_association}"

    def get_initials(self) -> str:
        """Get user initials."""
        return f"{self.first_name[0]}{self.last_name[0]}".upper()

    def to_dict(self) -> Dict[str, Any]:
        """Convert user to dictionary."""
        return {
            "firstName": self.first_name,
            "lastName": self.last_name,
            "emailAddress": self.email_address,
            "companyAssociation": self.company_association,
            "role": self.role,
            "fullName": self.get_full_name(),
            "displayName": self.get_display_name(),
            "initials": self.get_initials(),
        }


class StudyFile:
    """Study file model matching frontend structure."""

    def __init__(
        self,
        file_id: str,
        name: str,
        file_type: str,
        uploaded_by: str,
        uploaded_at: datetime,
        status: str = "pending",
        size: int = 0,
    ):
        self.id = file_id
        self.name = name
        self.type = file_type  # 'protocol', 'esource', 'crf'
        self.uploaded_by = uploaded_by
        self.uploaded_at = uploaded_at
        self.status = status  # 'pending', 'approved', 'rejected', 'under-review'
        self.size = size

    def to_dict(self) -> Dict[str, Any]:
        """Convert study file to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "uploadedBy": self.uploaded_by,
            "uploadedAt": self.uploaded_at.isoformat(),
            "status": self.status,
            "size": self.size,
        }


class Site:
    """Site model matching frontend structure."""

    def __init__(
        self,
        site_id: str,
        name: str,
        investigator: str,
        location: str,
        status: str = "pending",
    ):
        self.id = site_id
        self.name = name
        self.investigator = investigator
        self.location = location
        self.status = status  # 'pending', 'active', 'inactive'
        self.e_source_files = []
        self.crf_files = []

    def add_e_source_file(self, file: StudyFile):
        """Add eSource file to site."""
        self.e_source_files.append(file)

    def add_crf_file(self, file: StudyFile):
        """Add CRF file to site."""
        self.crf_files.append(file)

    def to_dict(self) -> Dict[str, Any]:
        """Convert site to dictionary."""
        return {
            "id": self.id,
            "name": self.name,
            "investigator": self.investigator,
            "location": self.location,
            "status": self.status,
            "eSourceFiles": [f.to_dict() for f in self.e_source_files],
            "crfFiles": [f.to_dict() for f in self.crf_files],
        }


class Study:
    """Study model matching frontend structure."""

    def __init__(
        self,
        study_id: str,
        title: str,
        protocol: str,
        sponsor: str,
        status: str,
        created_at: datetime,
        sites: List[Site] = None,
        principal_investigator: Optional[Dict[str, str]] = None,
    ):
        self.id = study_id
        self.title = title
        self.protocol = protocol
        self.sponsor = sponsor
        self.status = status  # 'draft', 'active', 'completed', 'on-hold'
        self.created_at = created_at
        self.sites = sites or []
        self.principal_investigator = principal_investigator
        self.e_source_files = []
        self.crf_files = []

    def add_site(self, site: Site):
        """Add site to study."""
        self.sites.append(site)

    def add_e_source_file(self, file: StudyFile):
        """Add eSource file to study."""
        self.e_source_files.append(file)

    def add_crf_file(self, file: StudyFile):
        """Add CRF file to study."""
        self.crf_files.append(file)

    def get_total_sites(self) -> int:
        """Get total number of sites."""
        return len(self.sites)

    def get_active_sites(self) -> int:
        """Get number of active sites."""
        return len([site for site in self.sites if site.status == "active"])

    def has_principal_investigator(self) -> bool:
        """Check if study has principal investigator."""
        return self.principal_investigator is not None

    def set_principal_investigator(self, investigator: Dict[str, str]):
        """Set principal investigator for study."""
        self.principal_investigator = investigator

    def to_dict(self) -> Dict[str, Any]:
        """Convert study to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "protocol": self.protocol,
            "sponsor": self.sponsor,
            "status": self.status,
            "createdAt": self.created_at.isoformat(),
            "sites": [site.to_dict() for site in self.sites],
            "principalInvestigator": self.principal_investigator,
            "eSourceFiles": [f.to_dict() for f in self.e_source_files],
            "crfFiles": [f.to_dict() for f in self.crf_files],
            "totalSites": self.get_total_sites(),
            "activeSites": self.get_active_sites(),
            "hasPrincipalInvestigator": self.has_principal_investigator(),
        }
