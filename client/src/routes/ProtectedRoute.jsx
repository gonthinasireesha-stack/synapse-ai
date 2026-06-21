// src/routes/ProtectedRoute.jsx
//
// WHY THIS COMPONENT EXISTS:
// Wraps any route that requires authentication. Instead of repeating
// "check if logged in, redirect if not" logic inside every protected
// page component, we centralize that check here, once, and any page
// can opt into protection just by being rendered inside this wrapper.

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // While we're still trying to restore a session (the silent /refresh
  // call on app load), we DON'T yet know if the user is really logged
  // in or not. Showing nothing/a spinner here avoids a flash of the
  // login page for users who actually have a valid session.
  if (isLoading) {
    return <div style={{ padding: '2rem' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    // `state={{ from: location }}` remembers where the user was trying
    // to go, so after they log in, we can send them back there instead
    // of always dumping them on a generic default page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Outlet renders whichever nested route actually matched — this
  // component doesn't need to know what page it's protecting.
  return <Outlet />;
}