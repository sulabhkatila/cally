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

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = "uploads"
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


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "message": "Flask backend is running"}), 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5001)
