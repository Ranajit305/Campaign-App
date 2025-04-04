import Referral from '../models/referral.model.js';
import Campaign from '../models/campaign.model.js';
import Customer from '../models/customer.model.js';
import Company from '../models/company.model.js';
import nodemailer from 'nodemailer'
import validator from 'validator';
import 'dotenv/config'
import { askAI } from '../utils/aiAgent.js';

const CLIENT_URL = process.env.CLIENT_URL;

export const getReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find({ company: req.company._id })
            .populate({
                path: 'referredBy',
                select: 'name email',
            })
            .populate({
                path: 'campaignId',
                select: 'name',
            });

        res.status(200).json({ success: true, message: 'Referrals fetched successfully', referrals });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching referrals', error: error.message });
    }
}

export const getCampaign = async (req, res) => {
    try {
        const { campaignId } = req.params;
        if (!campaignId) {
            return res.status(400).json({ success: false, message: 'CampaignId not Found' })
        }

        const campaign = await Campaign.findById(campaignId);
        res.status(200).json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

export const createReferral = async (req, res) => {
    try {
        const { campaignId, referralId, referredToEmail, message } = req.body;
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        if (campaign.status === "completed") {
            return res.status(404).json({ success: false, message: "This campaign is completed. You can no longer refer." });
        }

        const referrer = await Customer.findById(referralId);
        if (!referrer) {
            return res.status(404).json({ message: "Referrer not found" });
        }

        const existingReferral = await Referral.findOne({
            campaignId,
            referredToEmail,
            referredBy: referralId
        });

        if (existingReferral) {
            return res.status(400).json({ success: false, message: "This email has already been referred" });
        }

        const referral = new Referral({
            campaignId,
            referredBy: referralId,
            referredToEmail,
            company: campaign.company,
            status: "pending",
        });

        referrer.totalReferrals += 1;
        campaign.totalReferrals += 1;
        await Promise.all([Company.findByIdAndUpdate(
            campaign.company,
            {
                $inc: { totalReferrals: 1 }
            },
            { new: true }
        ),
        referrer.save(), referral.save(), campaign.save()])

        // Send referral email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        const referralLink = `${CLIENT_URL}/referred?ref=${referral._id}&campaign=${campaignId}`;

        await transporter.sendMail({
            from: '"Company" <yourcompany@gmail.com>',
            to: referredToEmail,
            subject: `You have been referred to ${campaign.name}!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">🌟 You've Been Invited! 🌟</h2>
                    
                    <p style="font-size: 16px; color: #333;">Hi there,</p>

                    <p style="font-size: 16px; color: #333;">
                        Your friend <strong>${referrer.name}</strong> has invited you to join our exciting campaign: 
                        <strong>${campaign.name}</strong>! 🎉
                    </p>

                    <blockquote style="font-size: 16px; font-style: italic; background-color: #fff; padding: 10px; border-left: 4px solid #4CAF50; margin: 10px 0;">
                        "${message}"
                    </blockquote>

                    <p style="font-size: 16px; color: #333;">Click the link below to claim your rewards and get started:</p>

                    <p style="text-align: center; margin-top: 20px;">
                        <a href="${referralLink}" style="display: inline-block; padding: 12px 20px; background-color: #4CAF50; color: white; text-decoration: none; font-size: 16px; border-radius: 5px;">
                            Claim Your Rewards 🎁
                        </a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

                    <p style="font-size: 14px; text-align: center; color: #777;">
                        Don't miss out! Join today and enjoy exclusive benefits. 🚀
                    </p>
                </div>
            `,
        });

        res.status(201).json({ success: true, referrer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

export const updateReferral = async (req, res) => {
    try {
        const { referralId } = req.params;
        const { data } = req.body;

        const referral = await Referral.findById(referralId).populate('referredBy');
        if (!referral) {
            return res.status(404).json({ success: false, message: 'Referral not found' });
        }

        const campaign = await Campaign.findById(referral.campaignId);
        if (!campaign) {
            return res.status(404).json({ success: false, message: 'Campaign not Found' })
        }

        if (campaign.status === "completed") {
            return res.status(404).json({ success: false, message: "This campaign is completed. You cannot claim the reward." });
        }

        const name = data.name;
        const email = data.email;
        const customer = await Customer.findOne({ email });
        if (customer) {
            return res.status(400).json({ success: false, message: 'Already Registered with Company' })
        }

        referral.status = 'completed';
        referral.reward = campaign.reward.customerReward;
        const newCustomer = new Customer({
            name,
            email,
            company: campaign.company,
            status: 'new'
        })

        const referralLink = `${CLIENT_URL}/referral?ref=${newCustomer._id}&campaign=${campaign._id}`;
        campaign.newCustomers += 1;

        await Promise.all([
            campaign.save(),
            newCustomer.save(),
            referral.save(),
            Company.findByIdAndUpdate(
                campaign.company,
                {
                    $inc: { totalCustomers: 1 },
                    $push: { newCustomers: newCustomer._id }
                },
                { new: true }
            )
        ]);
        res.status(200).json({ success: true, referralLink });
        sendRewardEmails(referral, newCustomer, campaign)
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating referral', error: error.message });
    }
}

const sendRewardEmails = async (referral, newCustomer, campaign) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        // Referral link for the new customer
        const newCustomerReferralLink = `${CLIENT_URL}/referral?ref=${newCustomer._id}&campaign=${campaign._id}`;

        // Email to the referrer (existing customer)
        const referrerEmail = transporter.sendMail({
            from: `"Your Company" <${process.env.EMAIL}>`,
            to: referral.referredBy.email,
            subject: `You've Earned a Reward from ${campaign.name}!`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">🎉 Thank You for Referring a Friend! 🎉</h2>
                    
                    <p style="font-size: 16px; color: #333;">Hi <strong>${referral.referredBy.name}</strong>,</p>

                    <p style="font-size: 16px; color: #333;">
                        Thank you for referring a friend to our <strong>${campaign.name}</strong> campaign! 
                        We truly appreciate your support.
                    </p>

                    <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); text-align: center;">
                        <p style="font-size: 18px; font-weight: bold; color: #4CAF50;">🎁 You've Earned:</p>
                        <p style="font-size: 20px; font-weight: bold; color: #333;">${campaign.reward.customerReward}</p>
                    </div>

                    <p style="font-size: 16px; color: #333;">
                        Keep referring more friends to earn even greater rewards! 🚀
                    </p>

                    <p style="text-align: center;">
                        <a href="${referralLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; font-size: 16px; border-radius: 5px;">
                            Refer More Friends 🎉
                        </a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 14px; text-align: center; color: #777;">
                        If you have any questions, feel free to reply to this email. Happy referring! 🎊
                    </p>
                </div>
            `,
        });

        // Email to the new customer (referred user)
        const newCustomerEmail = transporter.sendMail({
            from: `"Your Company" <${process.env.EMAIL}>`,
            to: newCustomer.email,
            subject: `Welcome to ${campaign.name}! Here's Your Reward`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">🎉 Welcome to ${campaign.name}! 🎉</h2>
                    
                    <p style="font-size: 16px; color: #333;">Hi <strong>${newCustomer.name}</strong>,</p>

                    <p style="font-size: 16px; color: #333;">
                        You've been referred by <strong>${referral.referredBy.name}</strong>, and as a special welcome gift, 
                        you’ve earned <strong>${campaign.reward.referredReward}</strong>! 🎁
                    </p>

                    <div style="background-color: #fff; padding: 15px; border-radius: 8px; box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1); text-align: center;">
                        <p style="font-size: 18px; font-weight: bold; color: #4CAF50;">🚀 Get Started Now!</p>
                        <p style="font-size: 16px; color: #333;">Start referring your friends and earn even more rewards!</p>
                    </div>

                    <p style="text-align: center; margin-top: 20px;">
                        <a href="${newCustomerReferralLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; font-size: 16px; border-radius: 5px;">
                            Your Referral Link 🔗
                        </a>
                    </p>

                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    <p style="font-size: 14px; text-align: center; color: #777;">
                        Have any questions? Just reply to this email. Happy referring! 🎊
                    </p>
                </div>
            `,
        });

        // Send both emails in parallel
        await Promise.all([referrerEmail, newCustomerEmail]);
        console.log('Referral reward emails sent successfully!');
    } catch (error) {
        console.error('Failed to send referral reward emails:', error);
    }
};

const createReferralFromChat = async (userMessage, res) => {
    if (!userMessage || typeof userMessage.text !== "string") {
        return false;
    }

    const message = userMessage.text.toLowerCase();

    try {
        const actionWords = [
            'send', 'sending', 'mail', 'mailing', 'email', 'e-mail',
            'message', 'messaging', 'compose', 'composing',
            'notify', 'notifying', 'dispatch', 'dispatching',
            'share', 'sharing', 'deliver', 'delivering',
            'refer', 'referring', 'invite', 'inviting', 'recommend', 'recommending'
        ];

        const emailContextWords = [
            'email', 'e-mail', 'mail', 'message', 'notification', 'note', 'announcement',
            'referral', 'invitation', 'recommendation', 'friend', 'contact', 'connection'
        ];

        const hasAction = actionWords.some(word => message.includes(word));
        const hasEmailContext = emailContextWords.some(word => message.includes(word));

        // Check if message contains '@'
        if (hasAction && hasEmailContext) {
            if (message.includes('@')) {
                return false;
            }

            res.status(200).json({
                success: true,
                message: {
                    text: "Please provide:\nemail, email, email... for multiple users",
                    sender: 'bot',
                }
            });

            return true; // Ensure no duplicate responses are sent
        }
        return false;
    } catch (error) {
        console.error("Error in createReferralFromChat:", error); // Debugging
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

const sendReferralsFromChat = async (message, campaignId, referralId, res) => {
    try {
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ success: false, message: "Campaign not found" });
        }

        if (campaign.status === "completed") {
            return res.status(400).json({ success: false, message: "This campaign is completed. You can no longer refer." });
        }

        const referrer = await Customer.findById(referralId);
        if (!referrer) {
            return res.status(404).json({ success: false, message: "Referrer not found" });
        }

        // Extract and validate emails from message
        const emailList = message.text.split(',').map(email => email.trim());
        const validEmails = emailList.filter(email => validator.isEmail(email));
        const invalidEmails = emailList.filter(email => !validator.isEmail(email));

        if (validEmails.length === 0) {
            return res.status(400).json({ success: false, message: "No valid emails provided." });
        }

        // Generate referral message once
        const prompt = 'Generate a referral message for a campaign in a casual tone';
        const answer = await askAI(prompt);
        const fullResponse = answer[0]?.generated_text || "";
        const referralMessage = cleanAIResponse(fullResponse, prompt);

        let successEmails = [];
        let failedEmails = [];

        for (const email of validEmails) {
            try {
                const existingReferral = await Referral.findOne({
                    campaignId,
                    referredToEmail: email,
                    referredBy: referralId
                });

                if (existingReferral) {
                    failedEmails.push({ email, reason: "Already referred" });
                    continue;
                }

                const referral = new Referral({
                    campaignId,
                    referredBy: referralId,
                    referredToEmail: email,
                    company: campaign.company,
                    status: "pending",
                });

                referrer.totalReferrals += 1;
                campaign.totalReferrals += 1;

                await Promise.all([
                    Company.findByIdAndUpdate(
                        campaign.company,
                        { $inc: { totalReferrals: 1 } },
                        { new: true }
                    ),
                    referrer.save(),
                    referral.save(),
                    campaign.save()
                ]);

                // Send email
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASSWORD,
                    },
                });

                const referralLink = `${CLIENT_URL}/referred?ref=${referral._id}&campaign=${campaignId}`;

                await transporter.sendMail({
                    from: 'Company <yourcompany@gmail.com>',
                    to: email,
                    subject: `You have been referred to ${campaign.name}!`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; background-color: #f9f9f9;">
                            <h2 style="color: #4CAF50; text-align: center;">🌟 You're Invited! 🌟</h2>
                            
                            <p style="font-size: 16px; color: #333; text-align: center;">
                                Your friend <strong>${referrer.name}</strong> has invited you to join 
                                <strong>${campaign.name}</strong>! 🎉
                            </p>

                            <p style="font-size: 16px; color: #333; text-align: center;">
                                Click the button below to claim your rewards and get started:
                            </p>

                            <p style="text-align: center; margin-top: 20px;">
                                <a href="${referralLink}" 
                                    style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; 
                                    font-size: 16px; font-weight: bold; border-radius: 5px; transition: background 0.3s;">
                                    🎁 Claim Your Rewards
                                </a>
                            </p>

                            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

                            <p style="font-size: 14px; text-align: center; color: #777;">
                                Don't miss out! Join today and enjoy exclusive benefits. 🚀
                            </p>
                        </div>
                    `
                });
                successEmails.push(email);
            } catch (error) {
                console.error(`Error sending to ${email}: ${error.message}`);
                failedEmails.push({ email, reason: "Failed to send email" });
            }
        }

        // Final response after processing all emails
        return res.status(200).json({
            success: true,
            message: {
                text: "Referral process completed.",
                successfulReferrals: successEmails,
                failedReferrals: failedEmails,
                invalidEmails: invalidEmails,
                sender: "bot"
            }
        });

    } catch (error) {
        console.error("Error:", error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }
};

export const chatWithAI = async (req, res) => {
    try {
        const { message, campaign, referralId } = req.body;

        if (await createReferralFromChat(message, res)) return;
        if (await sendReferralsFromChat(message, campaign._id, referralId, res)) return;

        // Normal Chat
        const prompt = `
        You are an expert assistant. Provide concise, accurate answers.
        Question: ${message.text}
        Answer in one sentence:`;

        const answer = await askAI(prompt);
        const finalAnswer = cleanAIResponse(answer[0]?.generated_text, prompt);

        return res.status(200).json({
            success: true,
            message: { text: finalAnswer, sender: 'bot' }
        });
    } catch (error) {
        console.error("AI Chat Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "I'm having trouble answering that. Please try again later."
        });
    }
};

const cleanAIResponse = (response, originalPrompt) => {
    if (!response) return "I couldn't process that request.";

    // Remove the entire prompt template if it appears in response
    let cleaned = response.replace(new RegExp(originalPrompt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), ''), '');

    // Remove common AI prefixes/suffixes
    cleaned = cleaned
        .replace(/^(Answer|Response|Explanation)[:.]?\s*/i, '')
        .replace(/^[^a-zA-Z0-9"']+/, '') // Remove leading non-alphanumeric chars
        .replace(/\s*\.?\s*$/, '') // Remove trailing whitespace/periods
        .trim();

    return cleaned || "I couldn't process that request.";
};