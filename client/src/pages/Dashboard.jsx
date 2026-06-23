// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/axiosInstance.js';

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: `${color}22`, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: '1.75rem', fontWeight: 700,
          color: 'var(--text-primary)', lineHeight: 1,
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          {value ?? '—'}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const docsRes = await api.get('/documents');
        const docs = docsRes.data.data.documents;
        setRecentDocs(docs.slice(0, 3));
        setStats({
          documents: docs.length,
          ready: docs.filter((d) => d.status === 'ready').length,
        });
      } catch { /* fail silently on dashboard */ }
    }
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding: '2rem', maxWidth: 900 }}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '2rem',
        marginBottom: '2rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          width: 160, height: 160, opacity: 0.06,
          backgroundImage: 'url(/logo.png)',
          backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          {greeting}
        </p>
       <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--accent-soft)', marginBottom: '0.5rem' }}>
  {user?.name ? `${user.name} 👋` : '👋'}
</h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 480 }}>
          Upload a PDF to start chatting with your study material, generating notes, and testing yourself with quizzes.
        </p>
        <Link
          to="/dashboard/documents"
          style={{
            display: 'inline-block', marginTop: '1rem',
            background: 'var(--accent)', color: 'var(--bg-primary)',
            padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)',
            fontWeight: 600, fontSize: '0.875rem',
          }}
        >
          Go to Documents →
        </Link>
      </div>

      {/* Stat cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        <StatCard icon="📄" label="Total documents" value={stats?.documents} color="var(--accent)" />
        <StatCard icon="✅" label="Ready to chat" value={stats?.ready} color="var(--success)" />
        <StatCard icon="🧠" label="AI-powered" value="RAG" color="var(--warning)" />
        <StatCard icon="⚡" label="Embeddings" value="pgvector" color="var(--text-secondary)" />
      </div>

      {/* Recent documents */}
      {recentDocs.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Recent Documents
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {recentDocs.map((doc) => (
              <Link
                key={doc.id}
                to={`/dashboard/documents/${doc.id}/notes`}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', padding: '0.875rem 1rem',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', color: 'var(--text-primary)',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ fontWeight: 500 }}>{doc.title}</span>
                <span style={{
                  fontSize: '0.75rem', padding: '0.2rem 0.6rem',
                  borderRadius: 12, fontWeight: 600,
                  background: doc.status === 'ready' ? 'rgba(126,184,154,0.15)' : 'rgba(196,132,138,0.15)',
                  color: doc.status === 'ready' ? 'var(--success)' : 'var(--accent)',
                }}>
                  {doc.status}
                </span>
              </Link>
            ))}
          </div>
          <Link to="/dashboard/documents" style={{ display: 'block', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            View all documents →
          </Link>
        </div>
      )}

      {recentDocs.length === 0 && stats !== null && (
        <div style={{
          textAlign: 'center', padding: '3rem',
          border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>No documents yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Upload your first PDF to get started</p>
          <Link
            to="/dashboard/upload"
            style={{
              background: 'var(--accent)', color: 'var(--bg-primary)',
              padding: '0.625rem 1.5rem', borderRadius: 'var(--radius)',
              fontWeight: 600, fontSize: '0.875rem',
            }}
          >
            Upload a PDF
          </Link>
        </div>
      )}
    </div>
  );
}