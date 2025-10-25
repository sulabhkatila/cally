// Test script to verify frontend-backend integration
import dataService from "../services/dataService.js";

export const testBackendConnection = async () => {
    console.log("Testing backend connection...");

    try {
        // Test health check
        console.log("1. Testing health check...");
        const health = await dataService.healthCheck();
        console.log("✅ Health check passed:", health);

        // Test getting users
        console.log("2. Testing get users...");
        const usersResponse = await dataService.getUsers();
        console.log("✅ Users fetched:", usersResponse.totalCount, "users");

        // Test getting studies
        console.log("3. Testing get studies...");
        const studiesResponse = await dataService.getStudies();
        console.log(
            "✅ Studies fetched:",
            studiesResponse.totalCount,
            "studies"
        );

        // Test getting database stats
        console.log("4. Testing database stats...");
        const stats = await dataService.getDatabaseStats();
        console.log("✅ Database stats:", stats);

        // Test getting users by company
        console.log("5. Testing get users by company...");
        const googleUsers = await dataService.getUsersByCompany("Google");
        console.log("✅ Google users:", googleUsers.totalCount, "users");

        // Test getting studies by status
        console.log("6. Testing get studies by status...");
        const activeStudies = await dataService.getStudies({
            status: "active",
        });
        console.log("✅ Active studies:", activeStudies.totalCount, "studies");

        console.log("🎉 All backend integration tests passed!");
        return true;
    } catch (error) {
        console.error("❌ Backend integration test failed:", error);
        return false;
    }
};

// Test creating a study (this will actually create a study in the backend)
export const testCreateStudy = async () => {
    console.log("Testing study creation...");

    try {
        const testStudyData = {
            title: "Frontend Integration Test Study",
            protocol:
                "This is a test study created from the frontend to verify backend integration.",
            sponsor: "Test Sponsor",
            phase: "Phase I",
            indication: "Test Indication",
            principalInvestigator: {
                name: "Dr. Test Investigator",
                email: "test.investigator@hospital.com",
                institution: "Test Hospital",
                specialty: "Internal Medicine",
            },
        };

        const response = await dataService.createStudy(testStudyData);
        console.log("✅ Study created successfully:", response.study.id);
        return response.study;
    } catch (error) {
        console.error("❌ Study creation test failed:", error);
        throw error;
    }
};

// Test adding investigator to a study
export const testAddInvestigator = async (studyId) => {
    console.log("Testing investigator addition...");

    try {
        const investigatorData = {
            name: "Dr. Test Investigator 2",
            email: "test.investigator2@hospital.com",
            institution: "Test Hospital 2",
            specialty: "Cardiology",
        };

        const response = await dataService.addInvestigatorToStudy(
            studyId,
            investigatorData
        );
        console.log("✅ Investigator added successfully to study:", studyId);
        return response.study;
    } catch (error) {
        console.error("❌ Investigator addition test failed:", error);
        throw error;
    }
};

// Run all integration tests
export const runAllTests = async () => {
    console.log("=".repeat(60));
    console.log("FRONTEND-BACKEND INTEGRATION TESTS");
    console.log("=".repeat(60));

    try {
        // Test basic connection
        const connectionTest = await testBackendConnection();
        if (!connectionTest) {
            console.log("❌ Connection test failed. Stopping tests.");
            return false;
        }

        console.log("\n" + "-".repeat(40) + "\n");

        // Test study creation
        const createdStudy = await testCreateStudy();

        console.log("\n" + "-".repeat(40) + "\n");

        // Test investigator addition
        await testAddInvestigator(createdStudy.id);

        console.log("\n" + "=".repeat(60));
        console.log("🎉 ALL INTEGRATION TESTS PASSED!");
        console.log("Frontend and backend are working together correctly.");
        console.log("=".repeat(60));

        return true;
    } catch (error) {
        console.log("\n" + "=".repeat(60));
        console.log("❌ INTEGRATION TESTS FAILED");
        console.log("Error:", error.message);
        console.log("=".repeat(60));
        return false;
    }
};

// Export for use in browser console or React components
if (typeof window !== "undefined") {
    window.testBackendConnection = testBackendConnection;
    window.testCreateStudy = testCreateStudy;
    window.testAddInvestigator = testAddInvestigator;
    window.runAllTests = runAllTests;
}
