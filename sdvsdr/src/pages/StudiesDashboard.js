import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackendTest from "../components/BackendTest.js";
import Navbar from "../components/Navbar.js";
import apiService from "../services/api.js";
import dataService from "../services/dataService.js";
import { getUser } from "../utils/userStorage.js";
import "./StudiesDashboard.css";

const StudiesDashboard = () => {
    const navigate = useNavigate();
    const user = getUser();

    // Get the authentication method to determine EDC provider
    const getEDCProvider = () => {
        const authMethod = localStorage.getItem("authMethod");
        if (authMethod === "Medidata SSO") {
            return { name: "Medidata Rave", color: "#10B981", icon: "🏥" };
        } else if (authMethod === "Veera Vault SSO") {
            return { name: "Veeva Vault", color: "#6366F1", icon: "📊" };
        } else if (authMethod === "Google SSO") {
            return { name: "Google Cloud", color: "#4285F4", icon: "☁️" };
        }
        return { name: "EDC", color: "#6B7280", icon: "📋" }; // Default fallback
    };

    const edcProvider = getEDCProvider();
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudy, setSelectedStudy] = useState(null);
    const [showInvestigatorModal, setShowInvestigatorModal] = useState(false);
    const [currentStudy, setCurrentStudy] = useState(null);
    const [investigatorData, setInvestigatorData] = useState({
        name: "",
        email: "",
        institution: "",
        specialty: "",
    });
    const [showAgentModal, setShowAgentModal] = useState(false);
    const [agentResponse, setAgentResponse] = useState("");
    const [isQueryingAgent, setIsQueryingAgent] = useState(false);
    const [connectedStudies, setConnectedStudies] = useState(new Set());
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [accessModalMessage, setAccessModalMessage] = useState("");
    const [accessModalTitle, setAccessModalTitle] = useState("");
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
    const [showFileViewerModal, setShowFileViewerModal] = useState(false);
    const [selectedStudyForFiles, setSelectedStudyForFiles] = useState(null);
    const [availableFiles, setAvailableFiles] = useState([]);
    const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);
    const [selectedFileForPreview, setSelectedFileForPreview] = useState(null);

    const isSponsor = user?.role === "Sponsor";
    const isInvestigator = user?.role === "Investigator";

    // Fetch studies from backend on component mount
    useEffect(() => {
        const fetchStudies = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await dataService.getStudies();
                setStudies(response.studies);
            } catch (err) {
                console.error("Error fetching studies:", err);
                setError("Failed to load studies. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchStudies();
    }, []);

    const handleCreateStudy = () => {
        navigate("/create-study");
    };

    const handleStudyClick = (study) => {
        setSelectedStudy(study);
        navigate(`/study/${study.id}`);
    };

    const handleGenerateMonitoringPlan = (study, e) => {
        e.stopPropagation();
        // Navigate to create study page with pre-filled study data for monitoring plan generation
        navigate("/create-study", {
            state: {
                generateMonitoringPlan: true,
                studyData: study,
            },
        });
    };

    const handleAddInvestigator = (study) => {
        setCurrentStudy(study);
        setShowInvestigatorModal(true);
        setInvestigatorData({
            name: "",
            email: "",
            institution: "",
            specialty: "",
        });
    };

    const handleInvestigatorInputChange = (e) => {
        const { name, value } = e.target;
        setInvestigatorData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSaveInvestigator = async () => {
        if (
            currentStudy &&
            investigatorData.name &&
            investigatorData.email &&
            investigatorData.institution &&
            investigatorData.specialty
        ) {
            try {
                // Add investigator to study via backend API
                const response = await dataService.addInvestigatorToStudy(
                    currentStudy.id,
                    investigatorData
                );

                // Update the studies list with the updated study
                const updatedStudies = studies.map((study) => {
                    if (study.id === currentStudy.id) {
                        return response.study;
                    }
                    return study;
                });

                setStudies(updatedStudies);
                setShowInvestigatorModal(false);
                setCurrentStudy(null);
                setInvestigatorData({
                    name: "",
                    email: "",
                    institution: "",
                    specialty: "",
                });

                // Show success message
                alert("Investigator added successfully!");
            } catch (error) {
                console.error("Error adding investigator:", error);
                alert("Failed to add investigator. Please try again.");
            }
        }
    };

    const handleCloseInvestigatorModal = () => {
        setShowInvestigatorModal(false);
        setCurrentStudy(null);
        setInvestigatorData({
            name: "",
            email: "",
            institution: "",
            specialty: "",
        });
    };

    const handleConnectToInvestigator = async (study, e) => {
        e.stopPropagation();

        if (!study.hasPrincipalInvestigator()) {
            alert("Please add an investigator first before connecting.");
            return;
        }

        try {
            // Trigger access request to investigator's site
            const response = await fetch(
                "http://localhost:5500/api/request-access",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        study_id: study.id,
                        investigator: study.principalInvestigator.name,
                        message: `Access request for ${study.title}`,
                    }),
                }
            );

            const data = await response.json();

            if (data.success) {
                // Start polling for response
                pollForAccessResponse(study);
            } else {
                setAccessModalTitle("❌ Error");
                setAccessModalMessage(
                    "Failed to send access request. Please try again."
                );
                setShowAccessModal(true);
                setIsWaitingForResponse(false);
            }
        } catch (error) {
            console.error("Error connecting to investigator:", error);
            setAccessModalTitle("❌ Connection Error");
            setAccessModalMessage(
                "Failed to connect to investigator site. Please try again."
            );
            setShowAccessModal(true);
            setIsWaitingForResponse(false);
        }
    };

    const pollForAccessResponse = async (study) => {
        const maxAttempts = 60; // Wait up to 60 seconds
        let attempts = 0;

        const pollInterval = setInterval(async () => {
            attempts++;

            try {
                const response = await fetch(
                    "http://localhost:5500/api/check-access-response"
                );

                if (response.ok) {
                    const data = await response.json();

                    // If we have a response (granted/denied)
                    if (data.status !== "pending") {
                        clearInterval(pollInterval);

                        if (data.status === "granted") {
                            // Mark study as connected
                            setConnectedStudies(
                                (prev) => new Set([...prev, study.id])
                            );
                            setAccessModalTitle("✅ Access Granted");
                            setAccessModalMessage(
                                `Access GRANTED by ${study.principalInvestigator.name}\n\nYou can now access their trial site data.`
                            );
                            setIsWaitingForResponse(false);
                        } else if (data.status === "denied") {
                            setAccessModalTitle("❌ Access Denied");
                            setAccessModalMessage(
                                `Access DENIED by ${study.principalInvestigator.name}\n\nThey have declined your access request.`
                            );
                            setIsWaitingForResponse(false);
                        }
                    }
                }
            } catch (error) {
                console.error("Error polling for access response:", error);
            }

            // Stop polling after max attempts
            if (attempts >= maxAttempts) {
                clearInterval(pollInterval);
                setAccessModalTitle("⏱️ Request Timeout");
                setAccessModalMessage(
                    "No response received from investigator. The request may have timed out."
                );
                setIsWaitingForResponse(false);
            }
        }, 1000); // Poll every 1 second

        // Show modal with initial message
        setAccessModalTitle("⏳ Access Request Sent");
        setAccessModalMessage(
            `Access request sent to ${study.principalInvestigator.name}\n\nWaiting for their response...`
        );
        setShowAccessModal(true);
        setIsWaitingForResponse(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "#10B981";
            case "draft":
                return "#F59E0B";
            case "completed":
                return "#6B7280";
            case "on-hold":
                return "#EF4444";
            default:
                return "#6B7280";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "active":
                return "🟢";
            case "draft":
                return "🟡";
            case "completed":
                return "⚪";
            case "on-hold":
                return "🔴";
            default:
                return "⚪";
        }
    };

    const handleQueryAgent = async (study, e) => {
        e.stopPropagation();

        try {
            setIsQueryingAgent(true);
            setShowAgentModal(true);
            setAgentResponse("Querying ClinicalTriailAnalyzer agent...");

            // Query the Fetch.ai agent
            // TODO: Replace with actual Fetch.ai agent integration
            // For now, we'll simulate the response
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const agentMessage = `The Clinical Trial Analyzer agent is a specialized AI agent for clinical trial protocol analysis.

**Key Capabilities:**
• Analyzes clinical trial protocol text content
• Extracts key trial information (objectives, endpoints, eligibility criteria)
• Understands monitoring schedules and SDV requirements
• Provides expert knowledge about clinical trial methodology
• Answers questions about clinical trials and protocols

**Agent Details:**
• Powered by Google Gemini AI
• Runs on Fetch.ai's decentralized agent network
• Specialized in clinical trial protocol analysis

**Integration:**
The agent can help with:
- Protocol text analysis and interpretation
- Monitoring schedule extraction
- Eligibility criteria analysis
- SDV requirements identification
- Regulatory compliance guidance`;

            setAgentResponse(agentMessage);
        } catch (error) {
            console.error("Error querying agent:", error);
            setAgentResponse("Error querying agent. Please try again later.");
        } finally {
            setIsQueryingAgent(false);
        }
    };

    // Handle opening file viewer modal
    const handleViewData = async (study) => {
        try {
            setSelectedStudyForFiles(study);
            setShowFileViewerModal(true);

            // Fetch actual files from the backend
            const files = await dataService.getCRFFiles();
            setAvailableFiles(files);
        } catch (error) {
            console.error("Error fetching CRF files:", error);
            // Fallback to empty array if API fails
            setAvailableFiles([]);
        }
    };

    // Handle file preview
    const handleFilePreview = (file) => {
        setSelectedFileForPreview(file);
        setShowFilePreviewModal(true);
    };

    return (
        <div className="studies-dashboard">
            <Navbar />
            <div className="dashboard-header">
                <div className="header-content">
                    <div className="header-left">
                        <h1>Clinical Studies</h1>
                        <p>
                            Manage your clinical trials and source data
                            verification
                        </p>
                        <div
                            className="edc-provider-indicator"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginTop: "8px",
                                fontSize: "12px",
                                color: "#a0a0a0",
                            }}
                        >
                            <span style={{ color: edcProvider.color }}>
                                {edcProvider.icon}
                            </span>
                            <span>EDC connected via {edcProvider.name}</span>
                        </div>
                    </div>
                    <div className="header-right">
                        {isSponsor && (
                            <button
                                className="create-study-btn"
                                onClick={handleCreateStudy}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path
                                        fill="currentColor"
                                        d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                                    />
                                </svg>
                                Create Study
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                {/* Loading and Error States */}
                {loading && (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading studies...</p>
                    </div>
                )}

                {error && (
                    <div className="error-container">
                        <p className="error-message">{error}</p>
                        <button
                            className="retry-btn"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {isSponsor ? (
                            // Sponsor view - all studies
                            <div className="studies-grid">
                                {studies.map((study) => (
                                    <div
                                        key={study.id}
                                        className="study-card"
                                        onClick={() => handleStudyClick(study)}
                                    >
                                        <div className="study-header">
                                            <div className="study-title">
                                                <h3>{study.title}</h3>
                                                <span className="study-id">
                                                    {study.id}
                                                </span>
                                            </div>
                                            <div className="study-status">
                                                <span
                                                    className="status-badge"
                                                    style={{
                                                        backgroundColor:
                                                            getStatusColor(
                                                                study.status
                                                            ),
                                                    }}
                                                >
                                                    {getStatusIcon(
                                                        study.status
                                                    )}{" "}
                                                    {study.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="study-details">
                                            <div className="detail-item">
                                                <span className="label">
                                                    Sponsor:
                                                </span>
                                                <span className="value">
                                                    {study.sponsor}
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">
                                                    Sites:
                                                </span>
                                                <span className="value">
                                                    {study.getActiveSites()}/
                                                    {study.getTotalSites()}{" "}
                                                    active
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">
                                                    Created:
                                                </span>
                                                <span className="value">
                                                    {study.createdAt.toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="study-investigator">
                                            <div className="detail-item">
                                                <span className="label">
                                                    Principal Investigator:
                                                </span>
                                                <span className="value">
                                                    {study.hasPrincipalInvestigator() ? (
                                                        <div className="investigator-info">
                                                            <span className="investigator-name">
                                                                {
                                                                    study
                                                                        .principalInvestigator
                                                                        .name
                                                                }
                                                            </span>
                                                            <span className="investigator-details">
                                                                {
                                                                    study
                                                                        .principalInvestigator
                                                                        .institution
                                                                }{" "}
                                                                •{" "}
                                                                {
                                                                    study
                                                                        .principalInvestigator
                                                                        .specialty
                                                                }
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="missing-investigator">
                                                            <span className="warning-icon">
                                                                ⚠️
                                                            </span>
                                                            <span className="warning-text">
                                                                Missing
                                                                Investigator
                                                            </span>
                                                            {isSponsor && (
                                                                <button
                                                                    className="add-investigator-btn"
                                                                    onClick={(
                                                                        e
                                                                    ) => {
                                                                        e.stopPropagation();
                                                                        handleAddInvestigator(
                                                                            study
                                                                        );
                                                                    }}
                                                                >
                                                                    Add
                                                                    Investigator
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="study-files">
                                            <div className="file-section">
                                                <h4>Protocol</h4>
                                                <div className="file-status">
                                                    <span className="file-icon">
                                                        📄
                                                    </span>
                                                    <span className="file-name">
                                                        Protocol Document
                                                    </span>
                                                    <span className="file-status-badge approved">
                                                        ✓
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="file-section">
                                                <h4>EDC</h4>
                                                <div
                                                    className="file-count"
                                                    style={{
                                                        color: edcProvider.color,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            marginRight: "6px",
                                                        }}
                                                    >
                                                        {edcProvider.icon}
                                                    </span>
                                                    connected via{" "}
                                                    {edcProvider.name}
                                                </div>
                                                <button
                                                    className="view-data-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewData(study);
                                                    }}
                                                    style={{
                                                        background: `linear-gradient(135deg, ${edcProvider.color}15, ${edcProvider.color}08)`,
                                                        border: `1px solid ${edcProvider.color}30`,
                                                        color: edcProvider.color,
                                                        padding: "8px 16px",
                                                        borderRadius: "10px",
                                                        fontSize: "12px",
                                                        fontWeight: "600",
                                                        cursor: "pointer",
                                                        transition:
                                                            "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                        marginTop: "10px",
                                                        width: "100%",
                                                        backdropFilter:
                                                            "blur(10px)",
                                                        boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                                                        letterSpacing: "0.3px",
                                                        position: "relative",
                                                        overflow: "hidden",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background = `linear-gradient(135deg, ${edcProvider.color}25, ${edcProvider.color}15)`;
                                                        e.target.style.borderColor = `${edcProvider.color}50`;
                                                        e.target.style.transform =
                                                            "translateY(-2px)";
                                                        e.target.style.boxShadow = `0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px ${edcProvider.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.15)`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background = `linear-gradient(135deg, ${edcProvider.color}15, ${edcProvider.color}08)`;
                                                        e.target.style.borderColor = `${edcProvider.color}30`;
                                                        e.target.style.transform =
                                                            "translateY(0)";
                                                        e.target.style.boxShadow = `0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`;
                                                    }}
                                                >
                                                    📊 View Data
                                                </button>
                                            </div>
                                        </div>

                                        {/* Study Action Buttons */}
                                        <div className="study-actions">
                                            {/* Generate Monitoring Plan Button - Always visible for sponsors */}
                                            {isSponsor && (
                                                <button
                                                    className="generate-monitoring-plan-btn"
                                                    onClick={(e) =>
                                                        handleGenerateMonitoringPlan(
                                                            study,
                                                            e
                                                        )
                                                    }
                                                >
                                                    📋 Generate Monitoring Plan
                                                </button>
                                            )}

                                            {/* Connect to Investigator Button or Query AI Agent Button */}
                                            {study.hasPrincipalInvestigator() && (
                                                <>
                                                    {connectedStudies.has(
                                                        study.id
                                                    ) ? (
                                                        <button
                                                            className="query-agent-btn"
                                                            onClick={(e) =>
                                                                handleQueryAgent(
                                                                    study,
                                                                    e
                                                                )
                                                            }
                                                        >
                                                            🤖 Query AI Agent
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="connect-investigator-btn"
                                                            onClick={(e) =>
                                                                handleConnectToInvestigator(
                                                                    study,
                                                                    e
                                                                )
                                                            }
                                                        >
                                                            🔌 Connect to
                                                            Investigator
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : isInvestigator ? (
                            // Investigator view - only assigned studies
                            <div className="studies-grid">
                                {studies
                                    .filter((study) =>
                                        study.sites.some(
                                            (site) =>
                                                site.investigator ===
                                                user.getFullName()
                                        )
                                    )
                                    .map((study) => (
                                        <div
                                            key={study.id}
                                            className="study-card investigator-card"
                                            onClick={() =>
                                                handleStudyClick(study)
                                            }
                                        >
                                            <div className="study-header">
                                                <div className="study-title">
                                                    <h3>{study.title}</h3>
                                                    <span className="study-id">
                                                        {study.id}
                                                    </span>
                                                </div>
                                                <div className="study-status">
                                                    <span
                                                        className="status-badge"
                                                        style={{
                                                            backgroundColor:
                                                                getStatusColor(
                                                                    study.status
                                                                ),
                                                        }}
                                                    >
                                                        {getStatusIcon(
                                                            study.status
                                                        )}{" "}
                                                        {study.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="study-details">
                                                <div className="detail-item">
                                                    <span className="label">
                                                        Your Site:
                                                    </span>
                                                    <span className="value">
                                                        {
                                                            study.sites.find(
                                                                (site) =>
                                                                    site.investigator ===
                                                                    user.getFullName()
                                                            )?.name
                                                        }
                                                    </span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">
                                                        Sponsor:
                                                    </span>
                                                    <span className="value">
                                                        {study.sponsor}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="investigator-actions">
                                                <div className="action-section">
                                                    <h4>Your Uploads</h4>
                                                    <div className="upload-status">
                                                        <div className="upload-item">
                                                            <span className="upload-icon">
                                                                📤
                                                            </span>
                                                            <span className="upload-label">
                                                                eSource Files
                                                            </span>
                                                            <span className="upload-count">
                                                                {
                                                                    study.eSourceFiles.filter(
                                                                        (
                                                                            file
                                                                        ) =>
                                                                            file.uploadedBy ===
                                                                            user.getFullName()
                                                                    ).length
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="upload-item">
                                                            <span className="upload-icon">
                                                                📤
                                                            </span>
                                                            <span className="upload-label">
                                                                CRF Files
                                                            </span>
                                                            <span className="upload-count">
                                                                {
                                                                    study.crfFiles.filter(
                                                                        (
                                                                            file
                                                                        ) =>
                                                                            file.uploadedBy ===
                                                                            user.getFullName()
                                                                    ).length
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="no-access">
                                <h2>Access Denied</h2>
                                <p>
                                    You don't have permission to view studies.
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Backend Test Component (Development Only) */}
            {process.env.NODE_ENV === "development" && <BackendTest />}

            {/* Access Request Modal */}
            {showAccessModal && (
                <div
                    className="access-modal-overlay"
                    onClick={() => {
                        if (!isWaitingForResponse) {
                            setShowAccessModal(false);
                        }
                    }}
                >
                    <div
                        className="access-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="access-modal-header">
                            <h2>{accessModalTitle}</h2>
                            {!isWaitingForResponse && (
                                <button
                                    className="access-modal-close"
                                    onClick={() => setShowAccessModal(false)}
                                >
                                    ×
                                </button>
                            )}
                        </div>

                        <div className="access-modal-body">
                            {isWaitingForResponse ? (
                                <div className="waiting-indicator">
                                    <div className="pulse-animation"></div>
                                    <p style={{ whiteSpace: "pre-wrap" }}>
                                        {accessModalMessage}
                                    </p>
                                </div>
                            ) : (
                                <div className="access-modal-message">
                                    <pre
                                        style={{
                                            whiteSpace: "pre-wrap",
                                            fontFamily: "inherit",
                                            margin: 0,
                                        }}
                                    >
                                        {accessModalMessage}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="access-modal-actions">
                            <button
                                className="access-modal-ok-btn"
                                onClick={() => setShowAccessModal(false)}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Agent Response Modal */}
            {showAgentModal && (
                <div
                    className="agent-modal-overlay"
                    onClick={() => setShowAgentModal(false)}
                >
                    <div
                        className="agent-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>🤖 Clinical Trial Analyzer Agent</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowAgentModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            {isQueryingAgent ? (
                                <div className="loading-agent">
                                    <div className="loading-spinner"></div>
                                    <p>Querying agent...</p>
                                </div>
                            ) : (
                                <div className="agent-response">
                                    <pre
                                        style={{
                                            whiteSpace: "pre-wrap",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {agentResponse}
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowAgentModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Investigator Modal */}
            {showInvestigatorModal && (
                <div
                    className="investigator-modal-overlay"
                    onClick={handleCloseInvestigatorModal}
                >
                    <div
                        className="investigator-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Add Principal Investigator</h2>
                            <button
                                className="modal-close"
                                onClick={handleCloseInvestigatorModal}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-description">
                                Add a principal investigator for:{" "}
                                <strong>{currentStudy?.title}</strong>
                            </p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="modalInvestigatorName">
                                        Investigator Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="modalInvestigatorName"
                                        name="name"
                                        value={investigatorData.name}
                                        onChange={handleInvestigatorInputChange}
                                        placeholder="e.g., Dr. Sarah Johnson"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="modalInvestigatorEmail">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="modalInvestigatorEmail"
                                        name="email"
                                        value={investigatorData.email}
                                        onChange={handleInvestigatorInputChange}
                                        placeholder="e.g., sarah.johnson@hospital.com"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="modalInvestigatorInstitution">
                                        Institution *
                                    </label>
                                    <input
                                        type="text"
                                        id="modalInvestigatorInstitution"
                                        name="institution"
                                        value={investigatorData.institution}
                                        onChange={handleInvestigatorInputChange}
                                        placeholder="e.g., Johns Hopkins Hospital"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="modalInvestigatorSpecialty">
                                        Medical Specialty *
                                    </label>
                                    <input
                                        type="text"
                                        id="modalInvestigatorSpecialty"
                                        name="specialty"
                                        value={investigatorData.specialty}
                                        onChange={handleInvestigatorInputChange}
                                        placeholder="e.g., Oncology, Cardiology"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={handleCloseInvestigatorModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="submit-btn"
                                onClick={handleSaveInvestigator}
                                disabled={
                                    !investigatorData.name ||
                                    !investigatorData.email ||
                                    !investigatorData.institution ||
                                    !investigatorData.specialty
                                }
                            >
                                Add Investigator
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* File Viewer Modal */}
            {showFileViewerModal && selectedStudyForFiles && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowFileViewerModal(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.85)",
                        backdropFilter: "blur(20px) saturate(1.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}
                >
                    <div
                        className="modal-content file-viewer-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background:
                                "linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "24px",
                            boxShadow:
                                "0 25px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                            maxWidth: "900px",
                            width: "100%",
                            maxHeight: "90vh",
                            overflow: "hidden",
                            position: "relative",
                        }}
                    >
                        <div
                            className="modal-header"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
                                borderBottom:
                                    "1px solid rgba(255, 255, 255, 0.08)",
                                padding: "24px 32px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                position: "relative",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                }}
                            >
                                <div
                                    style={{
                                        background: `linear-gradient(135deg, ${edcProvider.color}20, ${edcProvider.color}10)`,
                                        border: `1px solid ${edcProvider.color}30`,
                                        borderRadius: "12px",
                                        padding: "8px 12px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: edcProvider.color,
                                            fontSize: "18px",
                                            filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.1))",
                                        }}
                                    >
                                        {edcProvider.icon}
                                    </span>
                                    <span
                                        style={{
                                            color: "#ffffff",
                                            fontSize: "16px",
                                            fontWeight: "600",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        EDC Data
                                    </span>
                                </div>
                                <div
                                    style={{
                                        color: "#a0a0a0",
                                        fontSize: "14px",
                                        fontWeight: "500",
                                    }}
                                >
                                    {selectedStudyForFiles.title}
                                </div>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setShowFileViewerModal(false)}
                                style={{
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "12px",
                                    color: "#ffffff",
                                    fontSize: "20px",
                                    fontWeight: "300",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    backdropFilter: "blur(10px)",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background =
                                        "rgba(255, 255, 255, 0.1)";
                                    e.target.style.borderColor =
                                        "rgba(255, 255, 255, 0.2)";
                                    e.target.style.transform = "scale(1.05)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background =
                                        "rgba(255, 255, 255, 0.05)";
                                    e.target.style.borderColor =
                                        "rgba(255, 255, 255, 0.1)";
                                    e.target.style.transform = "scale(1)";
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div
                            className="modal-body"
                            style={{
                                padding: "32px",
                                maxHeight: "calc(90vh - 120px)",
                                overflowY: "auto",
                            }}
                        >
                            <div
                                className="edc-connection-info"
                                style={{
                                    background: `linear-gradient(135deg, ${edcProvider.color}08, ${edcProvider.color}03)`,
                                    border: `1px solid ${edcProvider.color}20`,
                                    borderRadius: "16px",
                                    padding: "20px",
                                    marginBottom: "24px",
                                    position: "relative",
                                    backdropFilter: "blur(10px)",
                                    boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <div
                                        style={{
                                            background: `linear-gradient(135deg, ${edcProvider.color}30, ${edcProvider.color}15)`,
                                            border: `1px solid ${edcProvider.color}40`,
                                            borderRadius: "10px",
                                            padding: "6px 8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                color: edcProvider.color,
                                                fontSize: "16px",
                                                filter: "drop-shadow(0 0 6px rgba(255, 255, 255, 0.1))",
                                            }}
                                        >
                                            {edcProvider.icon}
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            fontWeight: "600",
                                            color: "#ffffff",
                                            fontSize: "15px",
                                            letterSpacing: "0.3px",
                                        }}
                                    >
                                        Connected via {edcProvider.name}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        color: "#a0a0a0",
                                        fontSize: "13px",
                                        margin: 0,
                                        fontWeight: "400",
                                        lineHeight: "1.4",
                                    }}
                                >
                                    Viewing CRF data from your EDC connection
                                </p>
                            </div>

                            <div className="files-list">
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: "20px",
                                        paddingBottom: "12px",
                                        borderBottom:
                                            "1px solid rgba(255, 255, 255, 0.08)",
                                    }}
                                >
                                    <h3
                                        style={{
                                            color: "#ffffff",
                                            margin: 0,
                                            fontSize: "18px",
                                            fontWeight: "600",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        Available CRF Files
                                    </h3>
                                    <div
                                        style={{
                                            background:
                                                "rgba(255, 255, 255, 0.05)",
                                            border: "1px solid rgba(255, 255, 255, 0.1)",
                                            borderRadius: "8px",
                                            padding: "4px 12px",
                                            fontSize: "12px",
                                            color: "#a0a0a0",
                                            fontWeight: "500",
                                        }}
                                    >
                                        {availableFiles.length} files
                                    </div>
                                </div>

                                <div
                                    className="files-grid"
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill, minmax(300px, 1fr))",
                                        gap: "16px",
                                    }}
                                >
                                    {availableFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="file-item"
                                            onClick={() =>
                                                handleFilePreview(file)
                                            }
                                            style={{
                                                background:
                                                    "linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)",
                                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                                borderRadius: "16px",
                                                padding: "20px",
                                                transition:
                                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                                cursor: "pointer",
                                                position: "relative",
                                                backdropFilter: "blur(10px)",
                                                boxShadow:
                                                    "0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background =
                                                    "linear-gradient(145deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)";
                                                e.target.style.borderColor =
                                                    edcProvider.color + "40";
                                                e.target.style.transform =
                                                    "translateY(-2px)";
                                                e.target.style.boxShadow = `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px ${edcProvider.color}20, inset 0 1px 0 rgba(255, 255, 255, 0.1)`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background =
                                                    "linear-gradient(145deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)";
                                                e.target.style.borderColor =
                                                    "rgba(255, 255, 255, 0.08)";
                                                e.target.style.transform =
                                                    "translateY(0)";
                                                e.target.style.boxShadow =
                                                    "0 4px 20px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)";
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "16px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        background: `linear-gradient(135deg, ${edcProvider.color}25, ${edcProvider.color}10)`,
                                                        border: `1px solid ${edcProvider.color}30`,
                                                        color: edcProvider.color,
                                                        borderRadius: "12px",
                                                        padding: "12px",
                                                        fontSize: "20px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        minWidth: "48px",
                                                        height: "48px",
                                                        filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.1))",
                                                    }}
                                                >
                                                    📄
                                                </div>
                                                <div
                                                    style={{
                                                        flex: 1,
                                                        minWidth: 0,
                                                    }}
                                                >
                                                    <h4
                                                        style={{
                                                            color: "#ffffff",
                                                            margin: "0 0 6px 0",
                                                            fontSize: "15px",
                                                            fontWeight: "600",
                                                            letterSpacing:
                                                                "0.3px",
                                                            lineHeight: "1.3",
                                                        }}
                                                    >
                                                        {file.type}
                                                    </h4>
                                                    <p
                                                        style={{
                                                            color: "#a0a0a0",
                                                            margin: "0 0 6px 0",
                                                            fontSize: "12px",
                                                            fontFamily:
                                                                "monospace",
                                                            background:
                                                                "rgba(255, 255, 255, 0.03)",
                                                            padding: "4px 8px",
                                                            borderRadius: "6px",
                                                            border: "1px solid rgba(255, 255, 255, 0.05)",
                                                            wordBreak:
                                                                "break-all",
                                                        }}
                                                    >
                                                        {file.name}
                                                    </p>
                                                    <p
                                                        style={{
                                                            color: "#888",
                                                            margin: "0 0 12px 0",
                                                            fontSize: "12px",
                                                            fontStyle: "italic",
                                                            lineHeight: "1.4",
                                                        }}
                                                    >
                                                        {file.description}
                                                    </p>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            gap: "8px",
                                                            flexWrap: "wrap",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                background:
                                                                    "linear-gradient(135deg, #10B98120, #10B98110)",
                                                                border: "1px solid #10B98130",
                                                                color: "#10B981",
                                                                padding:
                                                                    "4px 10px",
                                                                borderRadius:
                                                                    "8px",
                                                                fontSize:
                                                                    "11px",
                                                                fontWeight:
                                                                    "600",
                                                                letterSpacing:
                                                                    "0.3px",
                                                            }}
                                                        >
                                                            {file.status}
                                                        </span>
                                                        <span
                                                            style={{
                                                                color: "#666",
                                                                fontSize:
                                                                    "11px",
                                                                background:
                                                                    "rgba(255, 255, 255, 0.03)",
                                                                padding:
                                                                    "4px 8px",
                                                                borderRadius:
                                                                    "6px",
                                                                border: "1px solid rgba(255, 255, 255, 0.05)",
                                                            }}
                                                        >
                                                            {file.uploadedAt}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div
                            className="modal-actions"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)",
                                borderTop:
                                    "1px solid rgba(255, 255, 255, 0.08)",
                                padding: "20px 32px",
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "12px",
                            }}
                        >
                            <button
                                className="cancel-btn"
                                onClick={() => setShowFileViewerModal(false)}
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
                                    border: "1px solid rgba(255, 255, 255, 0.15)",
                                    borderRadius: "12px",
                                    color: "#ffffff",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    padding: "12px 24px",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    backdropFilter: "blur(10px)",
                                    letterSpacing: "0.3px",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background =
                                        "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%)";
                                    e.target.style.borderColor =
                                        "rgba(255, 255, 255, 0.25)";
                                    e.target.style.transform =
                                        "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background =
                                        "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)";
                                    e.target.style.borderColor =
                                        "rgba(255, 255, 255, 0.15)";
                                    e.target.style.transform = "translateY(0)";
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* File Preview Modal */}
            {showFilePreviewModal && selectedFileForPreview && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowFilePreviewModal(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.9)",
                        backdropFilter: "blur(20px) saturate(1.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1001,
                        padding: "20px",
                    }}
                >
                    <div
                        className="modal-content file-preview-modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background:
                                "linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            borderRadius: "24px",
                            boxShadow:
                                "0 25px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                            maxWidth: "95vw",
                            maxHeight: "95vh",
                            width: "100%",
                            height: "100%",
                            overflow: "hidden",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: "24px 32px",
                                borderBottom:
                                    "1px solid rgba(255, 255, 255, 0.08)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background:
                                    "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)",
                                backdropFilter: "blur(10px)",
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        color: "#ffffff",
                                        fontSize: "24px",
                                        fontWeight: "600",
                                        margin: "0 0 8px 0",
                                        letterSpacing: "-0.5px",
                                    }}
                                >
                                    {selectedFileForPreview.name}
                                </h2>
                                <p
                                    style={{
                                        color: "#a0a0a0",
                                        fontSize: "14px",
                                        margin: "0",
                                        fontWeight: "500",
                                    }}
                                >
                                    {selectedFileForPreview.type} •{" "}
                                    {selectedFileForPreview.description}
                                </p>
                            </div>
                            <button
                                className="close-btn"
                                onClick={() => setShowFilePreviewModal(false)}
                                style={{
                                    background: "rgba(255, 255, 255, 0.05)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                    borderRadius: "12px",
                                    color: "#ffffff",
                                    fontSize: "20px",
                                    fontWeight: "300",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    backdropFilter: "blur(10px)",
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background =
                                        "rgba(255, 255, 255, 0.1)";
                                    e.target.style.borderColor =
                                        "rgba(255, 255, 255, 0.2)";
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background =
                                        "rgba(255, 255, 255, 0.05)";
                                    e.target.style.borderColor =
                                        "rgba(255, 255, 255, 0.1)";
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* PDF Preview */}
                        <div
                            style={{
                                flex: 1,
                                padding: "0",
                                overflow: "hidden",
                                background: "#1a1a1a",
                            }}
                        >
                            <iframe
                                src={apiService.getCRFFileUrl(
                                    selectedFileForPreview.name
                                )}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                    background: "#ffffff",
                                }}
                                title={`Preview of ${selectedFileForPreview.name}`}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudiesDashboard;
