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