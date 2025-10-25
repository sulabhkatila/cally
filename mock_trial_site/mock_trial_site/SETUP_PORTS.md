# Port Configuration

The Mock Trial Site uses a shared configuration file (`config.json`) for port management.

## Configuration File

**Location**: `mock_trial_site/config.json`

```json
{
  "backend_port": 5500
}
```

## How It Works

### Backend (`mock_trial_site/backend/app.py`)
- Loads configuration from `config.json` on startup
- Uses `backend_port` from config (default: 5500)
- Falls back to port 5500 if config file is missing

### Frontend (`mock_trial_site/frontend/src/App.js`)
- Loads `config.json` from the public directory on component mount
- Uses `backend_port` to construct API URLs dynamically
- Falls back to port 5500 if config cannot be loaded

## Current Ports

- **Mock Trial Site Backend**: Port 5500 (configured in `config.json`)
- **Mock Trial Site Frontend**: Port 3002 (via `PORT=3002 npm start`)
- **SDV Platform Backend**: Port 5000
- **SDV Platform Frontend**: Port 3000

## Benefits

✅ Single source of truth for port configuration  
✅ Easy to change ports without code modifications  
✅ Consistent configuration across backend and frontend  
✅ Works in both development and production environments  
