import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { signupSchema, loginSchema } from '../validators/authValidators.js';
import { authRateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Apply rate limiting specifically to login and signup —
// these are the endpoints an attacker would target.
router.post('/signup', authRateLimiter, validate(signupSchema), authController.signup);
router.post('/login',  authRateLimiter, validate(loginSchema),  authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout',  authController.logout);
router.get('/me',       requireAuth, authController.me);

export default router;