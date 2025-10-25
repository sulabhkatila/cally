"""
Mock Trial Site Backend - Hospital Web Interface
Flask server with WebSocket support for real-time communication
"""

import os
from flask import Flask, jsonify, send_file
from flask_cors import CORS
from pathlib import Path
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Configuration
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "patients"
CONFIG_FILE = BASE_DIR / "config.json"


# Load configuration
def load_config():
    """Load configuration from config.json"""
    try:
        with open(CONFIG_FILE, "r") as f:
            config = json.load(f)
            return config
    except Exception as e:
        print(f"Warning: Could not load config.json: {e}")
        return {"backend_port": 5500}  # Default port


config = load_config()
BACKEND_PORT = config.get("backend_port", 5500)

# WebSocket management
connected_clients = []
access_request_active = False
access_response_status = "pending"  # 'pending', 'granted', 'denied'


@app.route("/")
def index():
    """Health check"""
    return jsonify({"status": "active", "service": "Mock Trial Site Backend"})


@app.route("/api/patients")
def get_patients():
    """Get all patients with their documents"""
    patient_data = {}

    if DATA_DIR.exists():
        for patient_dir in sorted(DATA_DIR.iterdir()):
            if patient_dir.is_dir():
                patient_id = patient_dir.name

                # Get all DOCX files for this patient
                source_files = []
                for file in sorted(patient_dir.glob("*.docx")):
                    file_info = {
                        "filename": file.name,
                        "file_path": f"/patients/{patient_id}/{file.name}",
                        "file_type": "document",
                        "file_size": file.stat().st_size,
                        "modified": os.path.getmtime(file),
                    }
                    source_files.append(file_info)

                if source_files:
                    patient_data[patient_id] = {
                        "patient_id": patient_id,
                        "file_count": len(source_files),
                        "files": source_files,
                    }

    return jsonify({"patients": patient_data, "total_patients": len(patient_data)})


@app.route("/api/patients/<patient_id>")
def get_patient(patient_id):
    """Get specific patient's files"""
    patient_dir = DATA_DIR / patient_id

    if not patient_dir.exists():
        return jsonify({"error": "Patient not found"}), 404

    files = []
    for file in sorted(patient_dir.glob("*.docx")):
        files.append(
            {
                "filename": file.name,
                "file_url": f"/patients/{patient_id}/{file.name}",
                "file_size": file.stat().st_size,
                "modified": os.path.getmtime(file),
            }
        )

    return jsonify({"patient_id": patient_id, "files": files, "file_count": len(files)})


@app.route("/patients/<patient_id>/<filename>")
def serve_file(patient_id, filename):
    """Serve individual patient files"""
    file_path = DATA_DIR / patient_id / filename

    if file_path.exists() and file_path.suffix == ".docx":
        return send_file(
            str(file_path),
            mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )
    else:
        return jsonify({"error": "File not found"}), 404


@app.route("/api/request-access", methods=["POST"])
def request_access():
    """Trigger an access request popup to connected clients"""
    global access_request_active, access_response_status

    access_request_active = True
    access_response_status = "pending"  # Reset response status

    # Broadcast to all connected WebSocket clients
    message = {
        "type": "access_request",
        "message": "Give access to the system?",
        "timestamp": datetime.now().isoformat(),
    }

    # In a real implementation, broadcast via WebSocket
    # For now, we'll simulate this
    broadcast_message(message)

    return jsonify(
        {
            "success": True,
            "message": "Access request sent to connected clients",
            "request": message,
        }
    )


@app.route("/api/check-access-request")
def check_access_request():
    """Check if there's an active access request"""
    global access_request_active

    return jsonify(
        {
            "active": access_request_active,
            "message": "Give access to the system?" if access_request_active else "",
        }
    )


@app.route("/api/check-access-response")
def check_access_response():
    """Check the status of an access response"""
    global access_response_status

    return jsonify(
        {
            "status": access_response_status,
            "granted": access_response_status == "granted",
            "denied": access_response_status == "denied",
            "pending": access_response_status == "pending",
        }
    )


@app.route("/api/access-response", methods=["POST"])
def access_response():
    """Handle access response from client"""
    global access_request_active, access_response_status
    from flask import request

    data = request.get_json()
    granted = data.get("granted", False)

    # Clear the access request and set response status
    access_request_active = False
    access_response_status = "granted" if granted else "denied"

    print(f"Access response received: {'Granted' if granted else 'Denied'}")

    return jsonify(
        {
            "success": True,
            "granted": granted,
            "message": f"Access {'granted' if granted else 'denied'}",
        }
    )


def broadcast_message(message):
    """Broadcast message to all connected clients"""
    # This would broadcast via WebSocket in production
    # For now, we'll just log it
    print(f"Broadcasting: {message}")
    # In real implementation:
    # for client in connected_clients:
    #     client.send(json.dumps(message))


@app.route("/health")
def health():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "data_directory": str(DATA_DIR),
            "data_directory_exists": DATA_DIR.exists(),
            "connected_clients": len(connected_clients),
        }
    )


if __name__ == "__main__":
    print("🏥 Mock Trial Site Backend")
    print(f"📁 Data directory: {DATA_DIR}")
    print(f"📍 Data exists: {DATA_DIR.exists()}")

    if DATA_DIR.exists():
        patient_count = len([d for d in DATA_DIR.iterdir() if d.is_dir()])
        print(f"👥 Patients: {patient_count}")

    print(f"\n🌐 Backend Server running on http://localhost:{BACKEND_PORT}")
    print(f"📋 API: http://localhost:{BACKEND_PORT}/api/patients")
    print("🔌 Ready for WebSocket connections")

    app.run(port=BACKEND_PORT, debug=True)
