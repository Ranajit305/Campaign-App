import { create } from 'zustand';
import { axiosUrl } from '../utils/axios';
import { useAIStore } from './useAIStore';

const useCampaignStore = create((set, get) => ({
    campaigns: [], 
    newCampaign: false,
    loading: false,  
    error: null,

    openCampaign: () => {
        try {
            set({newCampaign: true})
        } catch (error) {
            console.log(error.message);
        }
    },

    closeCampaign: () => {
        try {
            set({newCampaign: false})
            useAIStore.setState({campaignData: null})
        } catch (error) {
            console.log(error.message)
        }
    },

    getCampaigns: async () => {
        set({ loading: true });
        try {
            const response = await axiosUrl.get('/campaign');
            set({ campaigns: response.data.campaigns });
        } catch (err) {
            console.error("Failed to fetch campaigns:", err);
            set({ error: err.message, loading: false });
        } finally {
            set({ loading: false})
        }
    },

    createCampaign: async (campaignData) => {
        set({ loading: true });
        try {
            const response = await axiosUrl.post('/campaign', { campaignData });
            console.log(response)

            set((state) => ({
                campaigns: [...state.campaigns, response.data.campaign]
            }))
        } catch (err) {
            console.error("Failed to create campaign:", err);
            set({ error: err.message, loading: false });
        } finally {
            set({ loading: false })
        }
    },

    updateCampaign: async (campaignId, status) => {
        try {
            const resopnse = await axiosUrl.put(`/campaign/${campaignId}`, { status })
            if (resopnse.data.success) {
                set((state) => ({
                    campaigns: state.campaigns.map((campaign) =>
                        campaign._id === campaignId ? { ...campaign, status: status } : campaign
                    ),
                }));
            }
        } catch (error) {
            console.log(error.response.data.message);
        }
    }
}));

export default useCampaignStore;
