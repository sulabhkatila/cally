// User class definition
export class User {
    constructor(firstName, lastName, emailAddress, companyAssociation, role) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.emailAddress = emailAddress;
        this.companyAssociation = companyAssociation;
        this.role = role;
    }

    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }

    getDisplayName() {
        return `${this.role} - ${this.companyAssociation}`;
    }

    getInitials() {
        return `${this.firstName.charAt(0)}${this.lastName.charAt(
            0
        )}`.toUpperCase();
    }
}
