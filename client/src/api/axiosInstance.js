// src/api/axiosInstance.js
//
// WHY THIS FILE EXISTS:
// A single, pre-configured axios instance used by the ENTIRE app.
// Centralizes: base URL, attaching the access token to every request,
// and the trickiest part — automatically refreshing an expired access
// token and retrying the original request, transparently, so components
// never have to think about token expiry at all.

import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send the httpOnly refresh cookie on requests to our API
});

// In-memory access token storage. NOT localStorage, NOT a cookie —
// just a module-level variable. This matches our design decision:
// the access token never touches persisted/disk-backed storage,
// so it's invisible to anything that could read localStorage via XSS.
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// ---- REQUEST INTERCEPTOR ----
// Runs before every outgoing request. Attaches the access token if we
// have one — so individual API call functions never need to do this.
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ---- RESPONSE INTERCEPTOR ----
// This is the important one: if a request fails with 401 TOKEN_EXPIRED,
// we transparently call /auth/refresh, get a new access token, retry
// the ORIGINAL request once, and return that result — the calling
// component never even sees the 401, it just looks like the request
// took slightly longer.
let refreshPromise = null; // prevents multiple simultaneous refresh calls (see explanation below)

api.interceptors.response.use(
  (response) => response, // pass successful responses straight through
  async (error) => {
    const originalRequest = error.config;
    const errorCode = error.response?.data?.error?.code;

    // Only attempt refresh-and-retry once per request (the _retry flag
    // prevents an infinite loop if the refresh itself somehow keeps failing)
    // and only for the specific TOKEN_EXPIRED case — NOT for INVALID_TOKEN
    // or NO_TOKEN, where retrying would be pointless (the user genuinely
    // needs to log in again).
    if (errorCode === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // If a refresh is already in-flight (e.g. two requests failed at
        // the same moment), reuse the SAME promise instead of firing two
        // parallel refresh calls — that would create a race condition
        // and unnecessary load.
        if (!refreshPromise) {
          refreshPromise = api.post('/auth/refresh').finally(() => {
            refreshPromise = null;
          });
        }

        const refreshResponse = await refreshPromise;
        const newAccessToken = refreshResponse.data.data.accessToken;
        setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest); // retry the original request, once
      } catch (refreshError) {
        // Refresh itself failed (refresh token expired/revoked too) —
        // genuinely need to log in again. Clear state and let the error
        // propagate; AuthContext will handle redirecting to /login.
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
