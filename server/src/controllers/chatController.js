// src/controllers/chatController.js

import * as chatService from '../services/chatService.js';

export async function createSession(req, res, next) {
  try {
    const session = await chatService.startChatSession({
      documentId: req.params.documentId,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: { session } });
  } catch (err) {
    next(err);
  }
}

export async function listSessions(req, res, next) {
  try {
    const sessions = await chatService.listDocumentSessions(req.params.documentId, req.user.id);
    res.status(200).json({ success: true, data: { sessions } });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req, res, next) {
  try {
    const messages = await chatService.getSessionMessages(req.params.sessionId, req.user.id);
    res.status(200).json({ success: true, data: { messages } });
  } catch (err) {
    next(err);
  }
}

export async function postMessage(req, res, next) {
  try {
    const message = await chatService.askQuestion({
      sessionId: req.params.sessionId,
      userId: req.user.id,
      question: req.body.question,
    });
    res.status(201).json({ success: true, data: { message } });
  } catch (err) {
    next(err);
  }
}