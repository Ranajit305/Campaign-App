import express from "express";
import { chatWithAI, generateDescription, generateEmail, generateMessage } from "../controllers/ai.controller.js";
import verifyToken from "../utils/verifyToken.js";

const router = express.Router();

router.post("/chat", verifyToken, chatWithAI);
router.post('/message', generateMessage);
router.post('/description', verifyToken, generateDescription);
router.post('/email', verifyToken, generateEmail);

export default router;