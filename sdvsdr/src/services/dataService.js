// Data service for converting between backend API data and frontend models
import { Site, Study, StudyFile } from "../data/studies.js";
import { User } from "../data/User.js";
import apiService from "./api.js";

class DataService {
    // Convert backend user data to frontend User model
    convertToUser(backendUser) {
        return new User(
            backendUser.firstName,
            backendUser.lastName,
            backendUser.emailAddress,
            backendUser.companyAssociation,
            backendUser.role
        );
    }

    // Convert backend site data to frontend Site model
    convertToSite(backendSite) {
        const site = new Site(
            backendSite.id,
            backendSite.name,
            backendSite.investigator,
            backendSite.location,
            backendSite.status
        );

        // Add eSource files
        if (backendSite.eSourceFiles) {
            backendSite.eSourceFiles.forEach((file) => {
                site.addESourceFile(this.convertToStudyFile(file));
            });
        }

        // Add CRF files
        if (backendSite.crfFiles) {
            backendSite.crfFiles.forEach((file) => {
                site.addCRFFile(this.convertToStudyFile(file));
            });
        }

        return site;
    }

    // Convert backend study file data to frontend StudyFile model
    convertToStudyFile(backendFile) {
        return new StudyFile(
            backendFile.id,
            backendFile.name,
            backendFile.type,
            backendFile.uploadedBy,
            new Date(backendFile.uploadedAt),
            backendFile.status,
            backendFile.size
        );
    }

    // Convert backend study data to frontend Study model
    convertToStudy(backendStudy) {
        const study = new Study(
            backendStudy.id,
            backendStudy.title,
            backendStudy.protocol,
            backendStudy.sponsor,
            backendStudy.status,
            new Date(backendStudy.createdAt),
            [], // sites will be added below
            backendStudy.principalInvestigator
        );

        // Add sites
        if (backendStudy.sites) {
            backendStudy.sites.forEach((site) => {
                study.addSite(this.convertToSite(site));
            });
        }

        // Add eSource files
        if (backendStudy.eSourceFiles) {
            backendStudy.eSourceFiles.forEach((file) => {
                study.addESourceFile(this.convertToStudyFile(file));
            });
        }

        // Add CRF files
        if (backendStudy.crfFiles) {
            backendStudy.crfFiles.forEach((file) => {
                study.addCRFFile(this.convertToStudyFile(file));
            });
        }

        return study;
    }

    // User API methods
    async getUsers(params = {}) {
        try {
            const response = await apiService.getUsers(params);
            return {
                users: response.users.map((user) => this.convertToUser(user)),
                totalCount: response.total_count,
            };
        } catch (error) {
            console.error("Error fetching users:", error);
            throw error;
        }
    }

    async getUsersByCompany(company) {
        try {
            const response = await apiService.getUsersByCompany(company);
            return {
                users: response.users.map((user) => this.convertToUser(user)),
                totalCount: response.total_count,
            };
        } catch (error) {
            console.error(
                `Error fetching users for company ${company}:`,
                error
            );
            throw error;
        }
    }

    async getUsersByRole(role) {
        try {
            const response = await apiService.getUsersByRole(role);
            return {
                users: response.users.map((user) => this.convertToUser(user)),
                totalCount: response.total_count,
            };
        } catch (error) {
            console.error(`Error fetching users for role ${role}:`, error);
            throw error;
        }
    }

    // Study API methods
    async getStudies(params = {}) {
        try {
            const response = await apiService.getStudies(params);
            return {
                studies: response.studies.map((study) =>
                    this.convertToStudy(study)
                ),
                totalCount: response.total_count,
            };
        } catch (error) {
            console.error("Error fetching studies:", error);
            throw error;
        }
    }

    async getStudyById(studyId) {
        try {
            const response = await apiService.getStudyById(studyId);
            return this.convertToStudy(response.study);
        } catch (error) {
            console.error(`Error fetching study ${studyId}:`, error);
            throw error;
        }
    }

    async createStudy(studyData) {
        try {
            const response = await apiService.createStudy(studyData);
            return {
                message: response.message,
                study: this.convertToStudy(response.study),
            };
        } catch (error) {
            console.error("Error creating study:", error);
            throw error;
        }
    }

    async addInvestigatorToStudy(studyId, investigatorData) {
        try {
            const response = await apiService.addInvestigatorToStudy(
                studyId,
                investigatorData
            );
            return {
                message: response.message,
                study: this.convertToStudy(response.study),
            };
        } catch (error) {
            console.error(
                `Error adding investigator to study ${studyId}:`,
                error
            );
            throw error;
        }
    }

    // Database statistics
    async getDatabaseStats() {
        try {
            const response = await apiService.getDatabaseStats();
            return response.statistics;
        } catch (error) {
            console.error("Error fetching database stats:", error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            return await apiService.healthCheck();
        } catch (error) {
            console.error("Error checking backend health:", error);
            throw error;
        }
    }

    // CRF Files API methods
    async getCRFFiles() {
        try {
            const response = await apiService.getCRFFiles();
            return response.files;
        } catch (error) {
            console.error("Error fetching CRF files:", error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;
