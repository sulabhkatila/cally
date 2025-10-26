import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackendTest from "../components/BackendTest.js";
import Navbar from "../components/Navbar.js";
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
    const handleViewData = (study) => {
        setSelectedStudyForFiles(study);
        setShowFileViewerModal(true);
    };

    // CRF files data from mocks/crf directory
    const getCRFFiles = () => {
        return [
            {
                id: "CRF-001",
                name: "crf_sub_1_adverseeffect.docx",
                type: "Adverse Effect",
                status: "completed",
                uploadedBy: "Dr. Sarah Johnson",
                uploadedAt: "2024-01-15",
                description: "Adverse event reporting form",
            },
            {
                id: "CRF-002",
                name: "crf_sub_1_Demographics.docx",
                type: "Demographics",
                status: "completed",
                uploadedBy: "Dr. Sarah Johnson",
                uploadedAt: "2024-01-16",
                description: "Patient demographic information",
            },
            {
                id: "CRF-003",
                name: "crf_sub_1_diseaseActivityAssessment.docx",
                type: "Disease Activity",
                status: "completed",
                uploadedBy: "Dr. Sarah Johnson",
                uploadedAt: "2024-01-17",
                description: "Disease activity assessment scores",
            },
            {
                id: "CRF-004",
                name: "crf_sub_1_medicalhistory.docx",
                type: "Medical History",
                status: "completed",
                uploadedBy: "Dr. Sarah Johnson",
                uploadedAt: "2024-01-18",
                description: "Patient medical history and comorbidities",
            },
            {
                id: "CRF-005",
                name: "crf_sub_1_medications.docx",
                type: "Medications",
                status: "completed",
                uploadedBy: "Dr. Sarah Johnson",
                uploadedAt: "2024-01-19",
                description: "Current and prior medications",
            },
            {
                id: "CRF-006",
                name: "CRF_sub_1_week0-10.docx",
                type: "Visit Data (Week 0-10)",
                status: "completed",
                uploadedBy: "Dr. Sarah Johnson",
                uploadedAt: "2024-01-20",
                description: "Longitudinal visit data across weeks 0-10",
            },
            {
                id: "CRF-007",
                name: "crf_sub_1_week0.docx",
                type: "Baseline Visit",
                status: "completed",
                uploadedBy: "Dr. Sarah Johnson",
                uploadedAt: "2024-01-21",
                description: "Baseline visit assessments and measurements",
            },
        ];
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
                                                        background: `linear-gradient(135deg, ${edcProvider.color}20, ${edcProvider.color}10)`,
                                                        border: `1px solid ${edcProvider.color}40`,
                                                        color: edcProvider.color,
                                                        padding: "6px 12px",
                                                        borderRadius: "6px",
                                                        fontSize: "11px",
                                                        fontWeight: "600",
                                                        cursor: "pointer",
                                                        transition:
                                                            "all 0.2s ease",
                                                        marginTop: "8px",
                                                        width: "100%",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background = `linear-gradient(135deg, ${edcProvider.color}30, ${edcProvider.color}20)`;
                                                        e.target.style.transform =
                                                            "translateY(-1px)";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background = `linear-gradient(135deg, ${edcProvider.color}20, ${edcProvider.color}10)`;
                                                        e.target.style.transform =
                                                            "translateY(0)";
                                                    }}
                                                >
                                                    📊 View Data
                                                </button>
                                            </div>
                                        </div>

                                        {/* Connect to Investigator Button or Query AI Agent Button */}
                                        {study.hasPrincipalInvestigator() && (
                                            <div className="study-actions">
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
                                            </div>
                                        )}
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
                >
                    <div
                        className="modal-content file-viewer-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>
                                <span
                                    style={{
                                        color: edcProvider.color,
                                        marginRight: "8px",
                                    }}
                                >
                                    {edcProvider.icon}
                                </span>
                                EDC Data - {selectedStudyForFiles.title}
                            </h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowFileViewerModal(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div
                                className="edc-connection-info"
                                style={{
                                    background: `linear-gradient(135deg, ${edcProvider.color}15, ${edcProvider.color}05)`,
                                    border: `1px solid ${edcProvider.color}30`,
                                    borderRadius: "12px",
                                    padding: "16px",
                                    marginBottom: "20px",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: edcProvider.color,
                                            fontSize: "16px",
                                        }}
                                    >
                                        {edcProvider.icon}
                                    </span>
                                    <span
                                        style={{
                                            fontWeight: "600",
                                            color: "#ffffff",
                                        }}
                                    >
                                        Connected via {edcProvider.name}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        color: "#a0a0a0",
                                        fontSize: "14px",
                                        margin: 0,
                                    }}
                                >
                                    Viewing CRF data from your EDC connection
                                </p>
                            </div>

                            <div className="files-list">
                                <h3
                                    style={{
                                        color: "#ffffff",
                                        marginBottom: "16px",
                                        fontSize: "16px",
                                    }}
                                >
                                    Available CRF Files ({getCRFFiles().length})
                                </h3>

                                <div className="files-grid">
                                    {getCRFFiles().map((file) => (
                                        <div
                                            key={file.id}
                                            className="file-item"
                                            style={{
                                                background:
                                                    "rgba(255, 255, 255, 0.05)",
                                                border: "1px solid rgba(255, 255, 255, 0.1)",
                                                borderRadius: "12px",
                                                padding: "16px",
                                                transition: "all 0.2s ease",
                                                cursor: "pointer",
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background =
                                                    "rgba(255, 255, 255, 0.08)";
                                                e.target.style.borderColor =
                                                    edcProvider.color + "40";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background =
                                                    "rgba(255, 255, 255, 0.05)";
                                                e.target.style.borderColor =
                                                    "rgba(255, 255, 255, 0.1)";
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
                                                        background:
                                                            edcProvider.color +
                                                            "20",
                                                        color: edcProvider.color,
                                                        borderRadius: "8px",
                                                        padding: "8px",
                                                        fontSize: "18px",
                                                    }}
                                                >
                                                    📄
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <h4
                                                        style={{
                                                            color: "#ffffff",
                                                            margin: "0 0 4px 0",
                                                            fontSize: "14px",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        {file.type}
                                                    </h4>
                                                    <p
                                                        style={{
                                                            color: "#a0a0a0",
                                                            margin: "0 0 4px 0",
                                                            fontSize: "12px",
                                                            fontFamily:
                                                                "monospace",
                                                        }}
                                                    >
                                                        {file.name}
                                                    </p>
                                                    <p
                                                        style={{
                                                            color: "#888",
                                                            margin: "0 0 8px 0",
                                                            fontSize: "11px",
                                                            fontStyle: "italic",
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
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                background:
                                                                    "#10B98120",
                                                                color: "#10B981",
                                                                padding:
                                                                    "2px 8px",
                                                                borderRadius:
                                                                    "4px",
                                                                fontSize:
                                                                    "11px",
                                                                fontWeight:
                                                                    "600",
                                                            }}
                                                        >
                                                            {file.status}
                                                        </span>
                                                        <span
                                                            style={{
                                                                color: "#666",
                                                                fontSize:
                                                                    "11px",
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

                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => setShowFileViewerModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudiesDashboard;
