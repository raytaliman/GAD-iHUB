import { useState, useEffect } from 'react';

const AUTH_KEY = 'csf-auth';

/**
 * Helper function to verify authentication status from local storage.
 * 
 * @private
 * @returns {boolean} True if the user is authenticated, false otherwise.
 */
function checkAuth() {
    try {
        const auth = localStorage.getItem(AUTH_KEY);
        if (auth) {
            const parsed = JSON.parse(auth);
            return parsed.loggedIn === true;
        }
    } catch (_) { }
    return false;
}

/**
 * Custom hook for managing authentication state.
 * Handles login, logout, and storage synchronization across tabs.
 * 
 * @returns {Object} An object containing authentication state and methods.
 * @property {boolean} isAuthenticated - Current authentication status.
 * @property {Function} login - Method to log in a user.
 * @property {Function} logout - Method to log out the user.
 * @property {Function} updateAuth - Method to update existing auth data.
 */
export function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => checkAuth());

    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(checkAuth());
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    /**
     * Persists user data to local storage and updates local state.
     * @param {Object} userData - Data to associate with the session.
     */
    const login = (userData) => {
        localStorage.setItem(AUTH_KEY, JSON.stringify({ ...userData, loggedIn: true }));
        setIsAuthenticated(true);
    };

    /**
     * Removes session data and redirects to the landing page.
     */
    const logout = () => {
        localStorage.removeItem(AUTH_KEY);
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    /**
     * Updates specific fields in the existing auth data.
     * @param {Object} newUserData - Partial user data to merge.
     */
    const updateAuth = (newUserData) => {
        const auth = localStorage.getItem(AUTH_KEY);
        if (auth) {
            const parsed = JSON.parse(auth);
            const updated = { ...parsed, ...newUserData };
            localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
            // Trigger storage event for same-tab updates
            window.dispatchEvent(new Event('storage'));
        }
    };

    return {
        isAuthenticated,
        login,
        logout,
        updateAuth,
    };
}
