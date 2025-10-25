# Frontend-Backend Integration

This document describes how the frontend React application integrates with the Flask backend API.

## Overview

The frontend has been updated to fetch data from the backend instead of using local mock data. This provides a real-time connection between the frontend and backend systems.

## Architecture

```
Frontend (React) ←→ API Service ←→ Backend (Flask)
     ↓                    ↓              ↓
  Components         dataService.js    app.py
  (StudiesDashboard,    ↓              models.py
   CreateStudy)      api.js            database_manager.py
```

## Key Components

### 1. API Service (`src/services/api.js`)

-   **Purpose**: Low-level HTTP communication with backend
-   **Features**:
    -   Generic request method with error handling
    -   All backend endpoints mapped to methods
    -   Proper headers and JSON serialization
    -   Error handling and logging

### 2. Data Service (`src/services/dataService.js`)

-   **Purpose**: High-level data management and conversion
-   **Features**:
    -   Converts backend data to frontend models
    -   Handles data transformation between API and UI
    -   Provides clean interface for components
    -   Error handling and logging

### 3. Updated Components

#### StudiesDashboard

-   **Before**: Used local `mockStudies` data
-   **After**: Fetches studies from backend API
-   **Features**:
    -   Loading states while fetching data
    -   Error handling with retry functionality
    -   Real-time investigator addition via API
    -   Automatic data refresh

#### CreateStudy

-   **Before**: Simulated study creation
-   **After**: Creates studies via backend API
-   **Features**:
    -   Real study creation in backend
    -   Proper error handling
    -   Success feedback to user

## API Endpoints Used

### User Endpoints

-   `GET /api/users` - Get all users
-   `GET /api/users/{company}` - Get users by company
-   `GET /api/users?role={role}` - Get users by role

### Study Endpoints

-   `GET /api/studies` - Get all studies
-   `GET /api/studies/{id}` - Get specific study
-   `POST /api/studies` - Create new study
-   `POST /api/studies/{id}/investigator` - Add investigator to study

### Database Endpoints

-   `GET /api/database/stats` - Get database statistics
-   `GET /health` - Health check

## Data Flow

### 1. Studies Dashboard Load

```
Component Mount → useEffect → dataService.getStudies() →
apiService.getStudies() → Backend API →
Convert to Frontend Models → Update State → Render UI
```

### 2. Study Creation

```
Form Submit → dataService.createStudy() →
apiService.createStudy() → Backend API →
Success Response → Navigate to Dashboard
```

### 3. Investigator Addition

```
Modal Submit → dataService.addInvestigatorToStudy() →
apiService.addInvestigatorToStudy() → Backend API →
Update Study → Refresh UI
```

## Error Handling

### Network Errors

-   Connection failures
-   Timeout errors
-   Server errors (5xx)

### API Errors

-   Validation errors (400)
-   Not found errors (404)
-   Authentication errors (401/403)

### User Experience

-   Loading spinners during API calls
-   Error messages with retry options
-   Success notifications
-   Graceful degradation

## Testing

### Integration Tests

-   `src/utils/testIntegration.js` - Comprehensive test suite
-   `src/components/BackendTest.js` - UI component for testing
-   Available in development mode only

### Test Coverage

-   ✅ Backend connection
-   ✅ User data fetching
-   ✅ Study data fetching
-   ✅ Study creation
-   ✅ Investigator addition
-   ✅ Database statistics

## Configuration

### Backend URL

```javascript
// src/services/api.js
const API_BASE_URL = "http://localhost:5001";
```

### Environment Variables

-   `NODE_ENV=development` - Shows backend test component
-   Backend runs on port 5001
-   Frontend runs on port 3000

## Development Workflow

### 1. Start Backend

```bash
cd backend
python start_server.py
```

### 2. Start Frontend

```bash
cd sdvsdr
npm start
```

### 3. Test Integration

-   Open browser to `http://localhost:3000`
-   Navigate to Studies Dashboard
-   Use the "Backend Test" component (development only)
-   Run integration tests

## Data Models

### Frontend Models

-   `User` - User information and methods
-   `Study` - Study data with sites and files
-   `Site` - Study site information
-   `StudyFile` - File metadata

### Backend Models

-   `User` - Matches frontend structure
-   `Study` - Matches frontend structure
-   `Site` - Matches frontend structure
-   `StudyFile` - Matches frontend structure

### Data Conversion

The `dataService` automatically converts between backend JSON and frontend class instances, ensuring data consistency across the application.

## Benefits

### Real-time Data

-   ✅ Data is always current
-   ✅ Changes persist across sessions
-   ✅ Multiple users see same data

### Scalability

-   ✅ Backend can handle multiple frontend instances
-   ✅ Data is centralized
-   ✅ Easy to add new features

### Maintainability

-   ✅ Single source of truth for data
-   ✅ Clear separation of concerns
-   ✅ Easy to debug and test

## Troubleshooting

### Common Issues

1. **Backend not running**

    - Error: "Failed to fetch"
    - Solution: Start backend server

2. **CORS issues**

    - Error: CORS policy blocks request
    - Solution: Backend includes CORS headers

3. **Data not loading**
    - Check browser console for errors
    - Verify backend is responding
    - Check network tab for failed requests

### Debug Tools

-   Browser Developer Tools
-   Backend Test Component
-   Console logging in services
-   Network tab for API calls

## Future Enhancements

### Planned Features

-   Real-time updates with WebSockets
-   Offline support with caching
-   Advanced error recovery
-   Performance monitoring
-   API versioning

### Potential Improvements

-   Add authentication/authorization
-   Implement data validation
-   Add request/response interceptors
-   Implement retry logic with exponential backoff
-   Add request caching
