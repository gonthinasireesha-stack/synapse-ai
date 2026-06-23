// src/pages/Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/axiosInstance.js';

export function Chat() {
  const { documentId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load document info + existing sessions on mount
  useEffect(() => {
    async function initialize() {
      try {
        const docRes = await api.get(`/documents/${documentId}`);
        setDocTitle(docRes.data.data.document.title);

        const sessionsRes = await api.get(`/documents/${documentId}/chat-sessions`);
        const existingSessions = sessionsRes.data.data.sessions;
        setSessions(existingSessions);

        if (existingSessions.length > 0) {
          // Load the most recent session automatically
          const latest = existingSessions[0];
          setActiveSessionId(latest.id);
          const msgsRes = await api.get(`/chat-sessions/${latest.id}/messages`);
          setMessages(msgsRes.data.data.messages);
        }
      } catch (err) {
        setError('Failed to load chat');
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, [documentId]);

  async function handleNewSession() {
    try {
      const res = await api.post(`/documents/${documentId}/chat-sessions`);
      const newSession = res.data.data.session;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create session');
    }
  }

  async function handleSelectSession(sessionId) {
    setActiveSessionId(sessionId);
    try {
      const res = await api.get(`/chat-sessions/${sessionId}/messages`);
      setMessages(res.data.data.messages);
    } catch {
      setError('Failed to load messages');
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!question.trim() || !activeSessionId || isSending) return;

    const userQuestion = question.trim();
    setQuestion('');
    setIsSending(true);
    setError(null);

    // Optimistically add user message so UI feels instant
    const optimisticMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userQuestion,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await api.post(`/chat-sessions/${activeSessionId}/messages`, {
        question: userQuestion,
      });
      const assistantMsg = res.data.data.message;
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to get answer');
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading chat...</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Session sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '1rem',
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
          Chat sessions
        </div>
        <button
          onClick={handleNewSession}
          style={{
            background: 'var(--accent)', color: 'var(--bg-primary)',
            padding: '0.5rem', borderRadius: 'var(--radius)',
            fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.75rem',
            cursor: 'pointer',
          }}
        >
          + New chat
        </button>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelectSession(s.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.5rem 0.625rem', marginBottom: '0.25rem',
                borderRadius: 'var(--radius)', fontSize: '0.8rem',
                background: s.id === activeSessionId ? 'var(--accent-glow)' : 'transparent',
                color: s.id === activeSessionId ? 'var(--accent-soft)' : 'var(--text-secondary)',
                borderLeft: s.id === activeSessionId ? '3px solid var(--accent)' : '3px solid transparent',
                cursor: 'pointer', border: 'none',
                transition: 'all 0.15s',
              }}
            >
              {new Date(s.created_at).toLocaleDateString()} {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </button>
          ))}
          {sessions.length === 0 && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              No sessions yet. Start a new chat above.
            </p>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
        }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{docTitle}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Ask anything about this document — answers are grounded in its content only
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!activeSessionId && (
            <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <p>Start a new chat session to ask questions about this document</p>
              <button
                onClick={handleNewSession}
                style={{
                  marginTop: '1rem', background: 'var(--accent)',
                  color: 'var(--bg-primary)', padding: '0.625rem 1.5rem',
                  borderRadius: 'var(--radius)', fontWeight: 600,
                  cursor: 'pointer', border: 'none',
                }}
              >
                Start chatting
              </button>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '75%',
                padding: '0.875rem 1.125rem',
                borderRadius: msg.role === 'user'
                  ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
                  : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                background: msg.role === 'user'
                  ? 'var(--accent)'
                  : 'var(--bg-secondary)',
                color: msg.role === 'user'
                  ? 'var(--bg-primary)'
                  : 'var(--text-primary)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                fontSize: '0.9rem', lineHeight: 1.6,
              }}>
                {msg.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                padding: '0.875rem 1.125rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                color: 'var(--text-secondary)', fontSize: '0.9rem',
              }}>
                <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                  Thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '0.5rem 1.5rem', color: 'var(--danger)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSend}
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            display: 'flex', gap: '0.75rem',
          }}
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={activeSessionId ? 'Ask a question about this document...' : 'Start a new chat session first'}
            disabled={!activeSessionId || isSending}
            style={{
              flex: 1, padding: '0.75rem 1rem',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text-primary)', fontSize: '0.9rem',
            }}
          />
          <button
            type="submit"
            disabled={!activeSessionId || isSending || !question.trim()}
            style={{
              background: 'var(--accent)', color: 'var(--bg-primary)',
              padding: '0.75rem 1.5rem', borderRadius: 'var(--radius)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              opacity: (!activeSessionId || isSending || !question.trim()) ? 0.5 : 1,
            }}
          >
            {isSending ? '...' : 'Send'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}