import { create } from "zustand";
import { axiosUrl } from "../utils/axios";
import useCampaignStore from "./useCampaignStore";
import useCustomerStore from "./useCustomerStore";
import useReferralStore from "./useReferralStore";

export const useAIStore = create((set, get) => ({
    messages: [{
        text: "Hey, I'm your AI Assistant. I can help you with creating campaigns or sending mails", sender: 'bot'
    }],
    referralPage: false,
    isLoading: false,
    isGeneratingMessage: false,
    campaignFromChat: false,
    campaignData: null,
    mailData: null,

    setPageContext: () => {
        try {
            const msg = { text: "Want to refer multiple persons at once ? \n Provide: email,email,email...", sender: 'bot' };
            set({ referralPage: true })
            set({ messages: [msg] })
        } catch (error) {
            console.log(error.message)
        }
    },

    addMessage: async (message) => {
        set((state) => ({ messages: [...state.messages, message] }));

        const botTyping = { id: Date.now(), text: "Analysing...", sender: "bot" };
        set((state) => ({ messages: [...state.messages, botTyping], isLoading: true }));

        try {
            if (get().referralPage === true) {
                const campaign = useReferralStore.getState().campaign;
                const referralId = useReferralStore.getState().referralId;
                try {
                    const response = await axiosUrl.post('/referral/message', { message, campaign, referralId });
                    set((state) => ({
                        messages: [...state.messages.filter((msg) => msg.text !== "Analysing..."), response.data.message],
                        isLoading: false
                    }));
                } catch (error) {
                    console.log(error.response.data.message)
                }
            } else {
                const response = await axiosUrl.post("/ai/chat", { message });
                if (response.data.success) {
                    set((state) => ({
                        messages: [...state.messages.filter((msg) => msg.text !== "Analysing..."), response.data.message],
                        isLoading: false
                    }));

                    if (response.data.type === 'campaign') {
                        set({ campaignData: response.data.campaignData })
                        useCampaignStore.setState({ newCampaign: true })
                    } else if (response.data.type === 'mail') {
                        set({ mailData: response.data.mailData })
                        useCustomerStore.setState({ mail: true })
                    }
                }
            }
        } catch (error) {
            console.log(error);
            set((state) => ({ messages: [...state.messages.filter((msg) => msg.text !== "Analysing...")], isLoading: false }));
        }
    },

    generateDescription: async (title, setFormData) => {
        set({ isLoading: true })
        try {
            const response = await axiosUrl.post('/ai/description', { title });
            if (response.data.success) {
                setFormData((prev) => ({
                    ...prev,
                    description: response.data.finalAnswer,
                }));
            }
        } catch (error) {
            console.log(error.response.data.message);
        } finally {
            set({ isLoading: false })
        }
    },

    generateEmail: async (title, msgType, setMessage) => {
        set({ isLoading: true })
        try {
            const response = await axiosUrl.post('/ai/email', { title, msgType });
            if (response.data.success) {
                setMessage(response.data.finalAnswer)
            }
        } catch (error) {
            console.log(error.response.data.message);
        } finally {
            set({ isLoading: false })
        }
    },

    generateMessage: async (setMessage) => {
        set({ isGeneratingMessage: true })
        try {
            const response = await axiosUrl.post('/ai/message');
            setMessage(response.data.finalAnswer);
        } catch (error) {
            console.log(error.response.data.message)
        } finally {
            set({ isGeneratingMessage: false })
        }
    },

    resetChat: () => set({ messages: [] }),
}));