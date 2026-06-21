// src/context/AuthContext.jsx
//
// WHY REACT CONTEXT HERE:
// Auth state (current user, whether we're logged in) is needed in many
// places across the app — the navbar, protected routes, the dashboard.
// Without Context, we'd have to pass this data down through props at
// every level ("prop drilling"), which gets unmanageable fast. Context
// lets ANY component, at ANY depth, read auth state directly.

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setAccessToken, getAccessToken } from '../api/axiosInstance.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until we've checked for an existing session

  // On app load (e.g. a hard page refresh), the access token in memory
  // is GONE — that's expected, since we deliberately never persisted it.
  // So we attempt a silent refresh using the httpOnly cookie (which DID
  // survive the refresh) to recover the session without forcing a
  // re-login every time the user reloads the page.
  useEffect(() => {
    async function tryRestoreSession() {
      try {
        const refreshResponse = await api.post('/auth/refresh');
        const newAccessToken = refreshResponse.data.data.accessToken;
        setAccessToken(newAccessToken);

        const meResponse = await api.get('/auth/me');
        setUser(meResponse.data.data.user);
      } catch {
        // No valid refresh cookie exists (never logged in, or it expired/
        // was revoked) — this is a NORMAL outcome, not an error to surface.
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    tryRestoreSession();
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    const response = await api.post('/auth/signup', { name, email, password });
    const { user: newUser, accessToken } = response.data.data;
    setAccessToken(accessToken);
    setUser(newUser);
    return newUser;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const response = await api.post('/auth/login', { email, password });
    const { user: loggedInUser, accessToken } = response.data.data;
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear local state regardless of whether the server call succeeded —
      // if the network fails mid-logout, the user should still appear
      // logged out on THIS device, even if the server-side token wasn't
      // revoked. (Edge case worth knowing, discussed below.)
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for consuming the context — components call useAuth()
// instead of useContext(AuthContext) directly. This also lets us throw
// a clear error if someone forgets to wrap their app in <AuthProvider>,
// instead of a confusing "Cannot read property of null" deep in some
// component.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}