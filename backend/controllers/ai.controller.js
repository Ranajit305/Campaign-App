import { askAI } from "../utils/aiAgent.js"

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

export const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const userMessage = message.text.toLowerCase();

        // Check if user is providing mail details
        if (await mailData(userMessage, res)) return;
        if (await createMail(userMessage, res)) return;

        // Check if user is providing campaign details
        if (await campaignData(userMessage, res)) return;
        if (await createCampaign(userMessage, res)) return;

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
        console.error("AI Chat Error:", error);
        return res.status(500).json({
            success: false,
            message: "I'm having trouble answering that. Please try again later."
        });
    }
};

// Refer Message
export const generateMessage = async (req, res) => {
    try {
        const prompt = 'Generate a referral message for a campaign in a casual tone';
        const answer = await askAI(prompt);
        const fullResponse = answer[0]?.generated_text || "";
        const finalAnswer = cleanAIResponse(fullResponse, prompt);
        res.status(200).json({ success: true, finalAnswer });
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

// Campaign
const createCampaign = async (userMessage, res) => {
    try {
        const actionWords = ['create', 'creating', 'make', 'making', 'new', 'start', 'starting', 'launch', 'launching', 'begin', 'initiate', 'set up', 'setting up'];
        const campaignWords = ['campaign', 'campagin', 'promo', 'promotion'];

        const hasActionWord = actionWords.some(word => userMessage.includes(word));
        const hasCampaignWord = campaignWords.some(word => userMessage.includes(word));

        if (hasActionWord && hasCampaignWord) {
            return res.status(200).json({
                success: true,
                message: {
                    text: "Please provide:\nCampaign Title, Customer Reward, Referred Reward",
                    sender: 'bot',
                }
            });
        }

        return false;
    } catch (error) {
        console.error("Create Campaign Error:", error);
        return res.status(500).json({ success: false, message: "Error creating campaign." });
    }
};

const campaignData = async (userMessage, res) => {
    try {
        if (userMessage.includes(',')) {
            // Split by commas and clean up the parts
            const parts = userMessage.split(',').map(part => part.trim());

            // Check if we have at least 3 parts (title, customerReward, referredReward)
            if (parts.length >= 3) {
                const campaignData = {
                    title: parts[0].replace(/^./, char => char.toUpperCase()), // Capitalize first letter
                    customerReward: parts[1],
                    referredReward: parts[2],
                    description: ''
                };

                campaignData.description = await generateDescriptionDirect(campaignData.title);

                res.status(200).json({
                    success: true,
                    campaignData,
                    message: {
                        text: "Campaign details received! Opening creation form...",
                        sender: 'bot',
                    },
                    type: 'campaign'
                })
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error("Campaign Data Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const generateDescriptionDirect = async (title) => {
    if (!title) throw new Error('Title is required');

    const prompt = `Generate a description for ${title} in two lines`;
    const answer = await askAI(prompt);
    const fullResponse = answer[0]?.generated_text || "";
    return cleanAIResponse(fullResponse, prompt);
};

export const generateDescription = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(404).json({ success: false, message: 'Enter Title' });
        }

        const prompt = `Generate a description for ${title} in two lines`;
        const answer = await askAI(prompt);
        const fullResponse = answer[0]?.generated_text || "";
        const finalAnswer = cleanAIResponse(fullResponse, prompt);

        res.status(200).json({ success: true, finalAnswer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Mail
const createMail = async (userMessage, res) => {
    try {
        const actionWords = [
            'send', 'sending', 'mail', 'mailing', 'email', 'e-mail',
            'message', 'messaging', 'compose', 'composing',
            'notify', 'notifying', 'dispatch', 'dispatching',
            'share', 'sharing', 'deliver', 'delivering'
        ];

        const emailContextWords = [
            'email', 'e-mail', 'mail', 'message', 'notification', 'note', 'announcement'
        ];

        const hasAction = actionWords.some(word => userMessage.includes(word));
        const hasEmailContext = emailContextWords.some(word => userMessage.includes(word));

        if (hasAction && hasEmailContext) {
            return res.status(200).json({
                success: true,
                message: {
                    text: "Please provide:\nMail Title, single/all/loyal, professional/casual",
                    sender: 'bot',
                }
            });
        }

        return false;
    } catch (error) {
        console.error("Create Mail Error:", error);
        return res.status(500).json({ success: false, message: "Error creating mail." });
    }
}

const mailData = async (userMessage, res) => {
    try {
        const mailTypes = ['all', 'single', 'loyal'];
        const msgTypes = ['professional', 'casual'];

        if (userMessage.includes(',')) {
            // Split by commas and clean up the parts
            const parts = userMessage.split(',').map(part => part.trim());

            if (parts.length >= 3) {
                const title = parts[0].replace(/^./, char => char.toUpperCase()); // Capitalize first letter
                const type = parts[1].toLowerCase();
                const msgType = parts[2].toLowerCase();

                // Validate mail type and message type
                if (!mailTypes.includes(type) || !msgTypes.includes(msgType)) {
                    return false;
                }

                const mailInfo = {
                    title,
                    type,
                    msgType,
                };

                mailInfo.msg = await generateEmailDirect(mailInfo.title, mailInfo.msgType);

                res.status(200).json({
                    success: true,
                    mailData: mailInfo,
                    message: {
                        text: "Mail details received! Opening creation form...",
                        sender: 'bot',
                    },
                    type: 'mail'
                })
                return true;
            }
        }
        return false;
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const generateEmailDirect = async (title, msgType) => {
    if (!title || !msgType) throw new Error('Fields Missing');

    const prompt = `Generate an email body for ${title} in a ${msgType} way`;
    const answer = await askAI(prompt);
    const fullResponse = answer[0]?.generated_text || "";
    return cleanAIResponse(fullResponse, prompt);
};

export const generateEmail = async (req, res) => {
    try {
        const { title, msgType } = req.body;
        if (!title) {
            return res.status(404).json({ success: false, message: 'Enter Title' });
        }

        const prompt = `Generate an email body for ${title} in a ${msgType} way`;
        const answer = await askAI(prompt);
        const fullResponse = answer[0]?.generated_text || "";
        const finalAnswer = cleanAIResponse(fullResponse, prompt);

        res.status(200).json({ success: true, finalAnswer });
    } catch (error) {
        console.error("Email Generation Error:", error);
        res.status(500).json({
            error: "Failed to generate email",
            details: error.response?.data || error.message
        });
    }
}