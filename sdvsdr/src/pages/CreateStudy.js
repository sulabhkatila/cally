import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import { getUser } from "../utils/userStorage.js";
import "./CreateStudy.css";

const CreateStudy = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [protocolFile, setProtocolFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMonitoringPlan, setShowMonitoringPlan] = useState(false);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [planGenerated, setPlanGenerated] = useState(false);
    const [editableData, setEditableData] = useState({
        title: "",
        sponsor: "",
        phase: "",
        investigationalProduct: "",
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProtocolFile(file);
        setError(null);
        setAnalysisResult(null);
    };

    const analyzeProtocol = async (file) => {
        // Do nothing
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Show loading for 5 seconds, then show edit modal
        setTimeout(() => {
            setIsSubmitting(false);
            setEditableData({
                title: "A Phase II, Randomized, Double-Blind, Placebo-Controlled, Parallel-Group Study to Evaluate the Efficacy, Safety, and Pharmacokinetics of ARX-945, an Oral Selective JAK3 Inhibitor, in Adults with Moderate-to-Severe Rheumatoid Arthritis",
                sponsor: "Regeneron Pharmaceutics",
                phase: "II",
                investigationalProduct:
                    "ARX-945 (N-methyl-pyrrolidine carboxamide) • 10 mg and 30 mg oral tablets • Mechanism of action: selective inhibition of Janus Kinase 3 (JAK3) • Intended Indication: Rheumatoid Arthritis Comparator: Placebo tablets matching appearance. Background therapy permitted: Methotrexate ≤ 25 mg weekly.",
            });
            setShowEditModal(true);
        }, 5000);
    };

    const handleCancel = () => {
        navigate("/studies");
    };

    const handleEditChange = (field, value) => {
        setEditableData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveStudy = () => {
        // Close edit modal and show monitoring plan option
        setShowEditModal(false);
        setShowMonitoringPlan(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
    };

    const handleGenerateMonitoringPlan = () => {
        setIsLoadingPlan(true);

        // Show loading for 5 seconds, then show monitoring plan
        setTimeout(() => {
            setIsLoadingPlan(false);
            setPlanGenerated(true);
        }, 5000);
    };

    const handleCloseMonitoringPlan = () => {
        setShowMonitoringPlan(false);
        navigate("/studies");
    };

    const handleSkipMonitoringPlan = () => {
        setShowMonitoringPlan(false);
        setPlanGenerated(false);
        navigate("/studies");
    };

    if (user?.role !== "Sponsor") {
        return (
            <div className="create-study-page">
                <div className="no-access">
                    <h2>Access Denied</h2>
                    <p>Only sponsors can create studies.</p>
                    <button
                        onClick={() => navigate("/studies")}
                        className="back-btn"
                    >
                        Back to Studies
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="create-study-page">
            <Navbar />
            <div className="page-header">
                <div className="header-content">
                    <div className="header-left">
                        <button onClick={handleCancel} className="back-button">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path
                                    fill="currentColor"
                                    d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                                />
                            </svg>
                            Back
                        </button>
                        <h1>Create New Study</h1>
                        <p>
                            Upload your clinical trial protocol and we'll
                            automatically extract all the necessary information
                        </p>
                    </div>
                </div>
            </div>

            <div className="page-content">
                <form onSubmit={handleSubmit} className="study-form">
                    <div className="form-section">
                        <h2>Upload Protocol Document</h2>
                        <p className="section-description">
                            Upload your clinical trial protocol document and
                            we'll automatically extract all the necessary
                            information to create your study.
                        </p>

                        <div className="form-group">
                            <label htmlFor="protocolFile">
                                Protocol File *
                            </label>
                            <input
                                type="file"
                                id="protocolFile"
                                name="protocolFile"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt"
                                required
                            />
                            <p className="file-help-text">
                                Upload your study protocol document (PDF, DOC,
                                DOCX, or TXT)
                            </p>
                        </div>

                        {protocolFile && !analysisResult && (
                            <div className="analyze-section">
                                <button
                                    type="button"
                                    onClick={() =>
                                        analyzeProtocol(protocolFile)
                                    }
                                    className="analyze-btn"
                                    disabled={isAnalyzing}
                                >
                                    {isAnalyzing ? (
                                        <>
                                            <svg
                                                className="spinner"
                                                viewBox="0 0 24 24"
                                                width="16"
                                                height="16"
                                            >
                                                <circle
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeDasharray="31.416"
                                                    strokeDashoffset="31.416"
                                                >
                                                    <animate
                                                        attributeName="stroke-dasharray"
                                                        dur="2s"
                                                        values="0 31.416;15.708 15.708;0 31.416"
                                                        repeatCount="indefinite"
                                                    />
                                                    <animate
                                                        attributeName="stroke-dashoffset"
                                                        dur="2s"
                                                        values="0;-15.708;-31.416"
                                                        repeatCount="indefinite"
                                                    />
                                                </circle>
                                            </svg>
                                            Analyzing Protocol...
                                        </>
                                    ) : (
                                        "Analyze Protocol"
                                    )}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="error-message">
                                <p>Error: {error}</p>
                            </div>
                        )}

                        {analysisResult && (
                            <div className="analysis-result">
                                <h3>Protocol Analysis Results</h3>
                                <div className="analysis-summary">
                                    <div className="analysis-item">
                                        <strong>Study Title:</strong>{" "}
                                        {analysisResult.trial_overview
                                            ?.protocol_title || "Not found"}
                                    </div>
                                    <div className="analysis-item">
                                        <strong>Phase:</strong>{" "}
                                        {analysisResult.trial_overview
                                            ?.study_phase || "Not found"}
                                    </div>
                                    <div className="analysis-item">
                                        <strong>Indication:</strong>{" "}
                                        {analysisResult.trial_overview
                                            ?.indication || "Not found"}
                                    </div>
                                    <div className="analysis-item">
                                        <strong>Sample Size:</strong>{" "}
                                        {analysisResult.trial_design
                                            ?.sample_size || "Not found"}
                                    </div>
                                    <div className="analysis-item">
                                        <strong>Duration:</strong>{" "}
                                        {analysisResult.trial_design
                                            ?.duration || "Not found"}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Screen Loading Overlay */}
                        {isSubmitting && (
                            <div className="loading-overlay">
                                <div className="loading-content">
                                    <div className="large-spinner">
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="80"
                                            height="80"
                                        >
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeDasharray="62.832"
                                                strokeDashoffset="62.832"
                                            >
                                                <animate
                                                    attributeName="stroke-dasharray"
                                                    dur="2s"
                                                    values="0 62.832;31.416 31.416;0 62.832"
                                                    repeatCount="indefinite"
                                                />
                                                <animate
                                                    attributeName="stroke-dashoffset"
                                                    dur="2s"
                                                    values="0;-31.416;-62.832"
                                                    repeatCount="indefinite"
                                                />
                                            </circle>
                                        </svg>
                                    </div>
                                    <h2>Creating Study...</h2>
                                    <p>
                                        Please wait while we process your
                                        request
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg
                                        className="spinner"
                                        viewBox="0 0 24 24"
                                        width="16"
                                        height="16"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeDasharray="31.416"
                                            strokeDashoffset="31.416"
                                        >
                                            <animate
                                                attributeName="stroke-dasharray"
                                                dur="2s"
                                                values="0 31.416;15.708 15.708;0 31.416"
                                                repeatCount="indefinite"
                                            />
                                            <animate
                                                attributeName="stroke-dashoffset"
                                                dur="2s"
                                                values="0;-15.708;-31.416"
                                                repeatCount="indefinite"
                                            />
                                        </circle>
                                    </svg>
                                    Creating Study...
                                </>
                            ) : (
                                "Create Study"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Edit Study Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-content edit-modal">
                        <div className="modal-header">
                            <h2>
                                Following details were derived. Edit if
                                necessary.
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="close-btn"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="edit-form">
                                <div className="form-group">
                                    <label htmlFor="editTitle">Title:</label>
                                    <textarea
                                        id="editTitle"
                                        value={editableData.title}
                                        onChange={(e) =>
                                            handleEditChange(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        rows="3"
                                        className="edit-textarea"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="editSponsor">
                                        Sponsor:
                                    </label>
                                    <input
                                        type="text"
                                        id="editSponsor"
                                        value={editableData.sponsor}
                                        onChange={(e) =>
                                            handleEditChange(
                                                "sponsor",
                                                e.target.value
                                            )
                                        }
                                        className="edit-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="editPhase">Phase:</label>
                                    <input
                                        type="text"
                                        id="editPhase"
                                        value={editableData.phase}
                                        onChange={(e) =>
                                            handleEditChange(
                                                "phase",
                                                e.target.value
                                            )
                                        }
                                        className="edit-input"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="editProduct">
                                        Investigational Product:
                                    </label>
                                    <textarea
                                        id="editProduct"
                                        value={
                                            editableData.investigationalProduct
                                        }
                                        onChange={(e) =>
                                            handleEditChange(
                                                "investigationalProduct",
                                                e.target.value
                                            )
                                        }
                                        rows="4"
                                        className="edit-textarea"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={handleCloseModal}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveStudy}
                                className="submit-btn"
                            >
                                Save Study
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Monitoring Plan Modal */}
            {showMonitoringPlan && (
                <div className="modal-overlay">
                    <div className="modal-content monitoring-modal">
                        <div className="modal-header">
                            <h2>Generate Monitoring Plan</h2>
                            <button
                                onClick={handleCloseMonitoringPlan}
                                className="close-btn"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Show intro and buttons only when plan hasn't been generated */}
                            {!planGenerated && (
                                <>
                                    <div className="monitoring-intro">
                                        <p>
                                            Based on your protocol analysis, we
                                            can generate a comprehensive
                                            monitoring plan tailored to your
                                            study requirements. This will
                                            include:
                                        </p>
                                        <ul>
                                            <li>
                                                Remote Source Data Verification
                                                (SDV) strategy
                                            </li>
                                            <li>
                                                Risk-based monitoring approach
                                            </li>
                                            <li>Site monitoring schedule</li>
                                            <li>
                                                Data quality assurance protocols
                                            </li>
                                            <li>
                                                Regulatory compliance framework
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="monitoring-actions">
                                        <button
                                            onClick={
                                                handleGenerateMonitoringPlan
                                            }
                                            className="generate-btn"
                                            disabled={isLoadingPlan}
                                        >
                                            {isLoadingPlan ? (
                                                <>
                                                    <svg
                                                        className="spinner"
                                                        viewBox="0 0 24 24"
                                                        width="16"
                                                        height="16"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeDasharray="31.416"
                                                            strokeDashoffset="31.416"
                                                        >
                                                            <animate
                                                                attributeName="stroke-dasharray"
                                                                dur="2s"
                                                                values="0 31.416;15.708 15.708;0 31.416"
                                                                repeatCount="indefinite"
                                                            />
                                                            <animate
                                                                attributeName="stroke-dashoffset"
                                                                dur="2s"
                                                                values="0;-15.708;-31.416"
                                                                repeatCount="indefinite"
                                                            />
                                                        </circle>
                                                    </svg>
                                                    Generating Plan...
                                                </>
                                            ) : (
                                                "Generate Monitoring Plan"
                                            )}
                                        </button>
                                        <button
                                            onClick={handleSkipMonitoringPlan}
                                            className="skip-btn"
                                        >
                                            Skip for Now
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Monitoring Plan Content - Show when plan is generated */}
                            {planGenerated && (
                                <div className="monitoring-plan-content">
                                    <h3>Clinical Trial Monitoring Plan</h3>
                                    <p className="plan-subtitle">
                                        Generated based on protocol:{" "}
                                        <strong>{editableData.title}</strong>
                                    </p>

                                    <div className="plan-section">
                                        <h4>1. Executive Summary</h4>
                                        <p>
                                            This monitoring plan is designed for
                                            a Phase II randomized, double-blind,
                                            placebo-controlled study evaluating
                                            ARX-945 in adults with
                                            moderate-to-severe rheumatoid
                                            arthritis. The plan incorporates
                                            risk-based monitoring principles and
                                            remote source data verification to
                                            ensure data quality and patient
                                            safety.
                                        </p>
                                    </div>

                                    <div className="plan-section">
                                        <h4>2. Monitoring Strategy</h4>

                                        <h5>
                                            2.1 Risk-Based Monitoring Framework
                                        </h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Risk Assessment Frequency:
                                                </strong>{" "}
                                                Monthly risk assessment updates
                                                using centralized data analytics
                                            </li>
                                            <li>
                                                <strong>
                                                    High-Risk Data Points:
                                                </strong>{" "}
                                                Primary efficacy endpoints,
                                                serious adverse events, protocol
                                                deviations, informed consent
                                                compliance
                                            </li>
                                            <li>
                                                <strong>
                                                    Risk Scoring Method:
                                                </strong>{" "}
                                                0-10 scale based on data
                                                quality, site performance, and
                                                protocol compliance history
                                            </li>
                                            <li>
                                                <strong>
                                                    Risk Thresholds:
                                                </strong>{" "}
                                                Sites scoring 7+ require
                                                immediate intervention, 5-6
                                                require enhanced monitoring
                                            </li>
                                        </ul>

                                        <h5>
                                            2.2 Remote Source Data Verification
                                            (SDV)
                                        </h5>
                                        <ul>
                                            <li>
                                                <strong>SDV Frequency:</strong>{" "}
                                                100% for critical data points
                                                within 48 hours of data entry
                                            </li>
                                            <li>
                                                <strong>SDV Process:</strong>
                                                <ol>
                                                    <li>
                                                        Automated data
                                                        validation rules trigger
                                                        queries
                                                    </li>
                                                    <li>
                                                        Remote monitors review
                                                        source documents via
                                                        secure portal
                                                    </li>
                                                    <li>
                                                        Discrepancies logged in
                                                        eTMF within 24 hours
                                                    </li>
                                                    <li>
                                                        Site receives query
                                                        notification within 48
                                                        hours
                                                    </li>
                                                </ol>
                                            </li>
                                            <li>
                                                <strong>
                                                    Critical Data Points:
                                                </strong>{" "}
                                                Primary/secondary endpoints,
                                                SAEs, protocol deviations,
                                                informed consent dates
                                            </li>
                                            <li>
                                                <strong>Tools:</strong> Medidata
                                                Rave EDC, Veeva Vault eTMF,
                                                custom analytics dashboard
                                            </li>
                                        </ul>

                                        <h5>2.3 On-Site Monitoring Visits</h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    High-Risk Sites (Risk Score
                                                    7+):
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Frequency: Monthly
                                                        visits (4-week
                                                        intervals)
                                                    </li>
                                                    <li>
                                                        Duration: 2-3 days per
                                                        visit
                                                    </li>
                                                    <li>
                                                        Focus: 100% SDV of
                                                        critical data, site
                                                        training, protocol
                                                        compliance review
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Standard Sites (Risk Score
                                                    3-6):
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Frequency: Quarterly
                                                        visits (12-week
                                                        intervals)
                                                    </li>
                                                    <li>
                                                        Duration: 1-2 days per
                                                        visit
                                                    </li>
                                                    <li>
                                                        Focus: 20% random SDV,
                                                        site performance review,
                                                        training updates
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Low-Risk Sites (Risk Score
                                                    0-2):
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Frequency: Semi-annual
                                                        visits (24-week
                                                        intervals)
                                                    </li>
                                                    <li>
                                                        Duration: 1 day per
                                                        visit
                                                    </li>
                                                    <li>
                                                        Focus: Key metrics
                                                        review, minimal SDV (5%
                                                        sample)
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>

                                        <h5>2.4 Central Monitoring</h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Real-Time Surveillance:
                                                </strong>{" "}
                                                24/7 automated data monitoring
                                                with alerts
                                            </li>
                                            <li>
                                                <strong>Daily Reviews:</strong>{" "}
                                                Data quality metrics, query
                                                resolution rates, enrollment
                                                progress
                                            </li>
                                            <li>
                                                <strong>Weekly Reports:</strong>{" "}
                                                Site performance dashboards,
                                                protocol compliance trends
                                            </li>
                                            <li>
                                                <strong>
                                                    Monthly Analysis:
                                                </strong>{" "}
                                                Risk score updates, monitoring
                                                plan adjustments
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="plan-section">
                                        <h4>3. Data Quality Assurance</h4>

                                        <h5>3.1 Automated Data Validation</h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Validation Rules Frequency:
                                                </strong>{" "}
                                                Real-time validation on data
                                                entry, batch validation daily at
                                                6 PM EST
                                            </li>
                                            <li>
                                                <strong>
                                                    Critical Variable Rules:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Primary Endpoint
                                                        (ACR50): Range 0-100,
                                                        mandatory field, logical
                                                        consistency checks
                                                    </li>
                                                    <li>
                                                        Adverse Events: Severity
                                                        grading (1-5), causality
                                                        assessment, expectedness
                                                        classification
                                                    </li>
                                                    <li>
                                                        Concomitant Medications:
                                                        Start/stop date
                                                        validation, drug name
                                                        standardization
                                                    </li>
                                                    <li>
                                                        Vital Signs:
                                                        Physiological range
                                                        checks (BP: 60-250 mmHg,
                                                        HR: 40-200 bpm)
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Validation Process:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Data entry triggers
                                                        immediate validation
                                                    </li>
                                                    <li>
                                                        Failed validations
                                                        create automatic queries
                                                    </li>
                                                    <li>
                                                        Site receives
                                                        notification within 2
                                                        hours
                                                    </li>
                                                    <li>
                                                        Resolution tracked with
                                                        SLA: 48 hours for
                                                        critical, 72 hours for
                                                        routine
                                                    </li>
                                                </ol>
                                            </li>
                                        </ul>

                                        <h5>3.2 Query Management System</h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Query Types & SLAs:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Critical Queries:
                                                        24-hour resolution,
                                                        auto-escalation to PI
                                                    </li>
                                                    <li>
                                                        Major Queries: 48-hour
                                                        resolution, site
                                                        coordinator notification
                                                    </li>
                                                    <li>
                                                        Minor Queries: 72-hour
                                                        resolution, standard
                                                        workflow
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Query Escalation Process:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Day 1: Initial query
                                                        sent to site coordinator
                                                    </li>
                                                    <li>
                                                        Day 2: Reminder
                                                        notification if
                                                        unresolved
                                                    </li>
                                                    <li>
                                                        Day 3: Escalation to
                                                        Principal Investigator
                                                    </li>
                                                    <li>
                                                        Day 5: Sponsor
                                                        notification and
                                                        potential site visit
                                                    </li>
                                                </ol>
                                            </li>
                                            <li>
                                                <strong>
                                                    Query Resolution Tracking:
                                                </strong>{" "}
                                                Real-time dashboard with
                                                color-coded status (Green:
                                                Resolved, Yellow: Pending, Red:
                                                Overdue)
                                            </li>
                                        </ul>

                                        <h5>
                                            3.3 Source Document Verification
                                        </h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    SDV Frequency by Data Type:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Primary Endpoints: 100%
                                                        verification within 48
                                                        hours
                                                    </li>
                                                    <li>
                                                        SAEs: 100% verification
                                                        within 24 hours
                                                    </li>
                                                    <li>
                                                        Secondary Endpoints: 20%
                                                        random sample, monthly
                                                    </li>
                                                    <li>
                                                        Demographics: 10% random
                                                        sample, quarterly
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>SDV Process:</strong>
                                                <ol>
                                                    <li>
                                                        Automated selection of
                                                        source documents for
                                                        review
                                                    </li>
                                                    <li>
                                                        Remote monitor accesses
                                                        secure document portal
                                                    </li>
                                                    <li>
                                                        Side-by-side comparison
                                                        of EDC data vs source
                                                    </li>
                                                    <li>
                                                        Discrepancy logging with
                                                        severity classification
                                                    </li>
                                                    <li>
                                                        Site notification and
                                                        resolution tracking
                                                    </li>
                                                </ol>
                                            </li>
                                        </ul>

                                        <h5>3.4 Adverse Event Monitoring</h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    AE Reporting Timeline:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Serious AEs: 24-hour
                                                        notification to sponsor,
                                                        7-day written report
                                                    </li>
                                                    <li>
                                                        Non-serious AEs: 48-hour
                                                        EDC entry, monthly
                                                        summary reports
                                                    </li>
                                                    <li>
                                                        Expected AEs: Weekly
                                                        batch processing
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    AE Review Process:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Automated severity and
                                                        causality assessment
                                                    </li>
                                                    <li>
                                                        Medical monitor review
                                                        within 4 hours for SAEs
                                                    </li>
                                                    <li>
                                                        Regulatory reporting
                                                        within 15 days (FDA) or
                                                        7 days (EMA)
                                                    </li>
                                                    <li>
                                                        Follow-up tracking until
                                                        resolution or study
                                                        completion
                                                    </li>
                                                </ol>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="plan-section">
                                        <h4>4. Regulatory Compliance</h4>

                                        <h5>
                                            4.1 ICH-GCP Compliance Monitoring
                                        </h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Compliance Review Frequency:
                                                </strong>{" "}
                                                Monthly comprehensive review,
                                                quarterly deep-dive audits
                                            </li>
                                            <li>
                                                <strong>
                                                    Key GCP Areas Monitored:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Informed Consent: 100%
                                                        verification of consent
                                                        timing, completeness,
                                                        and comprehension
                                                    </li>
                                                    <li>
                                                        Protocol Adherence:
                                                        Real-time monitoring of
                                                        protocol deviations and
                                                        violations
                                                    </li>
                                                    <li>
                                                        Investigator
                                                        Qualifications: Annual
                                                        verification of CV,
                                                        medical license, GCP
                                                        training
                                                    </li>
                                                    <li>
                                                        Site Infrastructure:
                                                        Quarterly assessment of
                                                        facilities, equipment,
                                                        and personnel
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    GCP Audit Process:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Pre-audit notification:
                                                        2 weeks advance notice
                                                    </li>
                                                    <li>
                                                        Document review: 3-day
                                                        on-site document
                                                        examination
                                                    </li>
                                                    <li>
                                                        Interview process: PI,
                                                        coordinators, and key
                                                        personnel
                                                    </li>
                                                    <li>
                                                        Findings report: 10-day
                                                        delivery with corrective
                                                        action plan
                                                    </li>
                                                    <li>
                                                        Follow-up: 30-day
                                                        implementation
                                                        verification
                                                    </li>
                                                </ol>
                                            </li>
                                        </ul>

                                        <h5>
                                            4.2 FDA 21 CFR Part 11 Compliance
                                        </h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Electronic Records
                                                    Validation:
                                                </strong>{" "}
                                                Annual validation of all
                                                electronic systems used in data
                                                collection
                                            </li>
                                            <li>
                                                <strong>
                                                    Digital Signature
                                                    Requirements:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Unique user
                                                        identification for all
                                                        system access
                                                    </li>
                                                    <li>
                                                        Password complexity: 12+
                                                        characters, special
                                                        characters, 90-day
                                                        rotation
                                                    </li>
                                                    <li>
                                                        Digital certificates for
                                                        critical data approvals
                                                    </li>
                                                    <li>
                                                        Audit trail for all data
                                                        modifications with
                                                        timestamp and user ID
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    System Security Measures:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Multi-factor
                                                        authentication for all
                                                        user accounts
                                                    </li>
                                                    <li>
                                                        Role-based access
                                                        controls with least
                                                        privilege principle
                                                    </li>
                                                    <li>
                                                        Encrypted data
                                                        transmission (TLS 1.3)
                                                        and storage (AES-256)
                                                    </li>
                                                    <li>
                                                        Regular penetration
                                                        testing and
                                                        vulnerability
                                                        assessments
                                                    </li>
                                                </ol>
                                            </li>
                                        </ul>

                                        <h5>
                                            4.3 EMA GCP Guidelines
                                            Implementation
                                        </h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    EMA-Specific Requirements:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Clinical Trial
                                                        Information System
                                                        (CTIS) registration
                                                        within 6 months
                                                    </li>
                                                    <li>
                                                        EU Clinical Trials
                                                        Database updates within
                                                        7 days of changes
                                                    </li>
                                                    <li>
                                                        Pharmacovigilance
                                                        reporting via
                                                        EudraVigilance system
                                                    </li>
                                                    <li>
                                                        Data Protection
                                                        Regulation (GDPR)
                                                        compliance for EU
                                                        subjects
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    EMA Reporting Timeline:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Initial application: 60
                                                        days for regulatory
                                                        review
                                                    </li>
                                                    <li>
                                                        Substantial amendments:
                                                        35 days notification
                                                        period
                                                    </li>
                                                    <li>
                                                        Safety reporting: 7 days
                                                        for SUSARs, 15 days for
                                                        annual reports
                                                    </li>
                                                    <li>
                                                        End of trial
                                                        notification: 90 days
                                                        after last subject visit
                                                    </li>
                                                </ol>
                                            </li>
                                        </ul>

                                        <h5>4.4 Audit Trail Maintenance</h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Audit Trail Requirements:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        All data changes logged
                                                        with user ID, timestamp,
                                                        reason for change
                                                    </li>
                                                    <li>
                                                        Original data preserved
                                                        and accessible for 15
                                                        years post-study
                                                    </li>
                                                    <li>
                                                        System access logs
                                                        maintained with IP
                                                        addresses and session
                                                        duration
                                                    </li>
                                                    <li>
                                                        Document version control
                                                        with complete revision
                                                        history
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Documentation Standards:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Standard Operating
                                                        Procedures (SOPs) for
                                                        all monitoring
                                                        activities
                                                    </li>
                                                    <li>
                                                        Training records for all
                                                        personnel with annual
                                                        recertification
                                                    </li>
                                                    <li>
                                                        Equipment calibration
                                                        logs with traceable
                                                        standards
                                                    </li>
                                                    <li>
                                                        Temperature and
                                                        environmental monitoring
                                                        for storage facilities
                                                    </li>
                                                </ol>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="plan-section">
                                        <h4>5. Site Management</h4>

                                        <h5>5.1 Site Qualification Process</h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Pre-Qualification
                                                    Assessment:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Site feasibility
                                                        questionnaire completion
                                                        within 5 business days
                                                    </li>
                                                    <li>
                                                        PI CV and medical
                                                        license verification
                                                        within 48 hours
                                                    </li>
                                                    <li>
                                                        Facility inspection and
                                                        equipment validation
                                                        within 2 weeks
                                                    </li>
                                                    <li>
                                                        Regulatory approval
                                                        status verification
                                                        (IRB/IEC, FDA Form 1572)
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Site Initiation Timeline:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Week 1: Site selection
                                                        and contract execution
                                                    </li>
                                                    <li>
                                                        Week 2-3: Regulatory
                                                        submissions and
                                                        approvals
                                                    </li>
                                                    <li>
                                                        Week 4: Site initiation
                                                        visit and training
                                                    </li>
                                                    <li>
                                                        Week 5: First subject
                                                        enrollment authorization
                                                    </li>
                                                </ol>
                                            </li>
                                            <li>
                                                <strong>
                                                    Initiation Visit Checklist:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Protocol training for
                                                        all site personnel
                                                        (2-hour session)
                                                    </li>
                                                    <li>
                                                        EDC system training and
                                                        user account setup
                                                    </li>
                                                    <li>
                                                        Source document
                                                        templates and CRF
                                                        completion guidelines
                                                    </li>
                                                    <li>
                                                        Emergency contact
                                                        procedures and
                                                        escalation matrix
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>

                                        <h5>
                                            5.2 Investigator Training and
                                            Certification
                                        </h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Training Requirements:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        GCP certification: Valid
                                                        for 2 years, renewal
                                                        required
                                                    </li>
                                                    <li>
                                                        Protocol-specific
                                                        training: 4-hour
                                                        comprehensive session
                                                    </li>
                                                    <li>
                                                        EDC system training:
                                                        2-hour hands-on workshop
                                                    </li>
                                                    <li>
                                                        Safety reporting
                                                        training: 1-hour focused
                                                        session
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Certification Process:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Initial training
                                                        completion with 80%
                                                        passing score
                                                    </li>
                                                    <li>
                                                        Competency assessment
                                                        through case study
                                                        scenarios
                                                    </li>
                                                    <li>
                                                        Annual refresher
                                                        training with updated
                                                        protocols
                                                    </li>
                                                    <li>
                                                        Performance evaluation
                                                        and feedback sessions
                                                    </li>
                                                </ol>
                                            </li>
                                            <li>
                                                <strong>
                                                    Training Documentation:
                                                </strong>{" "}
                                                All training records maintained
                                                in eTMF with digital signatures
                                                and completion certificates
                                            </li>
                                        </ul>

                                        <h5>
                                            5.3 Site Performance Metrics and
                                            KPIs
                                        </h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Key Performance Indicators
                                                    (KPIs):
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Enrollment Rate: Target
                                                        2-3 subjects per month
                                                        per site
                                                    </li>
                                                    <li>
                                                        Data Quality Score:
                                                        &gt;95% accuracy, &lt;5%
                                                        query rate
                                                    </li>
                                                    <li>
                                                        Query Resolution Time:
                                                        &lt;48 hours for
                                                        critical, &lt;72 hours
                                                        for routine
                                                    </li>
                                                    <li>
                                                        Protocol Compliance:
                                                        &lt;2% major deviations,
                                                        &lt;5% minor deviations
                                                    </li>
                                                    <li>
                                                        SAE Reporting: 100%
                                                        within 24 hours, 0% late
                                                        reports
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Performance Monitoring
                                                    Frequency:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Real-time: Daily
                                                        enrollment and data
                                                        entry tracking
                                                    </li>
                                                    <li>
                                                        Weekly: Query resolution
                                                        and data quality reports
                                                    </li>
                                                    <li>
                                                        Monthly: Comprehensive
                                                        site performance
                                                        dashboard
                                                    </li>
                                                    <li>
                                                        Quarterly: Site ranking
                                                        and comparative analysis
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Performance Scoring System:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Excellent (90-100):
                                                        Recognition and
                                                        potential for additional
                                                        studies
                                                    </li>
                                                    <li>
                                                        Good (80-89): Standard
                                                        monitoring frequency
                                                        maintained
                                                    </li>
                                                    <li>
                                                        Needs Improvement
                                                        (70-79): Enhanced
                                                        monitoring and support
                                                    </li>
                                                    <li>
                                                        Poor (&lt;70):
                                                        Corrective action plan
                                                        and potential
                                                        termination
                                                    </li>
                                                </ol>
                                            </li>
                                        </ul>

                                        <h5>5.4 Corrective Action Plans</h5>
                                        <ul>
                                            <li>
                                                <strong>
                                                    Trigger Conditions:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Performance score &lt;70
                                                        for 2 consecutive months
                                                    </li>
                                                    <li>
                                                        Major protocol
                                                        deviations &gt;3 in any
                                                        30-day period
                                                    </li>
                                                    <li>
                                                        Critical query
                                                        resolution time &gt;72
                                                        hours consistently
                                                    </li>
                                                    <li>
                                                        SAE reporting delays
                                                        &gt;24 hours on 2+
                                                        occasions
                                                    </li>
                                                </ul>
                                            </li>
                                            <li>
                                                <strong>
                                                    Corrective Action Process:
                                                </strong>
                                                <ol>
                                                    <li>
                                                        Day 1: Performance issue
                                                        identification and
                                                        notification
                                                    </li>
                                                    <li>
                                                        Day 3: Root cause
                                                        analysis meeting with
                                                        site team
                                                    </li>
                                                    <li>
                                                        Day 7: Corrective action
                                                        plan development and
                                                        approval
                                                    </li>
                                                    <li>
                                                        Day 14: Implementation
                                                        monitoring and support
                                                    </li>
                                                    <li>
                                                        Day 30: Effectiveness
                                                        evaluation and plan
                                                        adjustment
                                                    </li>
                                                </ol>
                                            </li>
                                            <li>
                                                <strong>
                                                    Escalation Procedures:
                                                </strong>
                                                <ul>
                                                    <li>
                                                        Level 1: Site
                                                        coordinator and monitor
                                                        discussion
                                                    </li>
                                                    <li>
                                                        Level 2: Principal
                                                        Investigator involvement
                                                    </li>
                                                    <li>
                                                        Level 3: Sponsor medical
                                                        monitor consultation
                                                    </li>
                                                    <li>
                                                        Level 4: Site
                                                        termination
                                                        consideration
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={handleSkipMonitoringPlan}
                                className="cancel-btn"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleCloseMonitoringPlan}
                                className="submit-btn"
                            >
                                Complete Setup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateStudy;
