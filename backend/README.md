# SDV Platform Backend

A Flask backend service for the SDV (Source Data Verification) Platform that provides document storage, user management, and study management capabilities.

## Features

### Document Management

-   **File Upload**: Accept PDF and CSV files via REST API
-   **Text Extraction**: Automatically extract text content from uploaded files
-   **ChromaDB Integration**: Store documents in ChromaDB for vector-based search
-   **Semantic Search**: Search through documents using natural language queries
-   **Document Management**: List and manage uploaded documents

### User Management

-   **User Data**: Manage users with roles (Sponsor, Investigator)
-   **Company Association**: Organize users by company (Google, Veera Vault, Medidata)
-   **User Filtering**: Filter users by company or role

### Study Management

-   **Study CRUD**: Create, read, update studies
-   **Principal Investigator Management**: Assign investigators to studies
-   **Study Status Tracking**: Track study status (draft, active, completed, on-hold)
-   **Site Management**: Manage study sites and investigators
-   **File Management**: Handle study-related files (protocols, eSource, CRF)

## Prerequisites

-   Python 3.9+
-   Virtual environment (recommended)
-   ChromaDB Cloud account (optional, for cloud mode)

## Installation

1. **Clone the repository** (if not already done):

    ```bash
    git clone <your-repo-url>
    cd backend
    ```

2. **Create and activate virtual environment**:

    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. **Install dependencies**:

    ```bash
    pip install -r requirements.txt
    ```

4. **Configure environment** (optional):
    ```bash
    cp .env.example .env
    # Edit .env file with your ChromaDB Cloud credentials if using cloud mode
    ```

## Usage

### Starting the Server

```bash
python app.py
```

Or use the startup script for better output:

```bash
python start_server.py
```

The server will start on `http://localhost:5001`

### Database Setup

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

### Testing the API

Run the test script to verify all endpoints:

```bash
python test_endpoints.py
```

Or run the demo to see the setup in action:

```bash
python demo_setup.py
```

### API Endpoints

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

#### User Management Endpoints

-   **GET** `/api/users` - Get all users or filter by company/role
-   **GET** `/api/users/{company}` - Get users by company

#### Study Management Endpoints

-   **GET** `/api/studies` - Get all studies or filter by sponsor/status
-   **GET** `/api/studies/{study_id}` - Get specific study
-   **POST** `/api/studies` - Create new study
-   **POST** `/api/studies/{study_id}/investigator` - Add investigator to study

#### Document Management Endpoints

#### 1. Upload File

**POST** `/upload`

Upload a PDF or CSV file for processing and storage.

**Request:**

-   Method: POST
-   Content-Type: multipart/form-data
-   Body: file (PDF or CSV)

**Example using curl:**

```bash
curl -X POST -F "file=@document.pdf" http://localhost:5001/upload
```

**Response:**

```json
{
    "message": "File uploaded and processed successfully",
    "document_id": "uuid-string",
    "filename": "document.pdf",
    "content_length": 1234,
    "file_type": "pdf"
}
```

#### 2. Search Documents

**POST** `/search`

Search through uploaded documents using natural language queries.

**Request:**

```json
{
    "query": "your search query here",
    "n_results": 5
}
```

**Example using curl:**

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "financial data", "n_results": 3}' \
  http://localhost:5001/search
```

**Response:**

```json
{
    "query": "financial data",
    "results": [
        {
            "document_id": "uuid-string",
            "content": "extracted text content...",
            "metadata": {
                "filename": "document.pdf",
                "file_type": "pdf",
                "file_size": 1234
            },
            "distance": 0.123
        }
    ],
    "total_results": 1
}
```

#### 3. List Documents

**GET** `/documents`

Get a list of all uploaded documents.

**Example using curl:**

```bash
curl http://localhost:5001/documents
```

**Response:**

```json
{
    "documents": [
        {
            "document_id": "uuid-string",
            "content_preview": "First 200 characters of content...",
            "metadata": {
                "filename": "document.pdf",
                "file_type": "pdf",
                "file_size": 1234
            }
        }
    ],
    "total_count": 1
}
```

#### 4. Health Check

**GET** `/health`

Check if the service is running.

**Example using curl:**

```bash
curl http://localhost:5001/health
```

**Response:**

```json
{
    "status": "healthy",
    "message": "Flask backend is running"
}
```

## File Processing

### PDF Files

-   Uses PyPDF2 to extract text from PDF documents
-   Processes all pages in the document
-   Handles text extraction errors gracefully

### CSV Files

-   Uses pandas to read and process CSV data
-   Converts data to text format including:
    -   Column names
    -   Sample data (first 10 rows)
    -   Summary statistics for numeric columns
-   Handles various CSV formats and encodings

## ChromaDB Configuration

The application supports both local and cloud ChromaDB configurations:

### Local Mode (Default)

-   **Database**: DuckDB with Parquet storage
-   **Persistence**: Data stored in `./chroma_db` directory
-   **Collection**: Named "documents"
-   **Embedding Space**: Cosine similarity
-   **Default Embedding Model**: ChromaDB's default sentence transformer

### Cloud Mode

-   **Database**: ChromaDB Cloud
-   **Configuration**: Set via environment variables in `.env` file
-   **Collection**: Named "documents"
-   **Embedding Space**: Cosine similarity

### Switching Between Modes

Set `IS_LOCAL=true` in your `.env` file for local mode, or `IS_LOCAL=false` for cloud mode.

## Error Handling

The API includes comprehensive error handling for:

-   Invalid file types
-   File processing errors
-   ChromaDB connection issues
-   Missing request parameters
-   File size limits (16MB max)

## Development

### Project Structure

```
backend/
├── app.py                    # Main Flask application
├── models.py                 # Data models (User, Study, Site, StudyFile)
├── mock_data.py              # Mock data for users and studies
├── database_manager.py       # Database management and operations
├── setup_database.py         # Database setup and initialization script
├── demo_setup.py             # Demonstration of database setup
├── config.py                 # Configuration management
├── start_server.py           # Server startup script
├── test_endpoints.py         # API endpoint testing script
├── requirements.txt          # Python dependencies
├── README.md                # This file
├── API_DOCUMENTATION.md     # Detailed API documentation
├── .env.example             # Environment variables template
├── uploads/                 # Temporary file storage (auto-created)
└── chroma_db/               # ChromaDB data storage (auto-created, local mode only)
```

### Adding New File Types

To support additional file types:

1. Add the extension to `ALLOWED_EXTENSIONS` in `app.py`
2. Create a new extraction function (e.g., `extract_text_from_docx`)
3. Update the `process_file` function to handle the new type

### Environment Variables

You can customize the application using environment variables:

-   `FLASK_ENV`: Set to 'development' for debug mode
-   `UPLOAD_FOLDER`: Custom upload directory path
-   `MAX_CONTENT_LENGTH`: Maximum file size in bytes

## Troubleshooting

### Common Issues

1. **ChromaDB Connection Error**:

    - Ensure the `chroma_db` directory is writable
    - Check if ChromaDB dependencies are properly installed

2. **File Upload Fails**:

    - Verify file size is under 16MB
    - Check file extension is supported (pdf, csv)
    - Ensure file is not corrupted

3. **Text Extraction Issues**:
    - For PDFs: Some PDFs may have images or complex layouts
    - For CSVs: Check file encoding and delimiter format

### Logs

The application runs in debug mode by default, providing detailed error messages and stack traces for troubleshooting.

## License

This project is part of the CalHacks SDV backend implementation.
