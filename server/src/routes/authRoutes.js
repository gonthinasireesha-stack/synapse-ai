// src/routes/authRoutes.js
//
// WHY THIS FILE IS JUST WIRING:
// Routes declare WHAT middleware + controller handles each URL.
// No business logic, no validation logic, no DB calls — just composition
// of pieces we already built (validate, requireAuth, controllers).

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { signupSchema, loginSchema } from '../validators/authValidators.js';

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.me);

export default router;