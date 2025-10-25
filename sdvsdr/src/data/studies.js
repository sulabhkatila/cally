// Study data structure and mock data
export class Study {
    constructor(
        id,
        title,
        protocol,
        sponsor,
        status,
        createdAt,
        sites = [],
        principalInvestigator = null
    ) {
        this.id = id;
        this.title = title;
        this.protocol = protocol;
        this.sponsor = sponsor;
        this.status = status; // 'draft', 'active', 'completed', 'on-hold'
        this.createdAt = createdAt;
        this.sites = sites;
        this.principalInvestigator = principalInvestigator;
        this.eSourceFiles = [];
        this.crfFiles = [];
    }

    addSite(site) {
        this.sites.push(site);
    }

    addESourceFile(file) {
        this.eSourceFiles.push(file);
    }

    addCRFFile(file) {
        this.crfFiles.push(file);
    }

    getTotalSites() {
        return this.sites.length;
    }

    getActiveSites() {
        return this.sites.filter((site) => site.status === "active").length;
    }

    hasPrincipalInvestigator() {
        return (
            this.principalInvestigator !== null &&
            this.principalInvestigator !== undefined
        );
    }

    setPrincipalInvestigator(investigator) {
        this.principalInvestigator = investigator;
    }
}

export class Site {
    constructor(id, name, investigator, location, status = "pending") {
        this.id = id;
        this.name = name;
        this.investigator = investigator;
        this.location = location;
        this.status = status; // 'pending', 'active', 'inactive'
        this.eSourceFiles = [];
        this.crfFiles = [];
    }

    addESourceFile(file) {
        this.eSourceFiles.push(file);
    }

    addCRFFile(file) {
        this.crfFiles.push(file);
    }
}

export class StudyFile {
    constructor(
        id,
        name,
        type,
        uploadedBy,
        uploadedAt,
        status = "pending",
        size = 0
    ) {
        this.id = id;
        this.name = name;
        this.type = type; // 'protocol', 'esource', 'crf'
        this.uploadedBy = uploadedBy;
        this.uploadedAt = uploadedAt;
        this.status = status; // 'pending', 'approved', 'rejected', 'under-review'
        this.size = size;
    }
}

// Note: Mock studies data has been removed since we now fetch studies from the backend API
