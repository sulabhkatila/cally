import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5003";

function App() {
    const [patients, setPatients] = useState({});
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showAccessPopup, setShowAccessPopup] = useState(false);
    const [accessMessage, setAccessMessage] = useState("");
    const wsRef = useRef(null);

    // WebSocket connection
    useEffect(() => {
        // Note: In production, you would use wss:// for secure WebSocket
        // For now, we'll simulate WebSocket with polling
        const connectWebSocket = () => {
            // Simulated WebSocket - in production use: const ws = new WebSocket('ws://localhost:5003');
            console.log("WebSocket connection established");
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    // Simulate WebSocket messages with polling
    useEffect(() => {
        const pollForAccessRequests = async () => {
            try {
                // In production, this would be real WebSocket message handling
                // For demo, we'll check via HTTP endpoint
                const response = await fetch(
                    `${API_URL}/api/check-access-request`
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
    }, []);

    // Fetch patients on load
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch(`${API_URL}/api/patients`);
                const data = await response.json();
                setPatients(data.patients || {});
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };

        fetchPatients();
    }, []);

    const handlePatientClick = async (patientId) => {
        try {
            const response = await fetch(
                `${API_URL}/api/patients/${patientId}`
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
            await fetch(`${API_URL}/api/access-response`, {
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
        window.open(`${API_URL}${fileUrl}`, "_blank");
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
