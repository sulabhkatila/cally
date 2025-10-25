import { User } from "./User.js";

// Mock data for different companies and roles
export const mockUsers = {
    google: [
        new User(
            "Sarah",
            "Johnson",
            "sarah.johnson@regeneron.com",
            "Google",
            "Sponsor"
        ),
        new User(
            "Michael",
            "Chen",
            "michael.chen@site.com",
            "Google",
            "Investigator"
        ),
        new User(
            "Emily",
            "Rodriguez",
            "emily.rodriguez@regeneron.com",
            "Google",
            "Sponsor"
        ),
        new User(
            "David",
            "Kim",
            "david.kim@site.com",
            "Google",
            "Investigator"
        ),
    ],
    veera: [
        new User(
            "Jennifer",
            "Williams",
            "jennifer.williams@regeneron.com",
            "Veera Vault",
            "Sponsor"
        ),
        new User(
            "Robert",
            "Brown",
            "robert.brown@site.com",
            "Veera Vault",
            "Investigator"
        ),
        new User(
            "Lisa",
            "Davis",
            "lisa.davis@regeneron.com",
            "Veera Vault",
            "Sponsor"
        ),
        new User(
            "James",
            "Wilson",
            "james.wilson@site.com",
            "Veera Vault",
            "Investigator"
        ),
    ],
    medidata: [
        new User(
            "Amanda",
            "Taylor",
            "amanda.taylor@regeneron.com",
            "Medidata",
            "Sponsor"
        ),
        new User(
            "Christopher",
            "Anderson",
            "christopher.anderson@site.com",
            "Medidata",
            "Investigator"
        ),
        new User(
            "Jessica",
            "Thomas",
            "jessica.thomas@regeneron.com",
            "Medidata",
            "Sponsor"
        ),
        new User(
            "Matthew",
            "Jackson",
            "matthew.jackson@site.com",
            "Medidata",
            "Investigator"
        ),
    ],
};
