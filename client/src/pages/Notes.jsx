// src/pages/Notes.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { generateNotes, listNotes } from '../api/notesQuizApi.js';

// Simple markdown renderer — converts our structured notes markdown
// to readable HTML without needing a full markdown library.
// Handles: ## headers, **bold**, bullet points, and line breaks.
function SimpleMarkdown({ content }) {
  const lines = content.split('\n');
  return (
    <div style={{ lineHeight: 1.7 }}>
      {lines.map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>{line.slice(3)}</h2>;
        }
        if (line.startsWith('* ') || line.startsWith('- ')) {
          const text = line.slice(2).replace(/\*\*(.*?)\*\*/g, '$1');
          return <li key={i} style={{ marginBottom: '0.25rem' }}>{text}</li>;
        }
        if (line.trim() === '') return <br key={i} />;
        const text = line.replace(/\*\*(.*?)\*\*/g, '$1');
        return <p key={i} style={{ margin: '0.25rem 0' }}>{text}</p>;
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

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Study Notes</h1>
        <button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating... (this may take 10-20s)' : '+ Generate Notes'}
        </button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {notes.length === 0 ? (
        <p style={{ color: '#666' }}>No notes yet. Generate your first set of notes above.</p>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ width: 200, flexShrink: 0 }}>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>Previous notes:</p>
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => setActiveNoteId(note.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '0.5rem', marginBottom: '0.25rem',
                  background: note.id === activeNoteId ? '#e8f4fd' : 'transparent',
                  border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                {new Date(note.created_at).toLocaleDateString()}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, borderLeft: '1px solid #ddd', paddingLeft: '1rem' }}>
            {activeNote && <SimpleMarkdown content={activeNote.content} />}
          </div>
        </div>
      )}
    </div>
  );
}