import { create } from 'zustand';
import { axiosUrl } from '../utils/axios';
import toast from 'react-hot-toast';

const useCustomerStore = create((set) => ({
    customers: [],
    mail: false,
    isLoading: false,
    error: null,

    openMail: () => {
        try {
            set({mail: true})
        } catch (error) {
            console.log(error.message)
        }
    },

    closeMail: () => {
        try {
            set({mail: false})
        } catch (error) {
            console.log(error.message)
        }
    },

    sendMail: async (title, type, email, msgType, msg) => {
        try {
            await axiosUrl.post('/customer/mail', { title, type, email, msgType, msg });
        } catch (error) {
            console.log(error.response.data.message);
        }
    },

    addCustomers: async (customersCSV) => {
        try {
            // Convert CSV to JSON
            const customersJSON = customersCSV
                .split('\n') // Split by lines
                .filter(line => line.trim() !== '') // Remove empty lines
                .map((line, index) => {
                    if (index === 0 && line.toLowerCase().includes('name,email,referrals')) {
                        return null;
                    }
                    const [name, email, referrals] = line.split(',').map(item => item.trim());
                    return {
                        name,
                        email,
                        totalReferrals: parseInt(referrals) || 0,
                    };
                })
                .filter(customer => customer !== null); 

            const response = await axiosUrl.post('/customer', { customers: customersJSON });
            if (response.data.success) {
                set((state) => ({
                    customers: [...state.customers, ...response.data.finalCustomers]
                }))
            }
        } catch (error) {
            toast.error(error.response.data.message);
            console.error(error.response.data.message);
        }
    },

    getAllCustomers: async () => {
        set({ isLoading: true });
        try {
            const response = await axiosUrl.get('/customer');
            set({ customers: response.data.customers });
        } catch (err) {
            console.error('Failed to fetch customers:', err);
            set({ error: err.message });
        } finally {
            set({ isLoading: false })
        }
    },

    clearCustomers: () => set({ customers: [] }),
}));

export default useCustomerStore;