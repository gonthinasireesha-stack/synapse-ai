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

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Quizzes</h1>
        <button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? 'Generating... (this may take 15-30s)' : '+ Generate Quiz'}
        </button>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {quizzes.length === 0 ? (
        <p style={{ color: '#666' }}>No quizzes yet. Generate your first quiz above.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {quizzes.map((quiz) => (
            <li key={quiz.id} style={{ padding: '0.75rem', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{quiz.title}</strong>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {quiz.question_count} questions · {new Date(quiz.created_at).toLocaleDateString()}
                </div>
              </div>
              <button onClick={() => navigate(`/dashboard/quiz/${quiz.id}`)}>Take Quiz</button>
            </li>
          ))}
        </ul>
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

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading quiz...</div>;
  if (error && !quiz) return <div style={{ padding: '2rem', color: 'crimson' }}>{error}</div>;

  if (result) {
    const percentage = Math.round((result.score / result.totalQuestions) * 100);
    return (
      <div style={{ maxWidth: 600, margin: '4rem auto', padding: '2rem', fontFamily: 'system-ui', textAlign: 'center' }}>
        <h1>Quiz Complete!</h1>
        <div style={{ fontSize: '4rem', margin: '1rem 0' }}>
          {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '📚'}
        </div>
        <h2>{result.score} / {result.totalQuestions} correct ({percentage}%)</h2>
        <p style={{ color: '#666' }}>
          {percentage >= 80 ? 'Excellent work!' : percentage >= 60 ? 'Good job! Review the missed questions.' : 'Keep studying and try again!'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button onClick={() => { setResult(null); setAnswers({}); }}>Retake Quiz</button>
          <button onClick={() => navigate(-1)}>Back to Quizzes</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui' }}>
      <h1>{quiz.title}</h1>
      <p style={{ color: '#666' }}>{quiz.questions.length} questions · Answer all before submitting</p>

      {quiz.questions.map((q, i) => (
        <div key={q.id} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ddd', borderRadius: 8 }}>
          <p style={{ fontWeight: 600, marginBottom: '1rem' }}>{i + 1}. {q.question_text}</p>
          {['A', 'B', 'C', 'D'].map((option) => (
            <label
              key={option}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer',
                borderRadius: 4,
                background: answers[q.id] === option ? '#e8f4fd' : 'transparent',
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

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
        style={{ width: '100%', padding: '0.75rem', marginBottom: '2rem' }}
      >
        {isSubmitting ? 'Submitting...' : `Submit Quiz (${Object.keys(answers).length}/${quiz.questions.length} answered)`}
      </button>
    </div>
  );
}