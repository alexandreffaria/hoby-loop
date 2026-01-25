import { Navigate } from 'react-router-dom';
import { getUser } from '../../utils/auth';

/**
 * ProtectedRoute Component
 * 
 * Wraps routes to ensure only authenticated users with the correct role can access them.
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 * @param {string[]} allowedRoles - Array of roles that can access this route
 * @returns {React.ReactNode} - Children if authorized, redirect otherwise
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  let user = null;
  
  try {
    user = getUser();
  } catch (error) {
    console.error('Error reading user data:', error);
    // If there's an error parsing user data, treat as not authenticated
    return <Navigate to="/login" replace />;
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the correct role
  return children;
}
