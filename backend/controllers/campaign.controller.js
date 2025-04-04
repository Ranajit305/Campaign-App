import Campaign from '../models/campaign.model.js';
import Company from '../models/company.model.js';
import Customer from '../models/customer.model.js'
import Referral from '../models/referral.model.js';
import nodemailer from 'nodemailer';
import 'dotenv/config'

const CLIENT_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : '/';

export const createCampaign = async (req, res) => {
    try {
        const { campaignData } = req.body;
        const company = req.company;

        if (new Date(campaignData.startTime) >= new Date(campaignData.endTime)) {
            return res.status(400).json({ message: 'End time must be after the start time.' });
        }

        const campaign = new Campaign({
            name: campaignData.name,
            description: campaignData.description,
            reward: {
                customerReward: campaignData.customerReward,
                referredReward: campaignData.referredReward,
            },
            activePeriod: {
                startTime: campaignData.startTime,
                endTime: campaignData.endTime,
            },
            company: company._id,
        });

        const customers = await Customer.find({ company: company._id });
        if (!customers.length) {
            console.log('No customers found for this company.');
            return;
        }

        company.totalCampaigns += 1;
        await Promise.all([company.save(), campaign.save()])
        res.status(201).json({ message: 'Campaign created successfully', campaign });
        sendCampaignEmails(customers, campaign);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create campaign', error: error.message });
    }
};

const sendCampaignEmails = async (customers, campaign) => {
    try {
        // Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // Use a real service like Gmail, Outlook, etc.
            auth: {
                user: process.env.EMAIL,  // Your email (from .env)
                pass: process.env.PASSWORD,  // App password from .env
            },
        });

        const emailPromises = customers.map((customer) => {
            const referralLink = `${CLIENT_URL}/referral?ref=${customer._id}&campaign=${campaign._id}`;

            return transporter.sendMail({
                from: `"Company" <${process.env.EMAIL}>`, // Dynamic email from .env
                to: customer.email,
                subject: `🌟 Join Our New Campaign: ${campaign.name}! 🌟`,
                html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #4CAF50; text-align: center;">🚀 Exciting Campaign Alert!</h2>
                <p style="font-size: 16px; color: #333;">Hi <strong>${customer.name}</strong>,</p>
                
                <p style="font-size: 16px; color: #333;">
                    ${campaign.description || "We've launched an exciting new campaign just for you!"}
                </p>
                
                <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);">
                    <p style="font-size: 16px; color: #333;">💰 <strong>Customer Reward:</strong> ${campaign.reward.customerReward || 'Special prize!'}</p>
                    <p style="font-size: 16px; color: #333;">🎁 <strong>Referred Reward:</strong> ${campaign.reward.referredReward || 'Exciting benefits!'}</p>
                </div>

                <p style="font-size: 16px; color: #333;">Your unique referral link:</p>
                <p style="text-align: center;">
                    <a href="${referralLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; font-size: 16px; border-radius: 5px;">
                        Refer & Earn 🎉
                    </a>
                </p>

                <p style="font-size: 16px; color: #333; text-align: center;">
                    ⏳ Hurry! The campaign is active from <strong>${new Date(campaign.activePeriod.startTime).toLocaleString()}</strong> 
                    to <strong>${new Date(campaign.activePeriod.endTime).toLocaleString()}</strong>.
                </p>

                <hr style="border: none; border-top: 1px solid #ddd;">
                <p style="font-size: 14px; text-align: center; color: #777;">
                    If you have any questions, feel free to reply to this email. Happy referring! 🎉
                </p>
            </div>
            `,
            });
        });

        await Promise.all(emailPromises);
        console.log('Campaign emails sent successfully!');
    } catch (error) {
        console.error('Failed to send campaign emails:', error);
    }
}

export const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ company: req.company._id });
        res.status(200).json({ message: 'Campaigns fetched successfully', campaigns });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch campaigns', error: error.message });
    }
};

export const updateCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { status } = req.body;

        if (status !== 'completed') {
            return res.status(400).json({ success: false, message: 'You can only end a Campaign' })
        }

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        campaign.status = status;
        await Promise.all([
            campaign.save(),
            Referral.updateMany(
                { campaignId, status: "pending" },
                { $set: { status: "failed" } }
            )
        ]);

        res.status(200).json({ success: true, message: "Campaign status updated successfully" });
    } catch (error) {
        console.error("Error updating campaign status:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}