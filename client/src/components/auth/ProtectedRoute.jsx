import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES } from '../../context/AuthContext';

/**
 * ProtectedRoute component - Handles authentication and role-based access
 * 
 * @param {Object} props
 * @param {JSX.Element} props.children - Component to render if authorized
 * @param {Array<string>} props.allowedRoles - Optional roles allowed to access (e.g., ['admin', 'pro'])
 * @param {boolean} props.adminOnly - Shortcut for allowedRoles=['admin']
 * @param {boolean} props.proOnly - Shortcut for allowedRoles=['pro'] (verified PRO)
 * @param {boolean} props.affiliateOnly - Shortcut for allowedRoles=['affiliate']
 * @param {boolean} props.guestOnly - If true, only non-logged in users can access (e.g., Login/Signup)
 * @param {boolean} props.isPublic - If true, accessible by guests but restricted for admins
 * @returns {JSX.Element}
 */
const ProtectedRoute = ({ children, allowedRoles, adminOnly, proOnly, affiliateOnly, guestOnly, isPublic }) => {
 const { user, loading, isPro, isAdmin, isAffiliate } = useAuth();
 const location = useLocation();

 // Show nothing while checking auth state
 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-black">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 // Map shortcut props to allowedRoles
 let effectiveAllowedRoles = allowedRoles;
 if (adminOnly) effectiveAllowedRoles = [ROLES.ADMIN];
 if (proOnly) effectiveAllowedRoles = [ROLES.PRO];
 if (affiliateOnly) effectiveAllowedRoles = [ROLES.AFFILIATE];

 // REDIRECT ADMINS: Admins should NEVER access storefront or public pages
 const restrictedForAdmin = [
 '/checkout',
 '/dashboard',
 '/become-pro',
 '/games',
 '/offers',
 '/about',
 '/contact',
 '/affiliate',
 '/'
 ];

 if (user && user.role === ROLES.ADMIN) {
 // If it's a known restricted path OR any public page, send admin to dashboard
 // Note: we check prefix for dynamic routes like /offer/:id
 const isOfferDetail = location.pathname.startsWith('/offer/');
 const isVerifyEmail = location.pathname.startsWith('/verify-email/');

 if (restrictedForAdmin.includes(location.pathname) || isPublic || guestOnly || isOfferDetail || isVerifyEmail) {
 return <Navigate to="/admin" replace />;
 }
 }

 // Guest only pages (Login/Signup) - Admins handled above, this handles non-admin users
 if (guestOnly) {
 if (user) {
 return <Navigate to="/dashboard" replace />;
 }
 return children;
 }

 // If it's a public page and NOT an admin, let them through
 if (isPublic) {
 return children;
 }

 // Auth required for all other protected routes
 if (!user) {
 return <Navigate to="/login" state={{ from: location }} replace />;
 }

 // Admin only pages
 if (adminOnly && user.role !== ROLES.ADMIN) {
 return <Navigate to="/" replace />;
 }

  // PRO only pages (must be verified) - Also allowed for Admins
  if (proOnly && user.role !== ROLES.ADMIN && (user.role !== ROLES.PRO || user.proStatus !== 'approved')) {
    return <Navigate to="/become-pro" replace />;
  }

  // Affiliate only pages - Also allowed for Admins
  if (affiliateOnly && user.role !== ROLES.ADMIN && user.role !== ROLES.AFFILIATE) {
    return <Navigate to="/affiliate" replace />;
  }

 // Specific role access
 if (effectiveAllowedRoles && !effectiveAllowedRoles.includes(user.role)) {
 return <Navigate to="/" replace />;
 }

 return children;
};

export default ProtectedRoute;
