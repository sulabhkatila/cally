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

// Mock studies data
export const mockStudies = [
    new Study(
        "STD-001",
        "Phase III Trial: Novel Cancer Treatment",
        "A randomized, double-blind, placebo-controlled study to evaluate the efficacy and safety of NovelCancer Drug in patients with advanced solid tumors.",
        "Regeneron Pharmaceuticals",
        "active",
        new Date("2024-01-15"),
        [
            new Site(
                "SITE-001",
                "Johns Hopkins Hospital",
                "Dr. Sarah Johnson",
                "Baltimore, MD",
                "active"
            ),
            new Site(
                "SITE-002",
                "Mayo Clinic",
                "Dr. Michael Chen",
                "Rochester, MN",
                "active"
            ),
            new Site(
                "SITE-003",
                "Cleveland Clinic",
                "Dr. Emily Rodriguez",
                "Cleveland, OH",
                "pending"
            ),
        ],
        {
            name: "Dr. Sarah Johnson",
            email: "sarah.johnson@regeneron.com",
            institution: "Johns Hopkins Hospital",
            specialty: "Oncology",
        }
    ),
    new Study(
        "STD-002",
        "Phase II Study: Cardiovascular Intervention",
        "A multicenter, open-label study to assess the safety and efficacy of CardioIntervention Device in patients with coronary artery disease.",
        "Medtronic Inc.",
        "draft",
        new Date("2024-02-01"),
        [
            new Site(
                "SITE-004",
                "Massachusetts General Hospital",
                "Dr. David Kim",
                "Boston, MA",
                "pending"
            ),
            new Site(
                "SITE-005",
                "Stanford Medical Center",
                "Dr. Lisa Davis",
                "Stanford, CA",
                "pending"
            ),
        ],
        null // No principal investigator assigned yet
    ),
    new Study(
        "STD-003",
        "Phase I Safety Study: Neurological Treatment",
        "A first-in-human study to evaluate the safety, tolerability, and pharmacokinetics of NeuroTreatment in healthy volunteers.",
        "Biogen Inc.",
        "active",
        new Date("2024-01-20"),
        [
            new Site(
                "SITE-006",
                "UCLA Medical Center",
                "Dr. James Wilson",
                "Los Angeles, CA",
                "active"
            ),
            new Site(
                "SITE-007",
                "Mount Sinai Hospital",
                "Dr. Amanda Taylor",
                "New York, NY",
                "active"
            ),
        ],
        {
            name: "Dr. James Wilson",
            email: "james.wilson@site.com",
            institution: "UCLA Medical Center",
            specialty: "Neurology",
        }
    ),
];

// Add some mock files to studies
mockStudies[0].addESourceFile(
    new StudyFile(
        "FILE-001",
        "eSource_Template_v2.1.pdf",
        "esource",
        "Dr. Sarah Johnson",
        new Date("2024-01-20"),
        "approved",
        2048576
    )
);
mockStudies[0].addCRFFile(
    new StudyFile(
        "FILE-002",
        "CRF_Visit1_v1.0.pdf",
        "crf",
        "Dr. Michael Chen",
        new Date("2024-01-22"),
        "under-review",
        1536000
    )
);

mockStudies[1].addESourceFile(
    new StudyFile(
        "FILE-003",
        "eSource_Protocol_v1.0.pdf",
        "esource",
        "Dr. David Kim",
        new Date("2024-02-05"),
        "pending",
        3072000
    )
);

mockStudies[2].addESourceFile(
    new StudyFile(
        "FILE-004",
        "eSource_Neurological_v1.2.pdf",
        "esource",
        "Dr. James Wilson",
        new Date("2024-01-25"),
        "approved",
        2560000
    )
);
mockStudies[2].addCRFFile(
    new StudyFile(
        "FILE-005",
        "CRF_Neurological_v1.1.pdf",
        "crf",
        "Dr. Amanda Taylor",
        new Date("2024-01-28"),
        "approved",
        1792000
    )
);
