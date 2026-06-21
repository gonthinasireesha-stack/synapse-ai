// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';

// Temporary placeholder — real Dashboard page comes in Phase 6.
// Exists for now purely to prove protected routing + logout work end to end.
function DashboardPlaceholder() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    // No explicit navigate() needed here — ProtectedRoute will
    // automatically redirect to /login on the next render, since
    // isAuthenticated becomes false the moment user state clears.
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}. You are authenticated — this page is protected.</p>
      <button onClick={handleLogout}>Log out</button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Everything nested inside this route requires authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPlaceholder />} />
          </Route>

          {/* Root path always redirects to /dashboard, which itself
              redirects to /login if the user isn't authenticated */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;