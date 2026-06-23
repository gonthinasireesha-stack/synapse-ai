// src/pages/Notes.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateNotes, listNotes } from '../api/notesQuizApi.js';

function SimpleMarkdown({ content }) {
  const lines = content.split('\n');
  return (
    <div style={{ lineHeight: 1.8, color: 'var(--text-primary)' }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return (
            <h2 key={i} style={{ marginTop: '1.8rem', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent)' }}>
              {line.slice(3)}
            </h2>
          );
        }
        if (line.startsWith('* ') || line.startsWith('- ')) {
          return (
            <li key={i} style={{ marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
              {line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')}
            </li>
          );
        }
        if (line.trim() === '') return <br key={i} />;
        return (
          <p key={i} style={{ margin: '0.6rem 0', color: 'var(--text-primary)' }}>
            {line.replace(/\*\*(.*?)\*\*/g, '$1')}
          </p>
        );
      })}
    </div>
  );
}

export function Notes() {
  const { documentId } = useParams();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const data = await listNotes(documentId);
        setNotes(data);
        if (data.length > 0) setActiveNoteId(data[0].id);
      } catch {
        setError('Failed to load notes');
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotes();
  }, [documentId]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    try {
      const newNote = await generateNotes(documentId);
      setNotes((prev) => [newNote, ...prev]);
      setActiveNoteId(newNote.id);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate notes');
    } finally {
      setIsGenerating(false);
    }
  }

  const activeNote = notes.find((n) => n.id === activeNoteId);

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 1250, margin: '2rem auto', padding: '0 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.3rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Study Notes
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            Generate structured notes from your PDF
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            border: 'none', borderRadius: 14, padding: '14px 22px',
            background: 'var(--accent)', color: 'var(--bg-primary)',
            fontWeight: 700, fontSize: '.95rem', cursor: 'pointer',
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? 'Generating...' : '+ Generate Notes'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '14px', borderRadius: 12, marginBottom: '1rem',
          border: '1px solid var(--danger)', background: 'rgba(196,112,112,0.1)',
          color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      {/* Empty State */}
      {notes.length === 0 ? (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 24, padding: '5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h2 style={{ color: 'var(--text-primary)' }}>No notes yet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Generate your first notes above.</p>
        </div>
      ) : (
        <div style={{
          display: 'flex', gap: '1.25rem',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 24, padding: '2rem',
          boxShadow: '0 0 35px var(--accent-glow)',
        }}>
          {/* Previous Notes list */}
          <div style={{ width: 180, minWidth: 180, flexShrink: 0 }}>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '.9rem', marginBottom: '1rem' }}>
              Previous Notes
            </p>
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '12px', marginBottom: '10px', borderRadius: 14,
                  cursor: 'pointer', color: 'var(--text-primary)',
                  background: note.id === activeNoteId ? 'var(--accent-glow)' : 'transparent',
                  border: note.id === activeNoteId ? '1px solid var(--accent)' : '1px solid var(--border)',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '.9rem' }}>
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '.72rem', marginTop: 4 }}>
                  {new Date(note.created_at).toLocaleTimeString()}
                </div>
              </button>
            ))}
          </div>

          {/* Note Content */}
          <div style={{
            flexGrow: 1, minWidth: 0,
            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '2rem', overflowY: 'auto',
          }}>
            {activeNote
              ? <SimpleMarkdown content={activeNote.content} />
              : <p style={{ color: 'var(--text-secondary)' }}>Select a note to read it</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}