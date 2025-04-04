import express from 'express'
import { checkCompany, login, logout, signup } from '../controllers/company.controller.js'
import verifyToken from '../utils/verifyToken.js';

const router = express.Router();

router.get('/auth', verifyToken, checkCompany);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router