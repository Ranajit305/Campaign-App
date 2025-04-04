import express from 'express'
import verifyToken from '../utils/verifyToken.js';
import { createCampaign, getAllCampaigns, updateCampaign } from '../controllers/campaign.controller.js';

const router = express.Router();

router.get('/', verifyToken, getAllCampaigns);
router.post('/', verifyToken, createCampaign);
router.put('/:campaignId', verifyToken, updateCampaign);

export default router;