import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import dataService from "../services/dataService.js";
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
        setIsAnalyzing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Send to backend for protocol analysis
            const response = await fetch("/api/analyze-protocol", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to analyze protocol");
            }

            const result = await response.json();
            setAnalysisResult(result);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!analysisResult) {
                throw new Error("Please analyze the protocol first");
            }

            // Create study data from analysis result
            const studyData = {
                title:
                    analysisResult.trial_overview?.protocol_title ||
                    "Unknown Study",
                protocol: protocolFile.name,
                sponsor: user.companyAssociation,
                phase: analysisResult.trial_overview?.study_phase || "Unknown",
                indication:
                    analysisResult.trial_overview?.indication || "Unknown",
                description: analysisResult.trial_overview?.description || "",
                estimatedDuration:
                    analysisResult.trial_design?.duration || "Unknown",
                estimatedSubjects:
                    analysisResult.trial_design?.sample_size || "Unknown",
                principalInvestigator:
                    analysisResult.key_personnel?.principal_investigators ||
                    null,
                // Store the full analysis result for future reference
                protocolAnalysis: analysisResult,
            };

            // Create study via backend API
            const response = await dataService.createStudy(studyData);

            console.log("Study created successfully:", response);
            alert("Study created successfully!");
            navigate("/studies");
        } catch (error) {
            console.error("Error creating study:", error);
            alert("Failed to create study: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
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
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isSubmitting || !analysisResult}
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
        </div>
    );
};

export default CreateStudy;
