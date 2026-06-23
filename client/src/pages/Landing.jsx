// src/pages/Landing.jsx
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '💬', title: 'Chat with your PDF', desc: 'Ask any question and get answers grounded strictly in your document — no hallucination, no guesswork.' },
  { icon: '📝', title: 'Generate study notes', desc: 'Instantly distill a dense PDF into structured, scannable study notes organized by key concepts.' },
  { icon: '🧪', title: 'Self-test with quizzes', desc: 'Auto-generate MCQs from your document and track what you know versus what you still need to study.' },
  { icon: '🔍', title: 'Semantic search', desc: 'Powered by vector embeddings and pgvector — finds relevant content by meaning, not just keyword matching.' },
];

export function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1.25rem 3rem', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <img src="/logo.png" alt="Synapse AI" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-soft)', letterSpacing: '0.08em' }}>
            SYNAPSE AI
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
            Log in
          </Link>
          <Link
            to="/signup"
            style={{
              background: 'var(--accent)', color: 'var(--bg-primary)',
              padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)',
              fontWeight: 600, fontSize: '0.875rem',
            }}
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '6rem 2rem 4rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--accent-glow)', border: '1px solid var(--accent)',
            borderRadius: 20, padding: '0.3rem 0.875rem',
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)',
            marginBottom: '1.5rem', letterSpacing: '0.05em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            RAG-POWERED STUDY ASSISTANT
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700,
            lineHeight: 1.15, marginBottom: '1.25rem',
            color: 'var(--text-primary)',
          }}>
            Your PDFs,{' '}
            <span style={{ color: 'var(--accent)' }}>finally</span>{' '}
            answering your questions
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 480 }}>
            Upload any document. Chat with it, generate structured notes, and quiz yourself — all grounded in what your document actually says, never fabricated.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/signup"
              style={{
                background: 'var(--accent)', color: 'var(--bg-primary)',
                padding: '0.75rem 2rem', borderRadius: 'var(--radius)',
                fontWeight: 700, fontSize: '1rem',
              }}
            >
              Start studying smarter
            </Link>
            <Link
              to="/login"
              style={{
                background: 'transparent', color: 'var(--text-primary)',
                padding: '0.75rem 2rem', borderRadius: 'var(--radius)',
                fontWeight: 600, fontSize: '1rem',
                border: '1px solid var(--border)',
              }}
            >
              Log in
            </Link>
          </div>
        </div>

        {/* Hero visual — logo node graph */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: '-40px',
              background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)',
              borderRadius: '50%',
            }} />
            <img
              src="/logo.png"
              alt="Synapse AI neural network"
              style={{
                width: 280, height: 280, objectFit: 'contain',
                position: 'relative', zIndex: 1,
                filter: 'drop-shadow(0 0 40px rgba(196,132,138,0.3))',
                animation: 'float 4s ease-in-out infinite',
              }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 6rem' }}>
        <h2 style={{
          textAlign: 'center', fontSize: '1.75rem', fontWeight: 700,
          marginBottom: '0.5rem', color: 'var(--text-primary)',
        }}>
          Everything you need to learn deeply
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Powered by Google Gemini + pgvector — built from scratch, not wrapped in an API.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: '1.75rem',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '2rem 3rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'var(--text-secondary)', fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" alt="" style={{ width: 20, height: 20, objectFit: 'contain' }} />
          <span>Synapse AI</span>
        </div>
        <span>Built with React, Node.js, PostgreSQL + pgvector, Google Gemini</span>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}