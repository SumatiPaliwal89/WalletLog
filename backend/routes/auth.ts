import express from 'express';
import { signup, login } from '../controllers/authController';
import { asyncHandler } from '../utils/asyncHandler'; 

const router = express.Router();

router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));

export default router;


