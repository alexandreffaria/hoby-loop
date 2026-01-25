/**
 * Authentication utilities for managing user sessions
 */

// Store user data in localStorage
export const setUser = (userData) => {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

// Get current user data from localStorage
export const getUser = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return null;
    }
    
    const parsedData = JSON.parse(userData);
    
    // Validate that the parsed data has required properties
    if (!parsedData || typeof parsedData !== 'object') {
      console.warn('Invalid user data format');
      return null;
    }
    
    return parsedData;
  } catch (error) {
    console.error('Error reading user data:', error);
    // Clear corrupted data
    localStorage.removeItem('user');
    return null;
  }
};

// Get user role from localStorage
export const getUserRole = () => {
  try {
    const user = getUser();
    return user?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  try {
    const user = getUser();
    return !!user && !!user.role;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Check if user has a specific role
export const hasRole = (role) => {
  try {
    if (!role) {
      return false;
    }
    const user = getUser();
    return user && user.role === role;
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
};

// Check if user is a seller
export const isSeller = () => hasRole('seller');

// Check if user is a consumer
export const isConsumer = () => hasRole('consumer');

// Check if user is an admin
export const isAdmin = () => hasRole('admin');

// Remove user data (logout)
export const logout = () => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// Get user ID
export const getUserId = () => {
  try {
    const user = getUser();
    return user?.ID || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};