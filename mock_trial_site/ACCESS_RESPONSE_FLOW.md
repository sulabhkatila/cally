# Access Request/Response Flow

## Overview

This document describes how the access request and response flow works between the SDV Platform (sponsor) and the Mock Trial Site (investigator).

## Architecture

```
SDV Platform (Frontend)  →  Mock Trial Backend  →  Mock Trial Frontend
   [Sponsor]                    [Port 5500]              [Investigator]
   
   Polls for response       Stores response           User clicks Yes/No
   Shows result             status in global           Sends response
                           variable
```

## Flow Diagram

```
1. Sponsor clicks "Connect to Investigator"
   ↓
2. SDV Frontend → POST /api/request-access
   ↓
3. Mock Backend sets access_request_active = True
   ↓
4. Mock Backend resets access_response_status = "pending"
   ↓
5. Mock Frontend polls /api/check-access-request
   ↓
6. Mock Frontend shows popup to investigator
   ↓
7. Investigator clicks "Yes" or "No"
   ↓
8. Mock Frontend → POST /api/access-response
   ↓
9. Mock Backend sets access_response_status = "granted" or "denied"
   ↓
10. SDV Frontend polls /api/check-access-response
   ↓
11. SDV Frontend displays result to sponsor
```

## Backend Endpoints

### 1. POST `/api/request-access`
**Triggered by:** SDV Platform (Sponsor)

**Purpose:** Initiate an access request

**Request:**
```json
{
  "study_id": "study123",
  "investigator": "Dr. Smith",
  "message": "Access request for Clinical Trial XYZ"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access request sent to connected clients",
  "request": {
    "type": "access_request",
    "message": "Give access to the system?",
    "timestamp": "2024-10-25T16:00:00"
  }
}
```

### 2. GET `/api/check-access-request`
**Triggered by:** Mock Trial Frontend

**Purpose:** Check if there's an active access request (for showing popup)

**Response:**
```json
{
  "active": true,
  "message": "Give access to the system?"
}
```

### 3. POST `/api/access-response`
**Triggered by:** Mock Trial Frontend (Investigator)

**Purpose:** Submit the investigator's Yes/No response

**Request:**
```json
{
  "granted": true  // or false
}
```

**Response:**
```json
{
  "success": true,
  "granted": true,
  "message": "Access granted"
}
```

### 4. GET `/api/check-access-response` (NEW)
**Triggered by:** SDV Platform (Sponsor)

**Purpose:** Poll for the investigator's response

**Response:**
```json
{
  "status": "pending",  // "pending", "granted", or "denied"
  "granted": false,
  "denied": false,
  "pending": true
}
```

## Global State Variables

The backend maintains two global variables:

1. **`access_request_active`**: Boolean indicating if there's an active request
2. **`access_response_status`**: String with values:
   - `"pending"`: Waiting for response
   - `"granted"`: Access was granted
   - `"denied"`: Access was denied

## Frontend Implementation

### SDV Platform (sdvsdr/src/pages/StudiesDashboard.js)

**pollForAccessResponse()** function:
- Polls `/api/check-access-response` every 1 second
- Stops when status is not "pending"
- Shows success/error message based on response

### Mock Trial Site (mock_trial_site/frontend/src/App.js)

Existing implementation:
- Polls `/api/check-access-request` every 5 seconds
- Shows popup when active
- Sends response to `/api/access-response`

## Testing

Run the test script to verify the complete flow:

```bash
cd mock_trial_site
python test_response_flow.py
```

This will test:
1. ✅ Triggering an access request
2. ✅ Checking pending status
3. ✅ Simulating granted response
4. ✅ Checking granted status
5. ✅ Simulating denied response
6. ✅ Checking denied status

## User Experience

### For Sponsor (SDV Platform):
1. Clicks "Connect to Investigator" button
2. Sees: "⏳ Access request sent... Waiting for response..."
3. Waits while polling (up to 60 seconds)
4. Sees one of:
   - "✅ Access GRANTED - You can now access their trial site data"
   - "❌ Access DENIED - They have declined your access request"
   - "⏱️ No response received - Request timed out"

### For Investigator (Mock Trial Site):
1. Popup appears: "Give access to the system?"
2. Clicks "Yes" or "No"
3. Backend receives and stores the response
4. Popup closes

## Benefits

✅ **Real-time feedback**: Sponsor sees immediate confirmation  
✅ **Reliable**: Uses polling to avoid missed responses  
✅ **User-friendly**: Clear status messages  
✅ **Timeout handling**: Stops polling after 60 seconds  
✅ **Status tracking**: Backend maintains state throughout the flow  

## Future Enhancements

- [ ] Add WebSocket support for instant updates (replace polling)
- [ ] Store response history in database
- [ ] Add request context (study details, investigator info)
- [ ] Add email notifications
- [ ] Add request expiration (auto-deny after timeout)
