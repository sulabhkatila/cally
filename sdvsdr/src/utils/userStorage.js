import { User } from "../data/User.js";

// Utility functions for storing and retrieving User objects from localStorage
export const storeUser = (user) => {
    const userData = {
        firstName: user.firstName,
        lastName: user.lastName,
        emailAddress: user.emailAddress,
        companyAssociation: user.companyAssociation,
        role: user.role,
    };
    localStorage.setItem("user", JSON.stringify(userData));
};

export const getUser = () => {
    const userData = localStorage.getItem("user");
    if (!userData) return null;

    const parsed = JSON.parse(userData);
    return new User(
        parsed.firstName,
        parsed.lastName,
        parsed.emailAddress,
        parsed.companyAssociation,
        parsed.role
    );
};

export const clearUser = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("authMethod");
};
