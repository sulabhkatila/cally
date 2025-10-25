import { useEffect, useState } from "react";
import dataService from "../services/dataService.js";

export const useUsers = () => {
    const [users, setUsers] = useState({ google: [], veera: [], medidata: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await dataService.getUsers();
                const allUsers = response.users;

                // Group users by company
                const groupedUsers = {
                    google: allUsers.filter(
                        (user) =>
                            user.companyAssociation.toLowerCase() === "google"
                    ),
                    veera: allUsers.filter(
                        (user) =>
                            user.companyAssociation.toLowerCase() ===
                            "veera vault"
                    ),
                    medidata: allUsers.filter(
                        (user) =>
                            user.companyAssociation.toLowerCase() === "medidata"
                    ),
                };

                setUsers(groupedUsers);
            } catch (err) {
                console.error("Error fetching users:", err);
                setError(err);
                // Fallback to empty arrays if backend fails
                setUsers({ google: [], veera: [], medidata: [] });
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return { users, loading, error };
};
