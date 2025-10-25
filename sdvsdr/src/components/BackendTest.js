import React, { useState } from "react";
import {
    runAllTests,
    testBackendConnection,
} from "../utils/testIntegration.js";

const BackendTest = () => {
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState(null);
    const [logs, setLogs] = useState([]);

    const addLog = (message) => {
        setLogs((prev) => [
            ...prev,
            `${new Date().toLocaleTimeString()}: ${message}`,
        ]);
    };

    const runTests = async () => {
        setIsRunning(true);
        setResults(null);
        setLogs([]);

        // Override console.log to capture logs
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
            addLog(args.join(" "));
            originalLog(...args);
        };

        console.error = (...args) => {
            addLog(`ERROR: ${args.join(" ")}`);
            originalError(...args);
        };

        try {
            const success = await runAllTests();
            setResults({
                success,
                message: success ? "All tests passed!" : "Some tests failed.",
            });
        } catch (error) {
            setResults({
                success: false,
                message: `Test failed: ${error.message}`,
            });
        } finally {
            // Restore original console methods
            console.log = originalLog;
            console.error = originalError;
            setIsRunning(false);
        }
    };

    const runConnectionTest = async () => {
        setIsRunning(true);
        setResults(null);
        setLogs([]);

        // Override console.log to capture logs
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args) => {
            addLog(args.join(" "));
            originalLog(...args);
        };

        console.error = (...args) => {
            addLog(`ERROR: ${args.join(" ")}`);
            originalError(...args);
        };

        try {
            const success = await testBackendConnection();
            setResults({
                success,
                message: success
                    ? "Connection test passed!"
                    : "Connection test failed.",
            });
        } catch (error) {
            setResults({
                success: false,
                message: `Connection test failed: ${error.message}`,
            });
        } finally {
            // Restore original console methods
            console.log = originalLog;
            console.error = originalError;
            setIsRunning(false);
        }
    };

    return (
        <div
            style={{
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                margin: "20px",
                backgroundColor: "#f9f9f9",
            }}
        >
            <h3>Backend Integration Test</h3>
            <p>Test the connection between frontend and backend.</p>

            <div style={{ marginBottom: "20px" }}>
                <button
                    onClick={runConnectionTest}
                    disabled={isRunning}
                    style={{
                        padding: "10px 20px",
                        marginRight: "10px",
                        backgroundColor: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isRunning ? "not-allowed" : "pointer",
                        opacity: isRunning ? 0.6 : 1,
                    }}
                >
                    {isRunning ? "Testing..." : "Test Connection"}
                </button>

                <button
                    onClick={runTests}
                    disabled={isRunning}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: isRunning ? "not-allowed" : "pointer",
                        opacity: isRunning ? 0.6 : 1,
                    }}
                >
                    {isRunning ? "Running..." : "Run All Tests"}
                </button>
            </div>

            {results && (
                <div
                    style={{
                        padding: "10px",
                        borderRadius: "4px",
                        backgroundColor: results.success
                            ? "#d1fae5"
                            : "#fee2e2",
                        color: results.success ? "#065f46" : "#991b1b",
                        marginBottom: "20px",
                    }}
                >
                    <strong>
                        {results.success ? "✅" : "❌"} {results.message}
                    </strong>
                </div>
            )}

            {logs.length > 0 && (
                <div
                    style={{
                        backgroundColor: "#1f2937",
                        color: "#f9fafb",
                        padding: "15px",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        maxHeight: "300px",
                        overflowY: "auto",
                    }}
                >
                    <h4 style={{ margin: "0 0 10px 0", color: "#f9fafb" }}>
                        Test Logs:
                    </h4>
                    {logs.map((log, index) => (
                        <div key={index} style={{ marginBottom: "2px" }}>
                            {log}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BackendTest;
