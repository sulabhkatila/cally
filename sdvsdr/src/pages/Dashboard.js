import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getUser } from "../utils/userStorage.js";
import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const user = getUser();

    const handleViewStudies = () => {
        navigate("/studies");
    };

    return (
        <div className="dashboard-page">
            <Navbar />
            <div className="dashboard-main">
                <div className="dashboard-content">
                    <div className="welcome-section">
                        <h2>Welcome to SDV Platform</h2>
                        <p>Your clinical trial data management dashboard</p>

                        <div className="dashboard-actions">
                            <button
                                className="primary-action"
                                onClick={handleViewStudies}
                            >
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path
                                        fill="currentColor"
                                        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"
                                    />
                                </svg>
                                View Studies
                            </button>

                            {user?.role === "Sponsor" && (
                                <button
                                    className="secondary-action"
                                    onClick={() => navigate("/create-study")}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                                        />
                                    </svg>
                                    Create Study
                                </button>
                            )}
                        </div>

                        <div className="user-info">
                            <p>
                                Logged in as:{" "}
                                <strong>{user?.getFullName()}</strong>
                            </p>
                            <p>
                                Role: <strong>{user?.role}</strong>
                            </p>
                            <p>
                                Company:{" "}
                                <strong>{user?.companyAssociation}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
