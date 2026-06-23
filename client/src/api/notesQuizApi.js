// src/api/notesQuizApi.js
import { api } from './axiosInstance.js';

export async function generateNotes(documentId) {
  const response = await api.post(`/documents/${documentId}/notes`);
  return response.data.data.note;
}

export async function listNotes(documentId) {
  const response = await api.get(`/documents/${documentId}/notes`);
  return response.data.data.notes;
}

export async function generateQuiz(documentId, questionCount = 5) {
  const response = await api.post(`/documents/${documentId}/quizzes`, { questionCount });
  return response.data.data.quiz;
}

export async function listQuizzes(documentId) {
  const response = await api.get(`/documents/${documentId}/quizzes`);
  return response.data.data.quizzes;
}

export async function getQuiz(quizId) {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data.data.quiz;
}

export async function submitAttempt(quizId, answers) {
  const response = await api.post(`/quizzes/${quizId}/attempts`, { answers });
  return response.data.data.attempt;
}

// Add to existing notesQuizApi.js

export async function listAllNotes() {
  // We'll fetch all documents first, then notes per document
  const { api } = await import('./axiosInstance.js');
  const docsRes = await api.get('/documents');
  const docs = docsRes.data.data.documents.filter(d => d.status === 'ready');
  
  const allNotes = [];
  for (const doc of docs) {
    const notesRes = await api.get(`/documents/${doc.id}/notes`);
    const notes = notesRes.data.data.notes;
    notes.forEach(n => allNotes.push({ ...n, documentTitle: doc.title, documentId: doc.id }));
  }
  return allNotes;
}

export async function listAllQuizzes() {
  const { api } = await import('./axiosInstance.js');
  const docsRes = await api.get('/documents');
  const docs = docsRes.data.data.documents.filter(d => d.status === 'ready');
  
  const allQuizzes = [];
  for (const doc of docs) {
    const quizzesRes = await api.get(`/documents/${doc.id}/quizzes`);
    const quizzes = quizzesRes.data.data.quizzes;
    quizzes.forEach(q => allQuizzes.push({ ...q, documentTitle: doc.title, documentId: doc.id }));
  }
  return allQuizzes;
}