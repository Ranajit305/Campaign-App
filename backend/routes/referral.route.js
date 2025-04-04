import express from 'express';
import verifyToken from '../utils/verifyToken.js';
import { chatWithAI, createReferral, getCampaign, getReferrals, updateReferral } from '../controllers/referral.controller.js';

const router = express.Router();

router.post('/', createReferral);
router.get('/', verifyToken, getReferrals);
router.get('/:campaignId', getCampaign);
router.post('/message', chatWithAI);
router.post('/:referralId', updateReferral);


export default router;