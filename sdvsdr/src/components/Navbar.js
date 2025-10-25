import React from "react";
import { useNavigate } from "react-router-dom";
import { clearUser, getUser } from "../utils/userStorage.js";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        // Clear localStorage
        clearUser();

        // Redirect to login
        navigate("/login");
    };

    return (
        <nav className="dashboard-navbar">
            <div className="navbar-content">
                <div className="navbar-left">
                    <h1 className="navbar-title">SDV Platform</h1>
                </div>
                <div className="navbar-right">
                    <div className="profile-dropdown">
                        <button className="profile-button">
                            <div className="profile-icon">
                                <svg viewBox="0 0 24 24" width="24" height="24">
                                    <path
                                        fill="currentColor"
                                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                    />
                                </svg>
                            </div>
                        </button>
                        <div className="dropdown-menu">
                            <div className="dropdown-header">
                                <div className="user-info">
                                    <div className="user-avatar">
                                        {user ? user.getInitials() : "U"}
                                    </div>
                                    <div className="user-details">
                                        <div className="user-name">
                                            {user ? user.getFullName() : "User"}
                                        </div>
                                        <div className="user-email">
                                            {user
                                                ? user.emailAddress
                                                : "user@example.com"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <button
                                className="dropdown-item logout"
                                onClick={handleLogout}
                            >
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path
                                        fill="currentColor"
                                        d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                                    />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
