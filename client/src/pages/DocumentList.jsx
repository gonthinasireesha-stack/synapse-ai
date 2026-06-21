// src/pages/DocumentList.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listDocuments, deleteDocument } from '../api/documentApi.js';

export function DocumentList() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      setError('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;

    setDeletingId(id);
    try {
      await deleteDocument(id);
      // Update local state directly instead of re-fetching the whole
      // list — avoids an unnecessary network round-trip for something
      // we already know the outcome of.
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
                  Status: {doc.status} · Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                style={{ color: 'crimson' }}
              >
                {deletingId === doc.id ? 'Deleting...' : 'Delete'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}