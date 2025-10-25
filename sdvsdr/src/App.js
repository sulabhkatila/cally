import React from "react";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import "./App.css";
import CreateStudy from "./pages/CreateStudy";
import Login from "./pages/Login";
import StudiesDashboard from "./pages/StudiesDashboard";
import { getUser } from "./utils/userStorage.js";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const user = getUser();
    return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to studies if already logged in)
const PublicRoute = ({ children }) => {
    const user = getUser();
    return user ? <Navigate to="/studies" replace /> : children;
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/studies"
                        element={
                            <ProtectedRoute>
                                <StudiesDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/create-study"
                        element={
                            <ProtectedRoute>
                                <CreateStudy />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
