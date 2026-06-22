// src/controllers/notesQuizController.js

import * as notesQuizService from '../services/notesQuizService.js';

export async function generateNotes(req, res, next) {
  try {
    const note = await notesQuizService.generateNotes(req.params.documentId, req.user.id);
    res.status(201).json({ success: true, data: { note } });
  } catch (err) {
    next(err);
  }
}

export async function listNotes(req, res, next) {
  try {
    const notes = await notesQuizService.listNotes(req.params.documentId, req.user.id);
    res.status(200).json({ success: true, data: { notes } });
  } catch (err) {
    next(err);
  }
}

export async function generateQuiz(req, res, next) {
  try {
    const quiz = await notesQuizService.generateQuiz(
      req.params.documentId,
      req.user.id,
      req.body.questionCount
    );
    res.status(201).json({ success: true, data: { quiz } });
  } catch (err) {
    next(err);
  }
}

export async function listQuizzes(req, res, next) {
  try {
    const quizzes = await notesQuizService.listQuizzes(req.params.documentId, req.user.id);
    res.status(200).json({ success: true, data: { quizzes } });
  } catch (err) {
    next(err);
  }
}

export async function getQuiz(req, res, next) {
  try {
    const quiz = await notesQuizService.getQuiz(req.params.quizId, req.user.id);
    res.status(200).json({ success: true, data: { quiz } });
  } catch (err) {
    next(err);
  }
}

export async function submitAttempt(req, res, next) {
  try {
    const result = await notesQuizService.submitQuizAttempt(
      req.params.quizId,
      req.user.id,
      req.body.answers
    );
    res.status(201).json({ success: true, data: { attempt: result } });
  } catch (err) {
    next(err);
  }
}