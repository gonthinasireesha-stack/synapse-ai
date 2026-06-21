// src/pages/UploadDocument.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocument } from '../api/documentApi.js';

const MAX_FILE_SIZE_MB = 20; // mirrors the backend's MAX_FILE_SIZE_MB — UX-only check, server enforces the real limit

export function UploadDocument() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files[0];
    setError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Client-side checks for instant feedback — NOT a substitute for the
    // server's fileFilter/limits, which remain the real enforcement.
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a PDF file first');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      await uploadDocument({ file: selectedFile, title: title.trim() || undefined });
      navigate('/dashboard/documents', { replace: true });
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui' }}>
      <h1>Upload a PDF</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '0.25rem' }}>
            Title <span style={{ color: '#666', fontWeight: 'normal' }}>(optional)</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Defaults to the file name"
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="file" style={{ display: 'block', marginBottom: '0.25rem' }}>PDF file</label>
          <input
            id="file"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ width: '100%' }}
          />
          {selectedFile && (
            <small style={{ color: '#666' }}>
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </small>
          )}
        </div>

        {error && (
          <p role="alert" style={{ color: 'crimson', marginBottom: '1rem' }}>{error}</p>
        )}

        <button type="submit" disabled={isUploading || !selectedFile} style={{ width: '100%', padding: '0.75rem' }}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}