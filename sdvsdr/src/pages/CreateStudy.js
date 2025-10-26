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
        }, 5000);
    };

    const handleCloseMonitoringPlan = () => {
        setShowMonitoringPlan(false);
        navigate("/studies");
    };

    const handleSkipMonitoringPlan = () => {
        setShowMonitoringPlan(false);
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
                            <div className="monitoring-intro">
                                <p>
                                    Based on your protocol analysis, we can
                                    generate a comprehensive monitoring plan
                                    tailored to your study requirements. This
                                    will include:
                                </p>
                                <ul>
                                    <li>
                                        Remote Source Data Verification (SDV)
                                        strategy
                                    </li>
                                    <li>Risk-based monitoring approach</li>
                                    <li>Site monitoring schedule</li>
                                    <li>Data quality assurance protocols</li>
                                    <li>Regulatory compliance framework</li>
                                </ul>
                            </div>

                            <div className="monitoring-actions">
                                <button
                                    onClick={handleGenerateMonitoringPlan}
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

                            {/* Monitoring Plan Content */}
                            {!isLoadingPlan && (
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
                                        <ul>
                                            <li>
                                                <strong>
                                                    Risk-Based Monitoring:
                                                </strong>{" "}
                                                Focus on high-risk data points
                                                and critical safety endpoints
                                            </li>
                                            <li>
                                                <strong>Remote SDV:</strong>{" "}
                                                100% remote verification for
                                                routine data points
                                            </li>
                                            <li>
                                                <strong>On-Site Visits:</strong>{" "}
                                                Quarterly visits for high-risk
                                                sites, semi-annual for standard
                                                sites
                                            </li>
                                            <li>
                                                <strong>
                                                    Central Monitoring:
                                                </strong>{" "}
                                                Real-time data surveillance and
                                                trend analysis
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="plan-section">
                                        <h4>3. Data Quality Assurance</h4>
                                        <ul>
                                            <li>
                                                Automated data validation rules
                                                for critical variables
                                            </li>
                                            <li>
                                                Query management system for data
                                                discrepancies
                                            </li>
                                            <li>
                                                Source document verification for
                                                primary endpoints
                                            </li>
                                            <li>
                                                Adverse event monitoring and
                                                reporting protocols
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="plan-section">
                                        <h4>4. Regulatory Compliance</h4>
                                        <ul>
                                            <li>
                                                ICH-GCP compliance monitoring
                                            </li>
                                            <li>
                                                FDA 21 CFR Part 11 adherence
                                            </li>
                                            <li>
                                                EMA GCP guidelines
                                                implementation
                                            </li>
                                            <li>
                                                Audit trail maintenance and
                                                documentation
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="plan-section">
                                        <h4>5. Site Management</h4>
                                        <ul>
                                            <li>
                                                Site qualification and
                                                initiation procedures
                                            </li>
                                            <li>
                                                Investigator training and
                                                certification
                                            </li>
                                            <li>
                                                Site performance metrics and
                                                KPIs
                                            </li>
                                            <li>
                                                Corrective action plans for
                                                underperforming sites
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
