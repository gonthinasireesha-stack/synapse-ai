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

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'var(--bg-primary)',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Left panel — branding */}
      <div style={{
        width: '45%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '3rem',
      }}>
        <img src="/logo.png" alt="Synapse AI" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: '1.5rem' }} />
        <div style={{ fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent-soft)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          SYNAPSE AI
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 280, lineHeight: 1.7 }}>
          Your second brain for learning. Upload PDFs, chat with them, generate notes and quizzes.
        </div>

        {/* Feature list */}
        <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: 280 }}>
          {[
            { icon: '💬', text: 'Chat with your PDFs' },
            { icon: '📝', text: 'Auto-generate study notes' },
            { icon: '🧪', text: 'Self-test with AI quizzes' },
            { icon: '🔍', text: 'Semantic search via pgvector' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '3rem',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Log in to continue studying smarter
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)', fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text-primary)', fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            {error && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
                background: 'rgba(196,112,112,0.1)', border: '1px solid var(--danger)',
                color: 'var(--danger)', fontSize: '0.85rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%', padding: '0.875rem',
                background: 'var(--accent)', color: 'var(--bg-primary)',
                border: 'none', borderRadius: 'var(--radius)',
                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                marginTop: '0.5rem',
                transition: 'opacity 0.15s',
              }}
            >
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>
              Sign up free
            </Link>
          </p>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link to="/" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}