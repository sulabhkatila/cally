import React, { useEffect, useRef, useState } from "react";
import "./App.css";

// Load backend URL from config or use default
const getBackendPort = async () => {
    try {
        const response = await fetch("/config.json");
        const config = await response.json();
        return config.backend_port || 5500;
    } catch (error) {
        console.warn("Could not load config.json, using default port 5500");
        return 5500;
    }
};

// For now, we'll use a simple approach - read from config on mount
let API_URL = "http://localhost:5500"; // Will be updated on mount

function App() {
    const [patients, setPatients] = useState({});
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showAccessPopup, setShowAccessPopup] = useState(false);
    const [accessMessage, setAccessMessage] = useState("");
    const [backendPort, setBackendPort] = useState(5500); // Default port
    const wsRef = useRef(null);

    // Load backend port from config
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch("/config.json");
                const config = await response.json();
                setBackendPort(config.backend_port || 5500);
                console.log(
                    `Backend port loaded from config: ${config.backend_port}`
                );
            } catch (error) {
                console.warn(
                    "Could not load config.json, using default port 5500"
                );
                setBackendPort(5500);
            }
        };
        loadConfig();
    }, []);

    // WebSocket connection
    useEffect(() => {
        // Note: In production, you would use wss:// for secure WebSocket
        // For now, we'll simulate WebSocket with polling
        const connectWebSocket = () => {
            // Simulated WebSocket - in production use: const ws = new WebSocket(`ws://localhost:${backendPort}`);
            console.log(
                `WebSocket connection established on port ${backendPort}`
            );
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [backendPort]);

    // Simulate WebSocket messages with polling
    useEffect(() => {
        const pollForAccessRequests = async () => {
            try {
                // In production, this would be real WebSocket message handling
                // For demo, we'll check via HTTP endpoint
                const response = await fetch(
                    `http://localhost:${backendPort}/api/check-access-request`
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.active) {
                        setAccessMessage(
                            data.message || "Give access to the system?"
                        );
                        setShowAccessPopup(true);
                    }
                }
            } catch (error) {
                console.error("Error checking for access requests:", error);
            }
        };

        // Poll every 5 seconds
        const interval = setInterval(pollForAccessRequests, 5000);

        return () => clearInterval(interval);
    }, [backendPort]);

    // Fetch patients on load
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch(
                    `http://localhost:${backendPort}/api/patients`
                );
                const data = await response.json();
                setPatients(data.patients || {});
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };

        fetchPatients();
    }, [backendPort]);

    const handlePatientClick = async (patientId) => {
        try {
            const response = await fetch(
                `http://localhost:${backendPort}/api/patients/${patientId}`
            );
            const data = await response.json();
            setSelectedPatient(data);
        } catch (error) {
            console.error("Error fetching patient details:", error);
        }
    };

    const handleAccessResponse = async (granted) => {
        // Send response to backend
        try {
            await fetch(`http://localhost:${backendPort}/api/access-response`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ granted }),
            });
        } catch (error) {
            console.error("Error sending access response:", error);
        }

        setShowAccessPopup(false);
        setAccessMessage("");
    };

    const downloadFile = (fileUrl, filename) => {
        window.open(`http://localhost:${backendPort}${fileUrl}`, "_blank");
    };

    return (
        <div className="App">
            <header className="App-header">
                <h1>🏥 Hospital Document Management System</h1>
                <p>Mock Trial Site - Patient Source Documents</p>
            </header>

            {/* Access Request Popup */}
            {showAccessPopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Access Request</h2>
                        <p>{accessMessage}</p>
                        <div className="popup-buttons">
                            <button
                                className="btn btn-yes"
                                onClick={() => handleAccessResponse(true)}
                            >
                                Yes
                            </button>
                            <button
                                className="btn btn-no"
                                onClick={() => handleAccessResponse(false)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="main-content">
                <div className="patients-grid">
                    {Object.keys(patients).map((patientId) => (
                        <div
                            key={patientId}
                            className="patient-card"
                            onClick={() => handlePatientClick(patientId)}
                        >
                            <div className="patient-header">
                                <h2>{patientId}</h2>
                                <span className="file-count">
                                    {patients[patientId].file_count} documents
                                </span>
                            </div>
                            <div className="patient-files">
                                {patients[patientId].files
                                    .slice(0, 3)
                                    .map((file, idx) => (
                                        <div key={idx} className="file-item">
                                            📄 {file.filename}
                                        </div>
                                    ))}
                                {patients[patientId].files.length > 3 && (
                                    <div className="more-files">
                                        +{patients[patientId].files.length - 3}{" "}
                                        more
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {selectedPatient && (
                    <div className="patient-details">
                        <div className="details-header">
                            <h2>Patient: {selectedPatient.patient_id}</h2>
                            <button
                                className="close-btn"
                                onClick={() => setSelectedPatient(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="documents-list">
                            {selectedPatient.files.map((file, idx) => (
                                <div key={idx} className="document-item">
                                    <div className="doc-info">
                                        <h3>{file.filename}</h3>
                                        <p>
                                            Size:{" "}
                                            {(file.file_size / 1024).toFixed(2)}{" "}
                                            KB
                                        </p>
                                    </div>
                                    <button
                                        className="download-btn"
                                        onClick={() =>
                                            downloadFile(
                                                file.file_url,
                                                file.filename
                                            )
                                        }
                                    >
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
