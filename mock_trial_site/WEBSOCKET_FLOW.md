# WebSocket Access Request Flow

## Architecture

```
SDV Platform (sdvsdr)  →  Mock Trial Site Backend (localhost:5003)  ↔  Mock Trial Site Frontend (localhost:3000)
   [Sponsor]                      [Flask API + WebSocket]                    [Investigator View]
```

## Flow

### 1. Sponsor Initiates Request (SDV Platform)

**Location:** `sdvsdr/src/pages/StudiesDashboard.js`

**Action:** Sponsor clicks "Connect to Investigator" button on a study card

**Code:**

```javascript
const handleConnectToInvestigator = async (study, e) => {
    e.stopPropagation();

    // Send POST request to mock trial site backend
    const response = await fetch("http://localhost:5003/api/request-access", {
        method: "POST",
        body: JSON.stringify({
            study_id: study.id,
            investigator: study.principalInvestigator.name,
            message: `Access request for ${study.title}`,
        }),
    });
};
```

### 2. Backend Processes Request

**Location:** `mock_trial_site/backend/app.py`

**Endpoint:** `POST /api/request-access`

**Action:**

1. Sets global flag `access_request_active = True`
2. Logs the request
3. Returns success response

### 3. Frontend Polls for Requests

**Location:** `mock_trial_site/frontend/src/App.js`

**Action:** Frontend polls `/api/check-access-request` every 5 seconds

**Code:**

```javascript
useEffect(() => {
    const pollForAccessRequests = async () => {
        const response = await fetch(`${API_URL}/api/check-access-request`);
        const data = await response.json();

        if (data.active) {
            setAccessMessage(data.message);
            setShowAccessPopup(true);
        }
    };

    const interval = setInterval(pollForAccessRequests, 5000);
    return () => clearInterval(interval);
}, []);
```

### 4. User Responds

**Actions:**

-   User clicks "Yes" or "No"
-   Frontend sends response to `/api/access-response`
-   Backend clears the `access_request_active` flag
-   Popup disappears

## Endpoints

### Backend API

| Method | Endpoint                    | Description                   |
| ------ | --------------------------- | ----------------------------- |
| POST   | `/api/request-access`       | Trigger access request        |
| GET    | `/api/check-access-request` | Check if request is active    |
| POST   | `/api/access-response`      | Submit user response (Yes/No) |

## Testing the Flow

### 1. Start All Services

**Terminal 1 - Mock Trial Site Backend:**

```bash
cd mock_trial_site/backend
python app.py
```

**Terminal 2 - Mock Trial Site Frontend:**

```bash
cd mock_trial_site/frontend
npm start
```

**Terminal 3 - SDV Platform Backend:**

```bash
cd backend
python app.py
```

**Terminal 4 - SDV Platform Frontend:**

```bash
cd sdvsdr
npm start
```

### 2. Simulate the Flow

1. **Open SDV Platform** (http://localhost:3001)
2. **Login as a Sponsor**
3. **View Studies Dashboard**
4. **Find a study with an investigator assigned**
5. **Click "🔌 Connect to Investigator" button**
6. **Open Mock Trial Site** (http://localhost:3000)
7. **Wait up to 5 seconds** - popup should appear!
8. **Click "Yes" or "No"** on the popup

### 3. Verify Response

Check backend terminal for:

```
Broadcasting: {'type': 'access_request', 'message': 'Give access to the system?', ...}
Access response received: Granted
```

## Future Enhancement: Real WebSocket

Currently using HTTP polling (every 5 seconds). For production, implement real WebSocket:

```python
# backend/app.py
from flask_socketio import SocketIO, emit

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    connected_clients.append(request.sid)
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    connected_clients.remove(request.sid)
    print('Client disconnected')
```

```javascript
// frontend/src/App.js
import io from "socket.io-client";

const socket = io("http://localhost:5003");

socket.on("access_request", (data) => {
    setAccessMessage(data.message);
    setShowAccessPopup(true);
});
```

## Summary

✅ **SDV Platform** → Sponsor clicks "Connect to Investigator"  
✅ **Mock Trial Backend** → Receives request, sets flag  
✅ **Mock Trial Frontend** → Polls and detects flag  
✅ **User Response** → Yes/No sent back, flag cleared  
✅ **All Connected** → Complete access request flow!
