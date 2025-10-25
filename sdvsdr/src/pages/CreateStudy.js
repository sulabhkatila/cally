import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import dataService from "../services/dataService.js";
import { getUser } from "../utils/userStorage.js";
import "./CreateStudy.css";

const CreateStudy = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [formData, setFormData] = useState({
        title: "",
        protocolFile: null,
        description: "",
        phase: "",
        indication: "",
        estimatedDuration: "",
        estimatedSubjects: "",
        principalInvestigator: {
            name: "",
            email: "",
            institution: "",
            specialty: "",
        },
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData((prev) => ({
            ...prev,
            protocolFile: file,
        }));
    };

    const handleInvestigatorChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            principalInvestigator: {
                ...prev.principalInvestigator,
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Prepare study data for backend
            const studyData = {
                title: formData.title,
                protocol: formData.description,
                sponsor: user.companyAssociation,
                phase: formData.phase,
                indication: formData.indication,
                principalInvestigator: formData.principalInvestigator.name
                    ? formData.principalInvestigator
                    : null,
            };

            // Create study via backend API
            const response = await dataService.createStudy(studyData);

            console.log("Study created successfully:", response);
            alert("Study created successfully!");
            navigate("/studies");
        } catch (error) {
            console.error("Error creating study:", error);
            alert("Failed to create study. Please try again.");
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
                        <h2>Principal Investigator (Optional)</h2>
                        <p className="section-description">
                            You can add a principal investigator now or assign
                            one later from the studies dashboard.
                        </p>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="investigatorName">
                                    Investigator Name
                                </label>
                                <input
                                    type="text"
                                    id="investigatorName"
                                    name="name"
                                    value={formData.principalInvestigator.name}
                                    onChange={handleInvestigatorChange}
                                    placeholder="e.g., Dr. Sarah Johnson"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="investigatorEmail">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="investigatorEmail"
                                    name="email"
                                    value={formData.principalInvestigator.email}
                                    onChange={handleInvestigatorChange}
                                    placeholder="e.g., sarah.johnson@hospital.com"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="investigatorInstitution">
                                    Institution
                                </label>
                                <input
                                    type="text"
                                    id="investigatorInstitution"
                                    name="institution"
                                    value={
                                        formData.principalInvestigator
                                            .institution
                                    }
                                    onChange={handleInvestigatorChange}
                                    placeholder="e.g., Johns Hopkins Hospital"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="investigatorSpecialty">
                                    Medical Specialty
                                </label>
                                <input
                                    type="text"
                                    id="investigatorSpecialty"
                                    name="specialty"
                                    value={
                                        formData.principalInvestigator.specialty
                                    }
                                    onChange={handleInvestigatorChange}
                                    placeholder="e.g., Oncology, Cardiology"
                                />
                            </div>
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
