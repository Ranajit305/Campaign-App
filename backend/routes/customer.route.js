import express from 'express'; 
import verifyToken from '../utils/verifyToken.js';
import { addCustomers, getAllCustomers, sendMail } from '../controllers/customer.controller.js';

const router = express.Router();

router.post('/', verifyToken, addCustomers);
router.get('/', verifyToken, getAllCustomers);
router.post('/mail', verifyToken, sendMail);

export default router;