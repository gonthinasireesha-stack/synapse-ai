// src/pages/AllNotes.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listAllNotes } from '../api/notesQuizApi.js';

function SimpleMarkdown({ content }) {
  const lines = content.split('\n');
  return (
    <div style={{ lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) return <h2 key={i} style={{ marginTop: '1.25rem', marginBottom: '0.4rem', fontSize: '1rem', color: 'var(--accent-soft)' }}>{line.slice(3)}</h2>;
        if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} style={{ marginBottom: '0.2rem', marginLeft: '1rem', color: 'var(--text-primary)' }}>{line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}</li>;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} style={{ margin: '0.2rem 0', color: 'var(--text-primary)' }}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}</p>;
      })}
    </div>
  );
}

export function AllNotes() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await listAllNotes();
        setNotes(data);
        if (data.length > 0) setActiveNoteId(data[0].id);
      } catch { setError('Failed to load notes'); }
      finally { setIsLoading(false); }
    }
    fetch();
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId);

  if (isLoading) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading notes...</div>;

  return (
    <div style={{ padding: '2rem', height: 'calc(100vh - 0px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>All Notes</h1>
        <Link to="/dashboard/documents" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          + Generate notes for a document
        </Link>
      </div>

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      {notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No notes yet</h3>
          <p style={{ marginBottom: '1.5rem' }}>Go to a document and generate notes to see them here</p>
          <Link to="/dashboard/documents" style={{ background: 'var(--accent)', color: 'var(--bg-primary)', padding: '0.625rem 1.5rem', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '0.875rem' }}>
            Go to Documents
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflow: 'hidden' }}>
          {/* Notes list sidebar */}
          <div style={{ width: 220, flexShrink: 0, overflowY: 'auto' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {notes.length} note{notes.length !== 1 ? 's' : ''}
            </div>
            {notes.map(note => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.625rem 0.75rem', marginBottom: '0.375rem',
                  borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
                  background: note.id === activeNoteId ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                  borderLeft: note.id === activeNoteId ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: note.id === activeNoteId ? 'var(--accent-soft)' : 'var(--text-primary)', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {note.documentTitle}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>

          {/* Note content */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', border: '1px solid var(--border)' }}>
            {activeNote ? (
              <>
                <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    From: <span style={{ color: 'var(--accent)' }}>{activeNote.documentTitle}</span>
                    {' · '}{new Date(activeNote.created_at).toLocaleDateString()}
                  </div>
                </div>
                <SimpleMarkdown content={activeNote.content} />
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>Select a note to read it</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}