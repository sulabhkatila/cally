import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import { getUser } from "../utils/userStorage.js";
import "./CreateStudy.css";

const CreateStudy = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [formData, setFormData] = useState({
        title: "",
        protocol: "",
        description: "",
        phase: "",
        indication: "",
        primaryEndpoint: "",
        secondaryEndpoints: "",
        inclusionCriteria: "",
        exclusionCriteria: "",
        estimatedDuration: "",
        estimatedSubjects: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            console.log("Study created:", formData);
            setIsSubmitting(false);
            navigate("/studies");
        }, 2000);
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
                            Set up a new clinical trial for source data
                            verification
                        </p>
                    </div>
                </div>
            </div>

            <div className="page-content">
                <form onSubmit={handleSubmit} className="study-form">
                    <div className="form-section">
                        <h2>Study Information</h2>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label htmlFor="title">Study Title *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Phase III Trial: Novel Cancer Treatment"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phase">Phase *</label>
                                <select
                                    id="phase"
                                    name="phase"
                                    value={formData.phase}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Phase</option>
                                    <option value="Phase I">Phase I</option>
                                    <option value="Phase II">Phase II</option>
                                    <option value="Phase III">Phase III</option>
                                    <option value="Phase IV">Phase IV</option>
                                    <option value="Pilot">Pilot Study</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="indication">Indication *</label>
                                <input
                                    type="text"
                                    id="indication"
                                    name="indication"
                                    value={formData.indication}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Advanced Solid Tumors"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="estimatedDuration">
                                    Estimated Duration
                                </label>
                                <input
                                    type="text"
                                    id="estimatedDuration"
                                    name="estimatedDuration"
                                    value={formData.estimatedDuration}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 24 months"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="estimatedSubjects">
                                    Estimated Subjects
                                </label>
                                <input
                                    type="number"
                                    id="estimatedSubjects"
                                    name="estimatedSubjects"
                                    value={formData.estimatedSubjects}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 300"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Protocol Details</h2>
                        <div className="form-group">
                            <label htmlFor="protocol">
                                Protocol Description *
                            </label>
                            <textarea
                                id="protocol"
                                name="protocol"
                                value={formData.protocol}
                                onChange={handleInputChange}
                                placeholder="Describe the study protocol, methodology, and objectives..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Additional Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Any additional details about the study..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Study Endpoints</h2>
                        <div className="form-group">
                            <label htmlFor="primaryEndpoint">
                                Primary Endpoint *
                            </label>
                            <textarea
                                id="primaryEndpoint"
                                name="primaryEndpoint"
                                value={formData.primaryEndpoint}
                                onChange={handleInputChange}
                                placeholder="Define the primary endpoint of the study..."
                                rows="3"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="secondaryEndpoints">
                                Secondary Endpoints
                            </label>
                            <textarea
                                id="secondaryEndpoints"
                                name="secondaryEndpoints"
                                value={formData.secondaryEndpoints}
                                onChange={handleInputChange}
                                placeholder="List any secondary endpoints..."
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h2>Eligibility Criteria</h2>
                        <div className="form-group">
                            <label htmlFor="inclusionCriteria">
                                Inclusion Criteria *
                            </label>
                            <textarea
                                id="inclusionCriteria"
                                name="inclusionCriteria"
                                value={formData.inclusionCriteria}
                                onChange={handleInputChange}
                                placeholder="List the inclusion criteria for study participants..."
                                rows="4"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="exclusionCriteria">
                                Exclusion Criteria *
                            </label>
                            <textarea
                                id="exclusionCriteria"
                                name="exclusionCriteria"
                                value={formData.exclusionCriteria}
                                onChange={handleInputChange}
                                placeholder="List the exclusion criteria for study participants..."
                                rows="4"
                                required
                            />
                        </div>
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
                                    <div className="loading-spinner"></div>
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
