import ProtectedRoute from './ProtectedRoute';

/**
 * AdminRoute Component
 * 
 * Convenience wrapper for routes that require admin role.
 * Only users with role='admin' can access.
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 */
export function AdminRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * SellerRoute Component
 * 
 * Convenience wrapper for routes that require seller role.
 * Only users with role='seller' can access.
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 */
export function SellerRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['seller']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * ConsumerRoute Component
 * 
 * Convenience wrapper for routes that require consumer role.
 * Only users with role='consumer' can access.
 * 
 * @param {React.ReactNode} children - The component to render if authorized
 */
export function ConsumerRoute({ children }) {
  return (
    <ProtectedRoute allowedRoles={['consumer']}>
      {children}
    </ProtectedRoute>
  );
}
