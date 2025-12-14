/**
 * Authentication utilities for managing user sessions
 */

// Store user data in localStorage
export const setUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Get current user data from localStorage
export const getUser = () => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getUser();
};

// Check if user has a specific role
export const hasRole = (role) => {
  const user = getUser();
  return user && user.role === role;
};

// Check if user is a seller
export const isSeller = () => hasRole('seller');

// Check if user is a consumer
export const isConsumer = () => hasRole('consumer');

// Remove user data (logout)
export const logout = () => {
  localStorage.removeItem('user');
};

// Get user ID
export const getUserId = () => {
  const user = getUser();
  return user ? user.ID : null;
};