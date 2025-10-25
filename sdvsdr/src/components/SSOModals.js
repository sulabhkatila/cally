import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockUsers } from "../data/mockUsers.js";
import { storeUser } from "../utils/userStorage.js";

// Google SSO Modal Component
export const GoogleSSOModal = ({ onClose, selectedUser, setSelectedUser }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const navigate = useNavigate();

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setShowConsent(true);
    };

    const handleBackToAccounts = () => {
        setShowConsent(false);
        setSelectedUser(null);
    };

    const handleGoogleLogin = () => {
        if (!selectedUser) return;

        setIsLoading(true);
        // Simulate Google SSO process
        setTimeout(() => {
            // Store user data in localStorage
            storeUser(selectedUser);
            localStorage.setItem("authMethod", "Google SSO");

            setIsLoading(false);
            onClose();
            console.log(
                "Google SSO completed for:",
                selectedUser.getFullName()
            );

            // Navigate to studies
            navigate("/studies");
        }, 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container google-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="google-logo">
                        <svg viewBox="0 0 24 24" width="24" height="24">
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
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                {!showConsent ? (
                    // Account Selection Screen
                    <div className="modal-content two-panel">
                        <div className="left-panel">
                            <h2>Choose an account</h2>
                            <p>to continue to SDV Platform</p>
                        </div>
                        <div className="right-panel">
                            <div className="google-accounts">
                                {mockUsers.google.map((user, index) => (
                                    <div
                                        key={index}
                                        className="account-item"
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <div className="account-avatar">
                                            {user.getInitials()}
                                        </div>
                                        <div className="account-info">
                                            <div className="account-name">
                                                {user.getFullName()}
                                            </div>
                                            <div className="account-email">
                                                {user.emailAddress}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="account-item add-account">
                                    <div className="account-avatar add-icon">
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="20"
                                            height="20"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="account-info">
                                        <div className="account-name">
                                            Use another account
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Consent Screen
                    <div className="modal-content two-panel">
                        <div className="left-panel">
                            <h2>Sign in to SDV Platform</h2>
                            <div className="selected-account">
                                <div className="account-avatar">
                                    {selectedUser.getInitials()}
                                </div>
                                <div className="account-info">
                                    <div className="account-email">
                                        {selectedUser.emailAddress}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="right-panel">
                            <h3>
                                Google will allow SDV Platform to access this
                                info about you
                            </h3>
                            <div className="permissions-list">
                                <div className="permission-item">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                        />
                                    </svg>
                                    <div className="permission-info">
                                        <div className="permission-name">
                                            {selectedUser.getFullName()}
                                        </div>
                                        <div className="permission-desc">
                                            Name and profile picture
                                        </div>
                                    </div>
                                </div>
                                <div className="permission-item">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                                        />
                                    </svg>
                                    <div className="permission-info">
                                        <div className="permission-name">
                                            {selectedUser.emailAddress}
                                        </div>
                                        <div className="permission-desc">
                                            Email address
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="consent-text">
                                <p>
                                    Review SDV Platform's{" "}
                                    <a href="#" className="link">
                                        privacy policy
                                    </a>{" "}
                                    and{" "}
                                    <a href="#" className="link">
                                        Terms of Service
                                    </a>{" "}
                                    to understand how SDV Platform will process
                                    and protect your data.
                                </p>
                                <p>
                                    To make changes at any time, go to your{" "}
                                    <a href="#" className="link">
                                        Google Account
                                    </a>
                                    .
                                </p>
                                <p>
                                    <a href="#" className="link">
                                        Learn more about Sign in with Google
                                    </a>
                                    .
                                </p>
                            </div>
                            <div className="consent-buttons">
                                <button
                                    className="cancel-btn"
                                    onClick={handleBackToAccounts}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="google-continue-btn"
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        "Continue"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Veera Vault SSO Modal Component
export const VeeraSSOModal = ({ onClose, selectedUser, setSelectedUser }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const navigate = useNavigate();

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setShowConsent(true);
    };

    const handleBackToAccounts = () => {
        setShowConsent(false);
        setSelectedUser(null);
    };

    const handleVeeraLogin = () => {
        if (!selectedUser) return;

        setIsLoading(true);
        // Simulate Veera SSO process
        setTimeout(() => {
            // Store user data in localStorage
            storeUser(selectedUser);
            localStorage.setItem("authMethod", "Veera Vault SSO");

            setIsLoading(false);
            onClose();
            console.log(
                "Veera Vault SSO completed for:",
                selectedUser.getFullName()
            );

            // Navigate to studies
            navigate("/studies");
        }, 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container veera-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="veera-logo">
                        <span style={{ color: "#FF6B35" }}>Veeva</span>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                {!showConsent ? (
                    // Account Selection Screen
                    <div className="modal-content two-panel">
                        <div className="left-panel">
                            <h2>Choose an account</h2>
                            <p>to continue to Veeva Vault</p>
                        </div>
                        <div className="right-panel">
                            <div className="veera-accounts">
                                {mockUsers.veera.map((user, index) => (
                                    <div
                                        key={index}
                                        className="account-item"
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <div className="account-avatar">
                                            {user.getInitials()}
                                        </div>
                                        <div className="account-info">
                                            <div className="account-name">
                                                {user.getFullName()}
                                            </div>
                                            <div className="account-email">
                                                {user.emailAddress}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="account-item add-account">
                                    <div className="account-avatar add-icon">
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="20"
                                            height="20"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="account-info">
                                        <div className="account-name">
                                            Use another account
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Consent Screen
                    <div className="modal-content two-panel">
                        <div className="left-panel">
                            <h2>Sign in to Veeva Vault</h2>
                            <div className="selected-account">
                                <div className="account-avatar">
                                    {selectedUser.getInitials()}
                                </div>
                                <div className="account-info">
                                    <div className="account-email">
                                        {selectedUser.emailAddress}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="right-panel">
                            <h3>
                                Veeva Vault will allow SDV Platform to access
                                this info about you
                            </h3>
                            <div className="permissions-list">
                                <div className="permission-item">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                        />
                                    </svg>
                                    <div className="permission-info">
                                        <div className="permission-name">
                                            {selectedUser.getFullName()}
                                        </div>
                                        <div className="permission-desc">
                                            Name and profile picture
                                        </div>
                                    </div>
                                </div>
                                <div className="permission-item">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                                        />
                                    </svg>
                                    <div className="permission-info">
                                        <div className="permission-name">
                                            {selectedUser.emailAddress}
                                        </div>
                                        <div className="permission-desc">
                                            Email address
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="consent-text">
                                <p>
                                    Review SDV Platform's{" "}
                                    <a href="#" className="link">
                                        privacy policy
                                    </a>{" "}
                                    and{" "}
                                    <a href="#" className="link">
                                        Terms of Service
                                    </a>{" "}
                                    to understand how SDV Platform will process
                                    and protect your data.
                                </p>
                                <p>
                                    To make changes at any time, go to your{" "}
                                    <a href="#" className="link">
                                        Veeva Account
                                    </a>
                                    .
                                </p>
                                <p>
                                    <a href="#" className="link">
                                        Learn more about Veeva Vault SSO
                                    </a>
                                    .
                                </p>
                            </div>
                            <div className="consent-buttons">
                                <button
                                    className="cancel-btn"
                                    onClick={handleBackToAccounts}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="veera-continue-btn"
                                    onClick={handleVeeraLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        "Sign In to Vault"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Medidata SSO Modal Component
export const MedidataSSOModal = ({
    onClose,
    selectedUser,
    setSelectedUser,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConsent, setShowConsent] = useState(false);
    const navigate = useNavigate();

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setShowConsent(true);
    };

    const handleBackToAccounts = () => {
        setShowConsent(false);
        setSelectedUser(null);
    };

    const handleMedidataLogin = () => {
        if (!selectedUser) return;

        setIsLoading(true);
        // Simulate Medidata SSO process
        setTimeout(() => {
            // Store user data in localStorage
            storeUser(selectedUser);
            localStorage.setItem("authMethod", "Medidata SSO");

            setIsLoading(false);
            onClose();
            console.log(
                "Medidata SSO completed for:",
                selectedUser.getFullName()
            );

            // Navigate to studies
            navigate("/studies");
        }, 2000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-container medidata-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <div className="medidata-logo">
                        <span style={{ color: "#1E3A8A" }}>MEDIDATA</span>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                {!showConsent ? (
                    // Account Selection Screen
                    <div className="modal-content two-panel">
                        <div className="left-panel">
                            <h2>Choose an account</h2>
                            <p>to continue to Medidata</p>
                        </div>
                        <div className="right-panel">
                            <div className="medidata-accounts">
                                {mockUsers.medidata.map((user, index) => (
                                    <div
                                        key={index}
                                        className="account-item"
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <div className="account-avatar">
                                            {user.getInitials()}
                                        </div>
                                        <div className="account-info">
                                            <div className="account-name">
                                                {user.getFullName()}
                                            </div>
                                            <div className="account-email">
                                                {user.emailAddress}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="account-item add-account">
                                    <div className="account-avatar add-icon">
                                        <svg
                                            viewBox="0 0 24 24"
                                            width="20"
                                            height="20"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="account-info">
                                        <div className="account-name">
                                            Use another account
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Consent Screen
                    <div className="modal-content two-panel">
                        <div className="left-panel">
                            <h2>Sign in to Medidata</h2>
                            <div className="selected-account">
                                <div className="account-avatar">
                                    {selectedUser.getInitials()}
                                </div>
                                <div className="account-info">
                                    <div className="account-email">
                                        {selectedUser.emailAddress}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="right-panel">
                            <h3>
                                Medidata will allow SDV Platform to access this
                                info about you
                            </h3>
                            <div className="permissions-list">
                                <div className="permission-item">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                        />
                                    </svg>
                                    <div className="permission-info">
                                        <div className="permission-name">
                                            {selectedUser.getFullName()}
                                        </div>
                                        <div className="permission-desc">
                                            Name and profile picture
                                        </div>
                                    </div>
                                </div>
                                <div className="permission-item">
                                    <svg
                                        viewBox="0 0 24 24"
                                        width="20"
                                        height="20"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                                        />
                                    </svg>
                                    <div className="permission-info">
                                        <div className="permission-name">
                                            {selectedUser.emailAddress}
                                        </div>
                                        <div className="permission-desc">
                                            Email address
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="consent-text">
                                <p>
                                    Review SDV Platform's{" "}
                                    <a href="#" className="link">
                                        privacy policy
                                    </a>{" "}
                                    and{" "}
                                    <a href="#" className="link">
                                        Terms of Service
                                    </a>{" "}
                                    to understand how SDV Platform will process
                                    and protect your data.
                                </p>
                                <p>
                                    To make changes at any time, go to your{" "}
                                    <a href="#" className="link">
                                        Medidata Account
                                    </a>
                                    .
                                </p>
                                <p>
                                    <a href="#" className="link">
                                        Learn more about Medidata SSO
                                    </a>
                                    .
                                </p>
                            </div>
                            <div className="consent-buttons">
                                <button
                                    className="cancel-btn"
                                    onClick={handleBackToAccounts}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="medidata-continue-btn"
                                    onClick={handleMedidataLogin}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        "Sign In"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
