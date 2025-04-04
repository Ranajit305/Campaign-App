import axios from "axios";
import 'dotenv/config'

// Configure once
export const aiClient = axios.create({
    baseURL: "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
    headers: {
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
    },
    timeout: 30000
});

// Simplified text generation
export async function askAI(prompt) {
    try {
        const { data } = await aiClient.post("", {
            inputs: prompt
        });
        return data;
    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        throw error;
    }
}