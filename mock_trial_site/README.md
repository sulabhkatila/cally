# Mock Trial Site - Hospital Document Management System

A Flask backend and React frontend web application for hospitals to manage patient source documents in clinical trials.

## Features

-   📋 **Document Management**: View and download patient source documents
-   🔄 **Real-time Communication**: WebSocket connection between frontend and backend
-   🔐 **Access Control**: Trigger popup access requests to system users
-   📊 **Patient Grouping**: Organized by patient ID with document listings
-   📱 **Responsive Design**: Works on desktop and mobile devices

## Architecture

```
mock_trial_site/
├── backend/          # Flask API server
├── frontend/         # React web application
└── patients/         # Patient source documents (DOCX files)
    ├── patient_1/
    ├── patient_2/
    └── ...
```

## Setup

### Prerequisites

-   Python 3.8+
-   Node.js 16+ and npm
-   Git

### Backend Setup

1. Navigate to backend directory:

```bash
cd mock_trial_site/backend
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Start the server:

```bash
python app.py
```

Backend runs on **http://localhost:5003**

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd mock_trial_site/frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

Frontend runs on **http://localhost:3000**

## API Endpoints

### Backend (Port 5003)

-   `GET /` - Health check
-   `GET /api/patients` - Get all patients
-   `GET /api/patients/<patient_id>` - Get specific patient
-   `GET /patients/<patient_id>/<filename>` - Download document
-   `POST /api/request-access` - Trigger access request popup
-   `GET /health` - System health status

## Usage

### Viewing Documents

1. Open the frontend in your browser (http://localhost:3000)
2. Browse patient cards
3. Click on a patient to see their documents
4. Download any document by clicking the download button

### Requesting Access

1. Send a POST request to trigger an access popup:

```bash
curl -X POST http://localhost:5003/api/request-access
```

2. All connected clients will see a popup asking "Give access to the system?"
3. User can respond with "Yes" or "No"

## Directory Structure

```
mock_trial_site/
├── backend/
│   ├── app.py              # Flask application
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── App.css         # Styles
│   │   └── index.js        # Entry point
│   ├── package.json
│   └── package-lock.json
└── patients/               # Patient documents
    ├── patient_1/
    │   ├── doc1.docx
    │   └── doc2.docx
    └── patient_2/
        └── doc1.docx
```

## WebSocket Communication

The application uses WebSocket for real-time communication between frontend and backend:

-   **Connection**: Frontend establishes WebSocket connection to backend
-   **Access Requests**: Backend can send access request messages
-   **Responses**: Frontend sends user responses back to backend
-   **Real-time Updates**: Instant notification across all connected clients

## Development

### Backend Development

```bash
cd mock_trial_site/backend
python app.py  # Runs with auto-reload in debug mode
```

### Frontend Development

```bash
cd mock_trial_site/frontend
npm start      # Runs with hot-reload
```

## Production Deployment

### Build Frontend

```bash
cd mock_trial_site/frontend
npm run build
```

Build output will be in the `build/` directory.

### Deploy Backend

Use a production WSGI server like Gunicorn:

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5003 app:app
```

## API Examples

### Get All Patients

```bash
curl http://localhost:5003/api/patients
```

### Get Specific Patient

```bash
curl http://localhost:5003/api/patients/patient_1
```

### Trigger Access Request

```bash
curl -X POST http://localhost:5003/api/request-access
```

## Features in Detail

### 1. Document Viewing

-   Grid layout showing all patients
-   Click on patient card to view documents
-   Download individual documents
-   File size and metadata display

### 2. Access Control

-   Backend endpoint triggers access request
-   All connected clients receive popup
-   User can grant or deny access
-   Response sent back to backend

### 3. Real-time Updates

-   WebSocket connection maintained
-   Instant notifications
-   Multi-client support
-   Automatic reconnection

## Troubleshooting

### Backend won't start

-   Check if port 5003 is available
-   Verify Python dependencies are installed
-   Check `patients/` directory exists

### Frontend won't load

-   Ensure backend is running first
-   Check if port 3000 is available
-   Verify npm packages are installed

### Documents not showing

-   Verify DOCX files exist in patient directories
-   Check file permissions
-   Ensure correct patient directory structure

## Security Notes

⚠️ **This is a demo/mock application for development purposes only.**

-   No authentication implemented
-   No data encryption
-   Not suitable for production use
-   Do not use with real patient data

## Future Enhancements

-   [ ] Add user authentication
-   [ ] Implement proper WebSocket with Socket.IO
-   [ ] Add file upload capability
-   [ ] Add document preview
-   [ ] Implement search functionality
-   [ ] Add audit logging
-   [ ] Support multiple file formats

## License

This is a demonstration project for the SDV Platform.
