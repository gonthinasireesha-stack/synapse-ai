// src/pages/DocumentList.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { listDocuments, deleteDocument } from '../api/documentApi.js';

const POLL_INTERVAL_MS = 3000; // check every 3 seconds while something is processing

export function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Tracks the interval timer ID so we can clear it on unmount or when
  // polling is no longer needed — without this, the interval would keep
  // firing forever, even after the user navigates away from this page,
  // causing a real memory leak / wasted network calls.
  const pollIntervalRef = useRef(null);

  const fetchDocuments = useCallback(async (isPollingRefresh = false) => {
    // Only show the full-page "Loading..." state on the FIRST load —
    // a background poll refresh shouldn't visibly disrupt the UI.
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

  // Initial load on mount.
  useEffect(() => {
    fetchDocuments(false);
  }, [fetchDocuments]);

  // Polling effect: runs whenever `documents` changes, checks if
  // anything is still 'processing', and starts/stops an interval
  // accordingly.
  useEffect(() => {
    const hasProcessingDocs = documents.some((doc) => doc.status === 'processing');

    if (hasProcessingDocs && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(() => {
        fetchDocuments(true);
      }, POLL_INTERVAL_MS);
    }

    if (!hasProcessingDocs && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Cleanup: ALWAYS clear the interval when this component unmounts
    // (e.g. user navigates to a different page) — otherwise the timer
    // keeps running in the background indefinitely, calling
    // fetchDocuments on a component that no longer exists.
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

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading documents...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Your Documents</h1>
        <Link to="/dashboard/upload">+ Upload PDF</Link>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {documents.length === 0 ? (
        <p style={{ color: '#666' }}>No documents yet. Upload your first PDF to get started.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {documents.map((doc) => (
            <li
              key={doc.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                borderBottom: '1px solid #ddd',
              }}
            >
              <div>
                <strong>{doc.title}</strong>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  Status: <StatusBadge status={doc.status} /> · Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                style={{ color: 'crimson' }}
              >
                {deletingId === doc.id ? 'Deleting...' : 'Delete'}
              </button>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
  <Link to={`/dashboard/documents/${doc.id}/notes`}>Notes</Link>
  <Link to={`/dashboard/documents/${doc.id}/quizzes`}>Quiz</Link>
  <button
    onClick={() => handleDelete(doc.id)}
    disabled={deletingId === doc.id}
    style={{ color: 'crimson' }}
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

function StatusBadge({ status }) {
  const colors = {
    processing: '#b8860b',
    ready: '#2e7d32',
    failed: '#c62828',
  };
  return <span style={{ color: colors[status] || '#666', fontWeight: 600 }}>{status}</span>;
}