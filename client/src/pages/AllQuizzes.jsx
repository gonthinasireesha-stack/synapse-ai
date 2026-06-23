// src/pages/AllQuizzes.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listAllQuizzes } from '../api/notesQuizApi.js';

export function AllQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetch() {
      try {
        const data = await listAllQuizzes();
        setQuizzes(data);
      } catch { setError('Failed to load quizzes'); }
      finally { setIsLoading(false); }
    }
    fetch();
  }, []);

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading quizzes...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>All Quizzes</h1>
        <Link to="/dashboard/documents" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          + Generate quiz for a document
        </Link>
      </div>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {quizzes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧪</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No quizzes yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Go to a document and generate a quiz to see it here</p>
          <Link to="/dashboard/documents" style={{ background: 'var(--accent)', color: 'var(--bg-primary)', padding: '0.625rem 1.5rem', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.875rem' }}>
            Go to Documents
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {quizzes.map(quiz => (
            <div
              key={quiz.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1rem 1.25rem',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {quiz.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--accent)' }}>{quiz.documentTitle}</span>
                  {' · '}{quiz.question_count} questions
                  {' · '}{new Date(quiz.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => navigate(`/dashboard/quiz/${quiz.id}`)}
                style={{
                  background: 'var(--accent)', color: 'var(--bg-primary)',
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius)',
                  fontWeight: 600, fontSize: '0.8rem', border: 'none', cursor: 'pointer',
                }}
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}