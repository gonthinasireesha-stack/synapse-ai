// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recover "where the user was trying to go" set by ProtectedRoute,
  // so login sends them back there instead of always to a fixed page.
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser's default full-page-reload form submission
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Our backend's error envelope: { success: false, error: { code, message } }
      const message = err.response?.data?.error?.message || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '4rem auto', padding: '0 1rem', fontFamily: 'system-ui' }}>
      <h1>Log in to Synapse AI</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.25rem' }}>Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.25rem' }}>Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        {error && (
          <p role="alert" style={{ color: 'crimson', marginBottom: '1rem' }}>{error}</p>
        )}

        <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '0.75rem' }}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>

      <p style={{ marginTop: '1rem' }}>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}