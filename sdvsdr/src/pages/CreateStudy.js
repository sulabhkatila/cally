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
        // Do nothing
    };

    const handleCancel = () => {
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
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">
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
        </div>
    );
};

export default CreateStudy;
