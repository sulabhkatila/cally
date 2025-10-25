import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.js";
import { mockStudies } from "../data/studies.js";
import { getUser } from "../utils/userStorage.js";
import "./StudiesDashboard.css";

const StudiesDashboard = () => {
    const navigate = useNavigate();
    const user = getUser();
    const [studies] = useState(mockStudies);
    const [selectedStudy, setSelectedStudy] = useState(null);

    const isSponsor = user?.role === "Sponsor";
    const isInvestigator = user?.role === "Investigator";

    const handleCreateStudy = () => {
        navigate("/create-study");
    };

    const handleStudyClick = (study) => {
        setSelectedStudy(study);
        navigate(`/study/${study.id}`);
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
                                                backgroundColor: getStatusColor(
                                                    study.status
                                                ),
                                            }}
                                        >
                                            {getStatusIcon(study.status)}{" "}
                                            {study.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div className="study-details">
                                    <div className="detail-item">
                                        <span className="label">Sponsor:</span>
                                        <span className="value">
                                            {study.sponsor}
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Sites:</span>
                                        <span className="value">
                                            {study.getActiveSites()}/
                                            {study.getTotalSites()} active
                                        </span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="label">Created:</span>
                                        <span className="value">
                                            {study.createdAt.toLocaleDateString()}
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
                                        <h4>eSource Files</h4>
                                        <div className="file-count">
                                            {study.eSourceFiles.length} file
                                            {study.eSourceFiles.length !== 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    </div>

                                    <div className="file-section">
                                        <h4>CRF Files</h4>
                                        <div className="file-count">
                                            {study.crfFiles.length} file
                                            {study.crfFiles.length !== 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    </div>
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
                                        site.investigator === user.getFullName()
                                )
                            )
                            .map((study) => (
                                <div
                                    key={study.id}
                                    className="study-card investigator-card"
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
                                                {getStatusIcon(study.status)}{" "}
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
                                                                (file) =>
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
                                                                (file) =>
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
                        <p>You don't have permission to view studies.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudiesDashboard;
