// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';
import { UploadDocument } from './pages/UploadDocument.jsx';
import { DocumentList } from './pages/DocumentList.jsx';

// Shared layout for everything under /dashboard — a simple nav bar plus
// whichever nested page actually matched (rendered via <Outlet />).
// This is a DIFFERENT use of nesting than ProtectedRoute's auth check —
// this one is purely about shared UI (the nav), not access control.
function DashboardLayout() {
  const { user, logout } = useAuth();
  return (
    <div style={{ fontFamily: 'system-ui' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        borderBottom: '1px solid #ddd',
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <strong>Synapse AI</strong>
          <Link to="/dashboard/documents">Documents</Link>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#666' }}>{user?.name}</span>
          <button onClick={logout}>Log out</button>
        </div>
      </nav>
      <Outlet />
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

          {/* ProtectedRoute checks auth; DashboardLayout provides shared
              nav UI for everything inside. Two levels of nesting, two
              different responsibilities. */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard/documents" element={<DocumentList />} />
              <Route path="/dashboard/upload" element={<UploadDocument />} />
              {/* /dashboard itself redirects to the documents list */}
              <Route path="/dashboard" element={<Navigate to="/dashboard/documents" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;