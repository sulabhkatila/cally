// API service for backend communication
const API_BASE_URL = "http://localhost:5001";

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return this.request("/health");
    }

    // User endpoints
    async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString
            ? `/api/users?${queryString}`
            : "/api/users";
        return this.request(endpoint);
    }

    async getUsersByCompany(company) {
        return this.request(`/api/users/${company}`);
    }

    async getUsersByRole(role) {
        return this.request(`/api/users?role=${role}`);
    }

    // Study endpoints
    async getStudies(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString
            ? `/api/studies?${queryString}`
            : "/api/studies";
        return this.request(endpoint);
    }

    async getStudyById(studyId) {
        return this.request(`/api/studies/${studyId}`);
    }

    async createStudy(studyData) {
        return this.request("/api/studies", {
            method: "POST",
            body: JSON.stringify(studyData),
        });
    }

    async addInvestigatorToStudy(studyId, investigatorData) {
        return this.request(`/api/studies/${studyId}/investigator`, {
            method: "POST",
            body: JSON.stringify(investigatorData),
        });
    }

    // Database statistics
    async getDatabaseStats() {
        return this.request("/api/database/stats");
    }

    // Document endpoints (existing functionality)
    async uploadFile(file) {
        const formData = new FormData();
        formData.append("file", file);

        return this.request("/upload", {
            method: "POST",
            headers: {}, // Let browser set Content-Type for FormData
            body: formData,
        });
    }

    async searchDocuments(query, nResults = 5) {
        return this.request("/search", {
            method: "POST",
            body: JSON.stringify({ query, n_results: nResults }),
        });
    }

    async getDocuments() {
        return this.request("/documents");
    }

    // CRF Files endpoint
    async getCRFFiles() {
        return this.request("/api/files/crf");
    }

    // Get individual CRF file for preview
    getCRFFileUrl(filename) {
        return `${this.baseURL}/api/files/crf/${filename}`;
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
