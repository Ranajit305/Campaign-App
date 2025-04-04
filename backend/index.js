import express from 'express'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import connectDB from './utils/connectDB.js'
import companyRouter from './routes/company.route.js'
import customerRouter from './routes/customer.route.js'
import campaignRouter from './routes/campaign.route.js'
import referralRouter from './routes/referral.route.js'
import aiRouter from './routes/ai.route.js'

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use('/api/company', companyRouter);
app.use('/api/customer', customerRouter);
app.use('/api/campaign', campaignRouter);
app.use('/api/referral', referralRouter);
app.use('/api/ai', aiRouter);

app.listen((PORT), () => {
    connectDB();
    console.log('Server is Listening to PORT:', PORT);
})