#!/usr/bin/env python3
"""
Startup script for the SDV Platform backend server.
This script starts the Flask server with proper configuration.
"""

import os
import sys
from app import app


def main():
    """Start the Flask server."""
    print("=" * 60)
    print("SDV PLATFORM BACKEND SERVER")
    print("=" * 60)
    print()
    print("Starting Flask server...")
    print("Server will be available at: http://localhost:5001")
    print("API Documentation: See API_DOCUMENTATION.md")
    print()
    print("Database will be automatically initialized on startup")
    print()
    print("Available endpoints:")
    print("- GET  /health")
    print("- GET  /api/users")
    print("- GET  /api/users/{company}")
    print("- GET  /api/studies")
    print("- GET  /api/studies/{study_id}")
    print("- POST /api/studies")
    print("- POST /api/studies/{study_id}/investigator")
    print("- GET  /api/database/stats")
    print()
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    print()

    try:
        app.run(debug=True, host="0.0.0.0", port=5001)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
