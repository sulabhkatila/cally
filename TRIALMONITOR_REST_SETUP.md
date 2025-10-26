# TrialMonitor Agent REST Endpoints Setup

## Overview

The TrialMonitor agent now supports REST endpoints for integration with the frontend application. This allows the frontend to make direct HTTP calls to the agent instead of using mock responses.

## REST Endpoints

### 1. Health Check

-   **URL**: `GET http://localhost:8004/health`
-   **Purpose**: Check agent status and capabilities
-   **Response**: Agent status, address, and available capabilities

### 2. Data Extraction

-   **URL**: `POST http://localhost:8004/extract-data`
-   **Purpose**: Extract data points from file content
-   **Request Body**:
    ```json
    {
        "fileName": "crf_file.pdf",
        "content": "File content here...",
        "dataPoints": ["patient_id", "date", "score"]
    }
    ```
-   **Response**:
    ```json
    {
        "success": true,
        "fileName": "crf_file.pdf",
        "extractedDataPoints": ["patient_id", "date", "score"],
        "error": null
    }
    ```

### 3. Data Verification

-   **URL**: `POST http://localhost:8004/verify-data`
-   **Purpose**: Verify CRF data against eSource data
-   **Request Body**:
    ```json
    {
        "crfData": "CRF content...",
        "esourceData": "eSource content...",
        "crfDataPoints": ["patient_id", "date"],
        "esourceDataPoints": ["patient_id", "date"]
    }
    ```
-   **Response**:
    ```json
    {
        "success": true,
        "verified": true,
        "verifiedDataPoints": ["patient_id"],
        "unverifiedDataPoints": [],
        "missingDataPoints": [],
        "discrepancyDataPoints": [],
        "additionalInformationNeeded": [],
        "error": null
    }
    ```

## Setup Instructions

### 1. Start the TrialMonitor Agent

```bash
cd agents2
python trial_monitor_agent.py
```

The agent will start on `http://localhost:8004` and display:

-   Agent address
-   Available capabilities
-   REST endpoints information

### 2. Test the REST Endpoints

```bash
# Run the test script
python test_trialmonitor_rest.py
```

This will test all three endpoints and verify they're working correctly.

### 3. Frontend Integration

The frontend (`fileScrapingService.js`) has been updated to:

-   Call actual REST endpoints instead of mock responses
-   Fall back to mock responses if the agent is not available
-   Handle errors gracefully

## Configuration

### Environment Variables

Make sure you have the required environment variables set:

```bash
# In agents2/.env file
GEMINI_API_KEY=your_gemini_api_key_here
```

### Agent Configuration

The agent is configured with:

-   **Port**: 8004
-   **Mailbox**: Enabled (for Agentverse deployment)
-   **Endpoint**: `http://localhost:8004/submit`

## Troubleshooting

### Agent Won't Start

1. Check if port 8004 is available
2. Verify GEMINI_API_KEY is set correctly
3. Check Python dependencies are installed

### REST Endpoints Not Responding

1. Verify the agent is running and shows "Starting server on http://0.0.0.0:8004"
2. Check firewall settings
3. Test with curl:
    ```bash
    curl http://localhost:8004/health
    ```

### Frontend Integration Issues

1. Check browser console for CORS errors
2. Verify the agent URL in `fileScrapingService.js`
3. Check network tab for failed requests

## Next Steps

1. **Deploy to Agentverse**: The agent can be deployed to Fetch.ai's Agentverse for production use
2. **Add More Endpoints**: Additional REST endpoints can be added for other agent capabilities
3. **Authentication**: Add authentication/authorization if needed
4. **Monitoring**: Add logging and monitoring for production use

## Example Usage

### Using curl

```bash
# Health check
curl http://localhost:8004/health

# Data extraction
curl -X POST http://localhost:8004/extract-data \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test.pdf", "content": "Patient ID: 123", "dataPoints": []}'

# Data verification
curl -X POST http://localhost:8004/verify-data \
  -H "Content-Type: application/json" \
  -d '{"crfData": "Patient: 123", "esourceData": "Patient: 123", "crfDataPoints": ["patient_id"], "esourceDataPoints": ["patient_id"]}'
```

### Using Python requests

```python
import requests

# Health check
response = requests.get("http://localhost:8004/health")
print(response.json())

# Data extraction
data = {
    "fileName": "test.pdf",
    "content": "Patient ID: 123",
    "dataPoints": []
}
response = requests.post("http://localhost:8004/extract-data", json=data)
print(response.json())
```
