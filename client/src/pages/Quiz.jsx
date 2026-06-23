// src/pages/Quiz.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateQuiz, listQuizzes, getQuiz, submitAttempt } from '../api/notesQuizApi.js';

export function QuizList() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const data = await listQuizzes(documentId);
        setQuizzes(data);
      } catch {
        setError('Failed to load quizzes');
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuizzes();
  }, [documentId]);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    try {
      const quiz = await generateQuiz(documentId, 5);
      navigate(`/dashboard/quiz/${quiz.id}`);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate quiz');
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '2rem auto', padding: '0 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2.3rem', color: 'var(--text-primary)' }}>Quizzes</h1>
          <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>Generate quizzes from your PDF</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          style={{
            border: 'none', padding: '14px 22px', borderRadius: 14,
            cursor: 'pointer', fontWeight: 700,
            background: 'var(--accent)', color: 'var(--bg-primary)',
            opacity: isGenerating ? 0.7 : 1,
          }}
        >
          {isGenerating ? 'Generating...' : '+ Generate Quiz'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '14px', borderRadius: 12, marginBottom: '1rem',
          border: '1px solid var(--danger)', background: 'rgba(196,112,112,0.1)',
          color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      {quizzes.length === 0 ? (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 24, padding: '5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧪</div>
          <h2 style={{ color: 'var(--text-primary)' }}>No quizzes yet</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Generate your first quiz above.</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 24, overflow: 'hidden',
          boxShadow: '0 0 35px var(--accent-glow)',
        }}>
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '1.5rem', borderBottom: '1px solid var(--border)',
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{quiz.title}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '.85rem', marginTop: 6 }}>
                  {quiz.question_count} questions · {new Date(quiz.created_at).toLocaleDateString()}
                </div>
              </div>
              <button
                onClick={() => navigate(`/dashboard/quiz/${quiz.id}`)}
                style={{
                  border: 'none', padding: '12px 18px', borderRadius: 12,
                  cursor: 'pointer', fontWeight: 700,
                  background: 'var(--accent)', color: 'var(--bg-primary)',
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

export function QuizTaker() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const data = await getQuiz(quizId);
        setQuiz(data);
      } catch {
        setError('Failed to load quiz');
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuiz();
  }, [quizId]);

  function handleAnswer(questionId, option) {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  async function handleSubmit() {
    if (Object.keys(answers).length < quiz.questions.length) {
      setError('Please answer all questions before submitting');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const attempt = await submitAttempt(quizId, answers);
      setResult(attempt);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading quiz...</div>;
  }

  if (error && !quiz) {
    return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error}</div>;
  }

  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    return (
      <div style={{ maxWidth: 900, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>Quiz Complete!</h1>
        <div style={{ fontSize: '4rem', margin: '1rem 0' }}>
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h2 style={{ color: 'var(--text-primary)' }}>
          {result.score} / {result.totalQuestions} correct ({percentage}%)
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job! Review the missed questions.' : 'Keep studying and try again!'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => { setResult(null); setAnswers({}); }}
            style={{
              padding: '14px 20px', border: 'none', borderRadius: 14,
              cursor: 'pointer', background: 'var(--accent)',
              color: 'var(--bg-primary)', fontWeight: 700,
            }}
          >
            Retake Quiz
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '14px 20px', borderRadius: 14, cursor: 'pointer',
              background: 'var(--bg-secondary)', color: 'var(--text-primary)',
              border: '1px solid var(--border)',
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '2rem auto', padding: '0 2rem' }}>
      <h1 style={{ color: 'var(--text-primary)' }}>{quiz.title}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        {quiz.questions.length} questions · Answer all before submitting
      </p>

      {quiz.questions.map((q, i) => (
        <div
          key={q.id}
          style={{
            marginBottom: '2rem', padding: '1.8rem',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 20,
          }}
        >
          <p style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            {i + 1}. {q.question_text}
          </p>
          {['A', 'B', 'C', 'D'].map((option) => (
            <label
              key={option}
              style={{
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '14px', marginBottom: '10px', borderRadius: 12,
                cursor: 'pointer',
                border: answers[q.id] === option ? '1px solid var(--accent)' : '1px solid var(--border)',
                background: answers[q.id] === option ? 'var(--accent-glow)' : 'transparent',
                color: 'var(--text-primary)', transition: 'all 0.15s',
              }}
            >
              <input
                type="radio"
                name={q.id}
                value={option}
                checked={answers[q.id] === option}
                onChange={() => handleAnswer(q.id, option)}
              />
              <span><strong>{option}.</strong> {q.options[option]}</span>
            </label>
          ))}
        </div>
      ))}

      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
        style={{
          width: '100%', padding: '16px', marginBottom: '2rem',
          border: 'none', borderRadius: 16, cursor: 'pointer',
          fontWeight: 700, fontSize: '1rem',
          background: 'var(--accent)', color: 'var(--bg-primary)',
          opacity: (isSubmitting || Object.keys(answers).length < quiz.questions.length) ? 0.6 : 1,
        }}
      >
        {isSubmitting ? 'Submitting...' : `Submit Quiz (${Object.keys(answers).length}/${quiz.questions.length} answered)`}
      </button>
    </div>
  );
}