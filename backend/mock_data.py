from datetime import datetime
from models import User, Study, Site, StudyFile


# Mock users data matching frontend structure
MOCK_USERS = {
    "google": [
        User("Sarah", "Johnson", "sarah.johnson@regeneron.com", "Google", "Sponsor"),
        User("Michael", "Chen", "michael.chen@site.com", "Google", "Investigator"),
        User(
            "Emily", "Rodriguez", "emily.rodriguez@regeneron.com", "Google", "Sponsor"
        ),
        User("David", "Kim", "david.kim@site.com", "Google", "Investigator"),
    ],
    "veera": [
        User(
            "Jennifer",
            "Williams",
            "jennifer.williams@regeneron.com",
            "Veera Vault",
            "Sponsor",
        ),
        User("Robert", "Brown", "robert.brown@site.com", "Veera Vault", "Investigator"),
        User("Lisa", "Davis", "lisa.davis@regeneron.com", "Veera Vault", "Sponsor"),
        User("James", "Wilson", "james.wilson@site.com", "Veera Vault", "Investigator"),
    ],
    "medidata": [
        User("Amanda", "Taylor", "amanda.taylor@regeneron.com", "Medidata", "Sponsor"),
        User(
            "Christopher",
            "Anderson",
            "christopher.anderson@site.com",
            "Medidata",
            "Investigator",
        ),
        User(
            "Jessica", "Thomas", "jessica.thomas@regeneron.com", "Medidata", "Sponsor"
        ),
        User(
            "Matthew", "Jackson", "matthew.jackson@site.com", "Medidata", "Investigator"
        ),
    ],
}


# Mock studies data matching frontend structure
def create_mock_studies():
    """Create mock studies with the same structure as frontend."""

    # Study 1: Phase III Trial: Novel Cancer Treatment
    study1_sites = [
        Site(
            "SITE-001",
            "Johns Hopkins Hospital",
            "Dr. Sarah Johnson",
            "Baltimore, MD",
            "active",
        ),
    ]

    study1 = Study(
        "STD-001",
        "Phase III Trial: Novel Cancer Treatment",
        "A randomized, double-blind, placebo-controlled study to evaluate the efficacy and safety of NovelCancer Drug in patients with advanced solid tumors.",
        "Regeneron Pharmaceuticals",
        "active",
        datetime(2024, 1, 15),
        study1_sites,
        {
            "name": "Dr. Sarah Johnson",
            "email": "sarah.johnson@regeneron.com",
            "institution": "Johns Hopkins Hospital",
            "specialty": "Oncology",
        },
    )

    # Add files to study 1
    study1.add_e_source_file(
        StudyFile(
            "FILE-001",
            "eSource_Template_v2.1.pdf",
            "esource",
            "Dr. Sarah Johnson",
            datetime(2024, 1, 20),
            "approved",
            2048576,
        )
    )

    study1.add_crf_file(
        StudyFile(
            "FILE-002",
            "CRF_Visit1_v1.0.pdf",
            "crf",
            "Dr. Sarah Johnson",
            datetime(2024, 1, 22),
            "under-review",
            1536000,
        )
    )

    # Study 2: Phase II Study: Cardiovascular Intervention (no principal investigator)
    study2_sites = [
        Site(
            "SITE-004",
            "Massachusetts General Hospital",
            "Dr. David Kim",
            "Boston, MA",
            "pending",
        ),
    ]

    study2 = Study(
        "STD-002",
        "Phase II Study: Cardiovascular Intervention",
        "A multicenter, open-label study to assess the safety and efficacy of CardioIntervention Device in patients with coronary artery disease.",
        "Medtronic Inc.",
        "draft",
        datetime(2024, 2, 1),
        study2_sites,
        None,  # No principal investigator assigned yet
    )

    # Add files to study 2
    study2.add_e_source_file(
        StudyFile(
            "FILE-003",
            "eSource_Protocol_v1.0.pdf",
            "esource",
            "Dr. David Kim",
            datetime(2024, 2, 5),
            "pending",
            3072000,
        )
    )

    # Study 3: Phase I Safety Study: Neurological Treatment
    study3_sites = [
        Site(
            "SITE-006",
            "UCLA Medical Center",
            "Dr. James Wilson",
            "Los Angeles, CA",
            "active",
        ),
    ]

    study3 = Study(
        "STD-003",
        "Phase I Safety Study: Neurological Treatment",
        "A first-in-human study to evaluate the safety, tolerability, and pharmacokinetics of NeuroTreatment in healthy volunteers.",
        "Biogen Inc.",
        "active",
        datetime(2024, 1, 20),
        study3_sites,
        {
            "name": "Dr. James Wilson",
            "email": "james.wilson@site.com",
            "institution": "UCLA Medical Center",
            "specialty": "Neurology",
        },
    )

    # Add files to study 3
    study3.add_e_source_file(
        StudyFile(
            "FILE-004",
            "eSource_Neurological_v1.2.pdf",
            "esource",
            "Dr. James Wilson",
            datetime(2024, 1, 25),
            "approved",
            2560000,
        )
    )

    study3.add_crf_file(
        StudyFile(
            "FILE-005",
            "CRF_Neurological_v1.1.pdf",
            "crf",
            "Dr. James Wilson",
            datetime(2024, 1, 28),
            "approved",
            1792000,
        )
    )

    # Study 4: Phase II Study: ARX-95 efficacy (draft)
    study4_sites = [
        Site(
            "SITE-007",
            "Stanford Medical Center",
            "Dr. Michael Chen",
            "Stanford, CA",
            "pending",
        ),
    ]

    study4 = Study(
        "STD-004",
        "Phase II Study: ARX-95 efficacy",
        "A randomized, double-blind, placebo-controlled study to evaluate the efficacy and safety of ARX-95 in patients with moderate-to-severe rheumatoid arthritis.",
        "Regeneron Pharmaceuticals",
        "draft",
        datetime(2024, 3, 1),
        study4_sites,
        None,  # No principal investigator assigned yet
    )

    # Add files to study 4
    study4.add_e_source_file(
        StudyFile(
            "FILE-006",
            "eSource_ARX95_v1.0.pdf",
            "esource",
            "Dr. Michael Chen",
            datetime(2024, 3, 5),
            "pending",
            2048000,
        )
    )

    study4.add_crf_file(
        StudyFile(
            "FILE-007",
            "CRF_ARX95_v1.0.pdf",
            "crf",
            "Dr. Michael Chen",
            datetime(2024, 3, 8),
            "pending",
            1536000,
        )
    )

    return [study1, study2, study3, study4]


# Initialize mock studies
MOCK_STUDIES = create_mock_studies()


def get_all_users():
    """Get all users from all companies."""
    all_users = []
    for company_users in MOCK_USERS.values():
        all_users.extend(company_users)
    return all_users


def get_users_by_company(company: str):
    """Get users by company."""
    return MOCK_USERS.get(company, [])


def get_users_by_role(role: str):
    """Get users by role."""
    all_users = get_all_users()
    return [user for user in all_users if user.role == role]


def get_study_by_id(study_id: str):
    """Get study by ID."""
    for study in MOCK_STUDIES:
        if study.id == study_id:
            return study
    return None


def get_studies_by_sponsor(sponsor: str):
    """Get studies by sponsor."""
    return [study for study in MOCK_STUDIES if study.sponsor == sponsor]


def get_studies_by_status(status: str):
    """Get studies by status."""
    return [study for study in MOCK_STUDIES if study.status == status]
