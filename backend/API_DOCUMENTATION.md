# Backend API Documentation

This document describes the API endpoints for the SDV Platform backend, including User and Study management endpoints.

## Base URL

```
http://localhost:5001
```

## Endpoints

### Health Check

-   **GET** `/health`
-   **Description**: Check if the backend server is running
-   **Response**:
    ```json
    {
        "status": "healthy",
        "message": "Flask backend is running"
    }
    ```

### User Endpoints

#### Get All Users

-   **GET** `/api/users`
-   **Description**: Get all users or filter by company/role
-   **Query Parameters**:
    -   `company` (optional): Filter by company (google, veera, medidata)
    -   `role` (optional): Filter by role (Sponsor, Investigator)
-   **Response**:
    ```json
    {
        "users": [
            {
                "firstName": "Sarah",
                "lastName": "Johnson",
                "emailAddress": "sarah.johnson@regeneron.com",
                "companyAssociation": "Google",
                "role": "Sponsor",
                "fullName": "Sarah Johnson",
                "displayName": "Sponsor - Google",
                "initials": "SJ"
            }
        ],
        "total_count": 12
    }
    ```

#### Get Users by Company

-   **GET** `/api/users/{company}`
-   **Description**: Get users from a specific company
-   **Path Parameters**:
    -   `company`: Company name (google, veera, medidata)
-   **Response**: Same as above

### Study Endpoints

#### Get All Studies

-   **GET** `/api/studies`
-   **Description**: Get all studies or filter by sponsor/status
-   **Query Parameters**:
    -   `sponsor` (optional): Filter by sponsor name
    -   `status` (optional): Filter by status (draft, active, completed, on-hold)
-   **Response**:
    ```json
    {
        "studies": [
            {
                "id": "STD-001",
                "title": "Phase III Trial: Novel Cancer Treatment",
                "protocol": "A randomized, double-blind, placebo-controlled study...",
                "sponsor": "Regeneron Pharmaceuticals",
                "status": "active",
                "createdAt": "2024-01-15T00:00:00",
                "sites": [
                    {
                        "id": "SITE-001",
                        "name": "Johns Hopkins Hospital",
                        "investigator": "Dr. Sarah Johnson",
                        "location": "Baltimore, MD",
                        "status": "active",
                        "eSourceFiles": [],
                        "crfFiles": []
                    }
                ],
                "principalInvestigator": {
                    "name": "Dr. Sarah Johnson",
                    "email": "sarah.johnson@regeneron.com",
                    "institution": "Johns Hopkins Hospital",
                    "specialty": "Oncology"
                },
                "eSourceFiles": [
                    {
                        "id": "FILE-001",
                        "name": "eSource_Template_v2.1.pdf",
                        "type": "esource",
                        "uploadedBy": "Dr. Sarah Johnson",
                        "uploadedAt": "2024-01-20T00:00:00",
                        "status": "approved",
                        "size": 2048576
                    }
                ],
                "crfFiles": [
                    {
                        "id": "FILE-002",
                        "name": "CRF_Visit1_v1.0.pdf",
                        "type": "crf",
                        "uploadedBy": "Dr. Michael Chen",
                        "uploadedAt": "2024-01-22T00:00:00",
                        "status": "under-review",
                        "size": 1536000
                    }
                ],
                "totalSites": 3,
                "activeSites": 2,
                "hasPrincipalInvestigator": true
            }
        ],
        "total_count": 3
    }
    ```

#### Get Study by ID

-   **GET** `/api/studies/{study_id}`
-   **Description**: Get a specific study by its ID
-   **Path Parameters**:
    -   `study_id`: Study ID (e.g., STD-001)
-   **Response**:
    ```json
    {
        "study": {
            // Same structure as above
        }
    }
    ```

#### Create New Study

-   **POST** `/api/studies`
-   **Description**: Create a new study
-   **Request Body**:
    ```json
    {
        "title": "Phase II Study: Test Treatment",
        "protocol": "A test study protocol...",
        "sponsor": "Test Pharmaceuticals",
        "phase": "Phase II",
        "indication": "Test Indication",
        "principalInvestigator": {
            "name": "Dr. Test PI",
            "email": "test.pi@hospital.com",
            "institution": "Test Medical Center",
            "specialty": "Internal Medicine"
        }
    }
    ```
-   **Response**:
    ```json
    {
        "message": "Study created successfully",
        "study": {
            // Study object with generated ID
        }
    }
    ```

#### Add Principal Investigator to Study

-   **POST** `/api/studies/{study_id}/investigator`
-   **Description**: Add or update principal investigator for a study
-   **Path Parameters**:
    -   `study_id`: Study ID
-   **Request Body**:
    ```json
    {
        "name": "Dr. Test Investigator",
        "email": "test.investigator@hospital.com",
        "institution": "Test Hospital",
        "specialty": "Cardiology"
    }
    ```
-   **Response**:
    ```json
    {
        "message": "Principal investigator added successfully",
        "study": {
            // Updated study object
        }
    }
    ```

#### Get Database Statistics

-   **GET** `/api/database/stats`
-   **Description**: Get database statistics and counts
-   **Response**:
    ```json
    {
        "statistics": {
            "total_users": 12,
            "total_studies": 3,
            "users_by_company": {
                "Google": 4,
                "Veera Vault": 4,
                "Medidata": 4
            },
            "studies_by_status": {
                "active": 2,
                "draft": 1
            },
            "studies_without_investigator": 1
        }
    }
    ```

## Data Models

### User Model

```python
{
  "firstName": str,
  "lastName": str,
  "emailAddress": str,
  "companyAssociation": str,
  "role": str,  # "Sponsor" or "Investigator"
  "fullName": str,  # Computed field
  "displayName": str,  # Computed field
  "initials": str  # Computed field
}
```

### Study Model

```python
{
  "id": str,
  "title": str,
  "protocol": str,
  "sponsor": str,
  "status": str,  # "draft", "active", "completed", "on-hold"
  "createdAt": str,  # ISO datetime
  "sites": [Site],
  "principalInvestigator": PrincipalInvestigator | null,
  "eSourceFiles": [StudyFile],
  "crfFiles": [StudyFile],
  "totalSites": int,  # Computed field
  "activeSites": int,  # Computed field
  "hasPrincipalInvestigator": bool  # Computed field
}
```

### Site Model

```python
{
  "id": str,
  "name": str,
  "investigator": str,
  "location": str,
  "status": str,  # "pending", "active", "inactive"
  "eSourceFiles": [StudyFile],
  "crfFiles": [StudyFile]
}
```

### StudyFile Model

```python
{
  "id": str,
  "name": str,
  "type": str,  # "protocol", "esource", "crf"
  "uploadedBy": str,
  "uploadedAt": str,  # ISO datetime
  "status": str,  # "pending", "approved", "rejected", "under-review"
  "size": int
}
```

### PrincipalInvestigator Model

```python
{
  "name": str,
  "email": str,
  "institution": str,
  "specialty": str
}
```

## Database Setup

### Setup Script

The backend includes a setup script to initialize the database with users and studies:

```bash
# Setup database with initial data
python setup_database.py setup

# Show database status
python setup_database.py status

# Reset database (clear all data)
python setup_database.py reset

# Show help
python setup_database.py help
```

### Database Manager

The backend uses a `DatabaseManager` class that provides:

-   User management (CRUD operations)
-   Study management (CRUD operations)
-   Database statistics
-   Data export functionality

## Testing

Run the test script to verify all endpoints:

```bash
python test_endpoints.py
```

Make sure the Flask server is running first:

```bash
python app.py
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

-   **400**: Bad Request (missing required fields, invalid data)
-   **404**: Not Found (study/user not found)
-   **500**: Internal Server Error

Error response format:

```json
{
    "error": "Error message description"
}
```
