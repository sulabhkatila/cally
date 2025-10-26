import os
import uuid
from flask import Flask, request, jsonify, g
from werkzeug.utils import secure_filename
import chromadb
from chromadb.api import ClientAPI
from chromadb.api.models.Collection import Collection
import PyPDF2
import pandas as pd
from io import BytesIO
import json
from config import IS_LOCAL, CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE
from database_manager import (
    get_all_users,
    get_users_by_company,
    get_users_by_role,
    get_study_by_id,
    get_studies_by_sponsor,
    get_studies_by_status,
    add_investigator_to_study,
    get_database_statistics,
    db_manager,
)

app = Flask(__name__)


# Enable CORS for all routes
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response


# Configuration
UPLOAD_FOLDER = "uploads"


# Initialize database on startup
def initialize_database():
    """Initialize the database with mock data on server startup."""
    try:
        print("Initializing database...")
        db_manager.ensure_data_loaded()
        stats = get_database_statistics()
        print(f"✅ Database initialized successfully!")
        print(f"   - Users: {stats['total_users']}")
        print(f"   - Studies: {stats['total_studies']}")
        print(f"   - Studies without PI: {stats['studies_without_investigator']}")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")


# Initialize database when the app starts
initialize_database()
ALLOWED_EXTENSIONS = {"pdf", "csv"}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

# Create upload directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Global variable for local/cloud configuration
islocal = IS_LOCAL


def get_chroma_client() -> ClientAPI:
    """Get ChromaDB client (local or cloud based on islocal flag)."""
    if islocal:
        if "chroma_client" not in g:
            g.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        return g.chroma_client
    else:
        if "chroma_client" not in g:
            g.chroma_client = chromadb.CloudClient(
                api_key=CHROMA_API_KEY, tenant=CHROMA_TENANT, database=CHROMA_DATABASE
            )
        return g.chroma_client


def get_chroma_collection() -> Collection:
    """Get ChromaDB collection (local or cloud based on islocal flag)."""
    chroma_client = get_chroma_client()
    if "chroma_collection" not in g:
        g.chroma_collection = chroma_client.get_or_create_collection(
            name="documents", metadata={"hnsw:space": "cosine"}
        )
    return g.chroma_collection


def allowed_file(filename):
    """Check if the uploaded file has an allowed extension."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def extract_text_from_pdf(file_content):
    """Extract text content from PDF file."""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def extract_text_from_csv(file_content):
    """Extract text content from CSV file."""
    try:
        # Read CSV content
        df = pd.read_csv(BytesIO(file_content))

        # Convert DataFrame to text representation
        text_content = (
            f"CSV Data with {len(df)} rows and {len(df.columns)} columns:\n\n"
        )
        text_content += f"Columns: {', '.join(df.columns.tolist())}\n\n"

        # Add first few rows as text
        text_content += "Sample data:\n"
        text_content += df.head(10).to_string(index=False)

        # Add summary statistics for numeric columns
        numeric_cols = df.select_dtypes(include=["number"]).columns
        if len(numeric_cols) > 0:
            text_content += "\n\nSummary statistics:\n"
            text_content += df[numeric_cols].describe().to_string()

        return text_content
    except Exception as e:
        raise Exception(f"Error processing CSV file: {str(e)}")


def process_file(file_content, filename):
    """Process uploaded file and extract text content."""
    file_extension = filename.rsplit(".", 1)[1].lower()

    if file_extension == "pdf":
        return extract_text_from_pdf(file_content)
    elif file_extension == "csv":
        return extract_text_from_csv(file_content)
    else:
        raise Exception(f"Unsupported file type: {file_extension}")


@app.route("/upload", methods=["POST"])
def upload_file():
    """Handle file upload and store in ChromaDB."""
    try:
        # Check if file is present in request
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]

        # Check if file is selected
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Check if file has allowed extension
        if not allowed_file(file.filename):
            return (
                jsonify(
                    {
                        "error": f'File type not allowed. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
                    }
                ),
                400,
            )

        # Read file content
        file_content = file.read()

        # Process file and extract text
        text_content = process_file(file_content, file.filename)

        if not text_content.strip():
            return (
                jsonify({"error": "No text content could be extracted from the file"}),
                400,
            )

        # Generate unique ID for the document
        doc_id = str(uuid.uuid4())

        # Store in ChromaDB
        collection = get_chroma_collection()
        collection.add(
            documents=[text_content],
            metadatas=[
                {
                    "filename": secure_filename(file.filename),
                    "file_type": file.filename.rsplit(".", 1)[1].lower(),
                    "file_size": len(file_content),
                }
            ],
            ids=[doc_id],
        )

        return (
            jsonify(
                {
                    "message": "File uploaded and processed successfully",
                    "document_id": doc_id,
                    "filename": secure_filename(file.filename),
                    "content_length": len(text_content),
                    "file_type": file.filename.rsplit(".", 1)[1].lower(),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/search", methods=["POST"])
def search_documents():
    """Search for documents in ChromaDB."""
    try:
        data = request.get_json()

        if not data or "query" not in data:
            return jsonify({"error": "Query parameter is required"}), 400

        query = data["query"]
        n_results = data.get("n_results", 5)

        # Search in ChromaDB
        collection = get_chroma_collection()
        results = collection.query(query_texts=[query], n_results=n_results)

        # Format results
        formatted_results = []
        if results["documents"] and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                formatted_results.append(
                    {
                        "document_id": results["ids"][0][i],
                        "content": doc,
                        "metadata": results["metadatas"][0][i],
                        "distance": (
                            results["distances"][0][i] if results["distances"] else None
                        ),
                    }
                )

        return (
            jsonify(
                {
                    "query": query,
                    "results": formatted_results,
                    "total_results": len(formatted_results),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/documents", methods=["GET"])
def list_documents():
    """List all documents in the collection."""
    try:
        # Get all documents from collection
        collection = get_chroma_collection()
        results = collection.get()

        documents = []
        if results["documents"]:
            for i, doc in enumerate(results["documents"]):
                documents.append(
                    {
                        "document_id": results["ids"][i],
                        "content_preview": doc[:200] + "..." if len(doc) > 200 else doc,
                        "metadata": results["metadatas"][i],
                    }
                )

        return jsonify({"documents": documents, "total_count": len(documents)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# User endpoints
@app.route("/api/users", methods=["GET"])
def get_users():
    """Get all users or filter by company/role."""
    try:
        company = request.args.get("company")
        role = request.args.get("role")

        if company:
            users = get_users_by_company(company)
        elif role:
            users = get_users_by_role(role)
        else:
            users = get_all_users()

        return (
            jsonify(
                {"users": [user.to_dict() for user in users], "total_count": len(users)}
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<company>", methods=["GET"])
def get_users_by_company_endpoint(company):
    """Get users by specific company."""
    try:
        users = get_users_by_company(company)
        return (
            jsonify(
                {
                    "users": [user.to_dict() for user in users],
                    "company": company,
                    "total_count": len(users),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Study endpoints
@app.route("/api/studies", methods=["GET"])
def get_studies():
    """Get all studies or filter by sponsor/status."""
    try:
        sponsor = request.args.get("sponsor")
        status = request.args.get("status")

        if sponsor:
            studies = get_studies_by_sponsor(sponsor)
        elif status:
            studies = get_studies_by_status(status)
        else:
            studies = db_manager.get_all_studies()

        return (
            jsonify(
                {
                    "studies": [study.to_dict() for study in studies],
                    "total_count": len(studies),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/studies/<study_id>", methods=["GET"])
def get_study(study_id):
    """Get specific study by ID."""
    try:
        study = get_study_by_id(study_id)
        if not study:
            return jsonify({"error": "Study not found"}), 404

        return jsonify({"study": study.to_dict()}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/studies/<study_id>/investigator", methods=["POST"])
def add_investigator_to_study_endpoint(study_id):
    """Add principal investigator to a study."""
    try:
        study = get_study_by_id(study_id)
        if not study:
            return jsonify({"error": "Study not found"}), 404

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ["name", "email", "institution", "specialty"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Set the principal investigator using database manager
        success = add_investigator_to_study(study_id, data)
        if not success:
            return jsonify({"error": "Failed to add investigator"}), 500

        return (
            jsonify(
                {
                    "message": "Principal investigator added successfully",
                    "study": study.to_dict(),
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/studies", methods=["POST"])
def create_study():
    """Create a new study."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ["title", "protocol", "sponsor", "phase", "indication"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Generate new study ID
        study_id = f"STD-{db_manager.get_study_count() + 1:03d}"

        # Create new study
        from datetime import datetime
        from models import Study

        new_study = Study(
            study_id=study_id,
            title=data["title"],
            protocol=data["protocol"],
            sponsor=data["sponsor"],
            status="draft",
            created_at=datetime.now(),
            sites=[],
            principal_investigator=data.get("principalInvestigator"),
            protocol_analysis=data.get("protocolAnalysis"),
        )

        # Add to database
        success = db_manager.add_study(new_study)
        if not success:
            return jsonify({"error": "Failed to create study"}), 500

        return (
            jsonify(
                {"message": "Study created successfully", "study": new_study.to_dict()}
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/analyze-protocol", methods=["POST"])
def analyze_protocol():
    """Analyze clinical trial protocol using TrialMonitor agent."""
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        # Read file content
        file_content = file.read()

        # Convert to text based on file type
        if file.filename.lower().endswith(".pdf"):
            import PyPDF2

            pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
            text_content = ""
            for page in pdf_reader.pages:
                text_content += page.extract_text() + "\n"
        elif file.filename.lower().endswith((".doc", ".docx")):
            # For now, return error for DOC files as we need python-docx
            return (
                jsonify(
                    {
                        "error": "DOC/DOCX files not supported yet. Please use PDF or TXT."
                    }
                ),
                400,
            )
        else:
            # Assume it's a text file
            text_content = file_content.decode("utf-8")

        # Call TrialMonitor agent for protocol analysis
        # This would be a call to the hosted TrialMonitor agent
        # For now, we'll simulate the response structure
        analysis_result = {
            "trial_overview": {
                "protocol_title": "Extracted from protocol",
                "protocol_number": "PROT-001",
                "study_phase": "Phase III",
                "trial_type": "Interventional",
                "indication": "Extracted indication",
            },
            "primary_objectives": {
                "primary_objectives": "Extracted objectives",
                "primary_endpoints": "Extracted endpoints",
                "secondary_endpoints": "Extracted secondary endpoints",
            },
            "trial_design": {
                "study_design": "Randomized, double-blind, placebo-controlled",
                "randomization": "Yes",
                "blinding": "Double-blind",
                "sample_size": "500 patients",
                "duration": "24 weeks",
            },
            "eligibility_criteria": {
                "inclusion_criteria": ["Criterion 1", "Criterion 2"],
                "exclusion_criteria": ["Exclusion 1", "Exclusion 2"],
            },
            "monitoring_requirements": {
                "monitoring_schedule": "Every 4 weeks",
                "sdv_requirements": "100% for primary endpoints",
                "source_document_verification": "Required for all AEs",
            },
            "key_personnel": {
                "principal_investigators": "To be assigned",
                "study_sites": "To be determined",
                "sponsor": "Current user",
            },
            "timeline": {
                "visit_schedule": "Screening, Baseline, Weeks 4,8,12,16,20,24",
                "key_milestones": "Enrollment, Data collection, Analysis",
                "duration_of_participation": "24 weeks",
            },
            "safety_monitoring": {
                "safety_endpoints": "Adverse events, laboratory assessments",
                "adverse_event_monitoring": "Throughout study",
                "dsmb_requirements": "Review at 25% and 50% enrollment",
            },
            "statistical_analysis": {
                "statistical_methods": "ANCOVA with baseline adjustment",
                "primary_analysis": "Change from baseline at Week 24",
                "sample_size_calculation": "500 patients (90% power, α=0.05)",
            },
            "other_details": {
                "special_procedures": "ECG monitoring, laboratory assessments",
                "regulatory_information": "Phase III study for regulatory submission",
            },
        }

        return jsonify(analysis_result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/database/stats", methods=["GET"])
def get_database_stats():
    """Get database statistics."""
    try:
        stats = get_database_statistics()
        return jsonify({"statistics": stats}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/files/crf", methods=["GET"])
def get_crf_files():
    """Get list of CRF files from mocks/crf directory."""
    try:
        # Path to the CRF files directory
        crf_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), "sdvsdr", "mocks", "crf"
        )

        if not os.path.exists(crf_dir):
            return jsonify({"error": "CRF directory not found"}), 404

        files = []
        for filename in os.listdir(crf_dir):
            # Only show PDF files
            if filename.endswith(".pdf"):
                file_path = os.path.join(crf_dir, filename)
                file_stat = os.stat(file_path)

                # Determine file type and description based on filename
                file_type = "Unknown"
                description = "Clinical trial data file"

                if "adverseeffect" in filename.lower():
                    file_type = "Adverse Effect"
                    description = "Adverse event reporting form"
                elif "demographics" in filename.lower():
                    file_type = "Demographics"
                    description = "Patient demographic information"
                elif "diseaseactivity" in filename.lower():
                    file_type = "Disease Activity"
                    description = "Disease activity assessment scores"
                elif "medicalhistory" in filename.lower():
                    file_type = "Medical History"
                    description = "Patient medical history and comorbidities"
                elif "medications" in filename.lower():
                    file_type = "Medications"
                    description = "Current and prior medications"
                elif "week0-10" in filename.lower():
                    file_type = "Visit Data (Week 0-10)"
                    description = "Longitudinal visit data across weeks 0-10"
                elif "week0" in filename.lower() and "week0-10" not in filename.lower():
                    file_type = "Baseline Visit"
                    description = "Baseline visit assessments and measurements"

                files.append(
                    {
                        "id": f"FILE-{len(files) + 1:03d}",
                        "name": filename,
                        "type": file_type,
                        "status": "completed",
                        "uploadedBy": "Dr. Sarah Johnson",
                        "uploadedAt": "2024-01-15",
                        "description": description,
                        "size": file_stat.st_size,
                        "modified": file_stat.st_mtime,
                    }
                )

        # Sort files by name
        files.sort(key=lambda x: x["name"])

        return jsonify({"files": files})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/files/crf/<filename>", methods=["GET"])
def get_crf_file(filename):
    """Serve CRF files for preview."""
    try:
        # Path to the CRF files directory
        crf_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), "sdvsdr", "mocks", "crf"
        )

        # Security check - ensure filename doesn't contain path traversal
        if ".." in filename or "/" in filename or "\\" in filename:
            return jsonify({"error": "Invalid filename"}), 400

        # If requesting a DOCX file, serve the PDF version instead
        if filename.endswith(".docx"):
            pdf_filename = filename.replace(".docx", ".pdf")
            file_path = os.path.join(crf_dir, pdf_filename)
        else:
            file_path = os.path.join(crf_dir, filename)

        if not os.path.exists(file_path):
            return jsonify({"error": "File not found"}), 404

        # Serve the file with appropriate headers
        from flask import send_file

        return send_file(
            file_path,
            as_attachment=False,
            mimetype="application/pdf",
            download_name=os.path.basename(file_path),
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "message": "Flask backend is running"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
