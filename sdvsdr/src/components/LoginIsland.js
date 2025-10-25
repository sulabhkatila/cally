import React, { useState } from "react";
import "./LoginIsland.css";
import {
    GoogleSSOModal,
    MedidataSSOModal,
    VeeraSSOModal,
} from "./SSOModals.js";

const LoginIsland = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [activeModal, setActiveModal] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement login functionality when backend is ready
        console.log("Login form submitted:", formData);
    };

    const handleSSO = (provider) => {
        setActiveModal(provider);
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedUser(null);
    };

    return (
        <div className="login-island">
            <div className="island-container">
                {/* Form content */}
                <div className="island-content">
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                            <div className="input-glow"></div>
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="form-input"
                                required
                            />
                            <div className="input-glow"></div>
                        </div>

                        <button type="submit" className="submit-button">
                            <span className="button-text">Sign In</span>
                            <div className="button-glow"></div>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="divider">
                        <span className="divider-text">or continue with</span>
                    </div>

                    {/* SSO Buttons */}
                    <div className="sso-buttons">
                        <button
                            className="sso-button google"
                            onClick={() => handleSSO("Google")}
                        >
                            <div className="sso-icon google-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                            </div>
                            <span>Google</span>
                        </button>

                        <button
                            className="sso-button veera"
                            onClick={() => handleSSO("Veera Vault")}
                        >
                            <div className="sso-icon veera-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path
                                        fill="#6366F1"
                                        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                                    />
                                </svg>
                            </div>
                            <span>Veera Vault</span>
                        </button>

                        <button
                            className="sso-button medidata"
                            onClick={() => handleSSO("Medidata")}
                        >
                            <div className="sso-icon medidata-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path
                                        fill="#10B981"
                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                    />
                                </svg>
                            </div>
                            <span>Medidata</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* SSO Modals */}
            {activeModal === "Google" && (
                <GoogleSSOModal
                    onClose={closeModal}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                />
            )}
            {activeModal === "Veera Vault" && (
                <VeeraSSOModal
                    onClose={closeModal}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                />
            )}
            {activeModal === "Medidata" && (
                <MedidataSSOModal
                    onClose={closeModal}
                    selectedUser={selectedUser}
                    setSelectedUser={setSelectedUser}
                />
            )}
        </div>
    );
};

export default LoginIsland;
