import { create } from 'zustand';
import { axiosUrl } from '../utils/axios';

const useReferralStore = create((set) => ({
    referrals: [],
    referralId: null,
    campaign: [],
    isLoading: false,
    error: null,
    referralSend: null,
    isRegistered: null,
    referralLink: null,

    getReferrals: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await axiosUrl.get(`/referral`);
            set({ referrals: response.data.referrals, isLoading: false });
        } catch (error) {
            console.error('Failed to fetch referrals:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    getCampaign: async (campaignId, referralId) => {
        set({isLoading: true})
        try {
            set({ referralId: referralId })
            const response = await axiosUrl.get(`/referral/${campaignId}`);
            set({campaign: response.data.campaign})
        } catch (error) {
            console.log(error);
        } finally {
            set({isLoading: false})
        }
    },

    createReferral: async (campaignId, referralId, referredToEmail, message) => {
        set({ isLoading: true });
        try {
            const response = await axiosUrl.post("/referral", {
                campaignId,
                referralId,
                referredToEmail,
                message
            });
            console.log(response)

            if (response.data.success) {
                set({ referralSend: true })
            } else {
                set({ referralSend: error.response?.status })
            }
        } catch (error) {
            console.log(error.response.data.message);
            set({ referralSend: error.response?.status })
        } finally {
            set({ isLoading: false })
        }
    },

    updateReferral: async (referralId, data) => {
        set({ isLoading: true })
        try {
            const response = await axiosUrl.post(`/referral/${referralId}`, {data});
            if (response.data.success) {
                set({ isRegistered: true })
                set({ referralLink: response.data.referralLink })
            }
        } catch (error) {
            set({ isRegistered: error.response?.status })
            console.log(error.response.data.message);
        } finally {
            set({ isLoading: false})
        }
    },

    clearReferrals: () => set({ referrals: [] })
}));

export default useReferralStore;
