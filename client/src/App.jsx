// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { Landing } from './pages/Landing.jsx';
import { Login } from './pages/Login.jsx';
import { Signup } from './pages/Signup.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { UploadDocument } from './pages/UploadDocument.jsx';
import { DocumentList } from './pages/DocumentList.jsx';
import { Notes } from './pages/Notes.jsx';
import { QuizList, QuizTaker } from './pages/Quiz.jsx';
import { Chat } from './pages/Chat.jsx';
// Add imports
import { AllNotes } from './pages/AllNotes.jsx';
import { AllQuizzes } from './pages/AllQuizzes.jsx';

function AppShell() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1, minHeight: '100vh',
        background: 'var(--bg-primary)',
        transition: 'margin-left 0.2s ease',
      }}>
        <Outlet />
      </main>
    </div>
  );
}

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<RootRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/documents" element={<DocumentList />} />
                <Route path="/dashboard/upload" element={<UploadDocument />} />
                <Route path="/dashboard/documents/:documentId/notes" element={<Notes />} />
                <Route path="/dashboard/documents/:documentId/quizzes" element={<QuizList />} />
                <Route path="/dashboard/documents/:documentId/chat" element={<Chat />} />
                <Route path="/dashboard/quiz/:quizId" element={<QuizTaker />} />
              </Route>
              <Route path="/dashboard/notes" element={<AllNotes />} />
<Route path="/dashboard/quizzes" element={<AllQuizzes />} />
<Route path="/dashboard/chat" element={<DocumentList />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;