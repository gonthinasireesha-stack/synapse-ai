// src/api/documentApi.js
//
// WHY A SEPARATE FILE PER RESOURCE:
// Mirrors the backend's resource-based organization. Components import
// from here instead of calling `api.post(...)` directly — if an
// endpoint URL or request shape ever changes, there's exactly one place
// to update, and components don't need to know HTTP details at all.

import { api } from './axiosInstance.js';
export async function uploadDocument({ file, title }) {
  const formData = new FormData();
  formData.append('file', file);
  if (title) {
    formData.append('title', title);
  }

  // Deliberately NOT setting Content-Type manually — axios/the browser
  // auto-generates it with the correct multipart boundary when given a
  // FormData object. Setting it manually risks a missing/incorrect
  // boundary, which would break the upload.
  const response = await api.post('/documents', formData);
  return response.data.data.document;
}
export async function listDocuments() {
  const response = await api.get('/documents');
  return response.data.data.documents;
}

export async function getDocument(id) {
  const response = await api.get(`/documents/${id}`);
  return response.data.data.document;
}

export async function deleteDocument(id) {
  const response = await api.delete(`/documents/${id}`);
  return response.data.data;
}