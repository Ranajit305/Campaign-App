import express from 'express'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

import connectDB from './utils/connectDB.js'
import companyRouter from './routes/company.route.js'
import customerRouter from './routes/customer.route.js'
import campaignRouter from './routes/campaign.route.js'
import referralRouter from './routes/referral.route.js'
import aiRouter from './routes/ai.route.js'

const app = express();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use('/api/company', companyRouter);
app.use('/api/customer', customerRouter);
app.use('/api/campaign', campaignRouter);
app.use('/api/referral', referralRouter);
app.use('/api/ai', aiRouter);

if (process.env.NODE_ENV === 'production') {
    app.use(express.status(path.join(__dirname, "../frontend/dist")));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    })
}

app.listen((PORT), () => {
    connectDB();
    console.log('Server is Listening to PORT:', PORT);
})