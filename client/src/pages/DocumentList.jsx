// src/pages/DocumentList.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listDocuments, deleteDocument } from '../api/documentApi.js';

const POLL_INTERVAL_MS = 3000;

export function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const pollIntervalRef = useRef(null);

  const fetchDocuments = useCallback(async (isPollingRefresh = false) => {
    if (!isPollingRefresh) setIsLoading(true);
    setError(null);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      if (!isPollingRefresh) setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchDocuments(false); }, [fetchDocuments]);

  useEffect(() => {
    const hasProcessingDocs = documents.some((doc) => doc.status === 'processing');
    if (hasProcessingDocs && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(() => fetchDocuments(true), POLL_INTERVAL_MS);
    }
    if (!hasProcessingDocs && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [documents, fetchDocuments]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (err) {
      setError('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading documents...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Your Documents
        </h1>
        <Link
          to="/dashboard/upload"
          style={{
            background: 'var(--accent)', color: 'var(--bg-primary)',
            padding: '0.5rem 1.25rem', borderRadius: 'var(--radius)',
            fontWeight: 600, fontSize: '0.875rem',
          }}
        >
          + Upload PDF
        </Link>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

      {documents.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem',
          border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
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
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {documents.map((doc) => (
            <li
              key={doc.id}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '1rem 1.25rem',
                marginBottom: '0.5rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {doc.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <StatusBadge status={doc.status} />
                  {' · '}
                  Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                {doc.status === 'ready' && (
                  <>
                    <ActionLink to={`/dashboard/documents/${doc.id}/chat`}>Chat</ActionLink>
                    <ActionLink to={`/dashboard/documents/${doc.id}/notes`}>Notes</ActionLink>
                    <ActionLink to={`/dashboard/documents/${doc.id}/quizzes`}>Quiz</ActionLink>
                  </>
                )}
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  style={{
                    fontSize: '0.8rem', padding: '0.375rem 0.875rem',
                    borderRadius: 'var(--radius)', border: '1px solid transparent',
                    color: 'var(--danger)', background: 'transparent',
                    transition: 'all 0.15s', cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(196,112,112,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {deletingId === doc.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Extracted so we don't repeat the same style object 3 times
function ActionLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        fontSize: '0.8rem', padding: '0.375rem 0.875rem',
        borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        color: 'var(--text-secondary)', background: 'transparent',
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.color = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {children}
    </Link>
  );
}

function StatusBadge({ status }) {
  const styles = {
    processing: { color: 'var(--warning)', background: 'rgba(212,165,106,0.1)' },
    ready:      { color: 'var(--success)', background: 'rgba(126,184,154,0.1)' },
    failed:     { color: 'var(--danger)',  background: 'rgba(196,112,112,0.1)' },
  };
  const s = styles[status] || { color: 'var(--text-secondary)', background: 'transparent' };
  return (
    <span style={{ ...s, fontWeight: 600, fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: 10 }}>
      {status}
    </span>
  );
}