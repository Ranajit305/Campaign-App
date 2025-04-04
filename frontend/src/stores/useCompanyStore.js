import { create } from 'zustand';
import { axiosUrl } from '../utils/axios'
import toast from 'react-hot-toast';

const useCompanyStore = create((set) => ({
    company: null,
    error: null,
    loading: false,

    checkCompany: async () => {
        set({loading: true})
        try {
            const response = await axiosUrl.get('/company/auth');
            set({ company: response.data });
        } catch (error) {
            set({ error: error.response?.data?.message });
        } finally {
            set({loading: false})
        }
    },

    login: async (email, password) => {
        set({ loading: true })
        try {
            set({ loading: true, error: null });
            const response = await axiosUrl.post('/company/login', { email, password });
            set({ company: response.data.company });
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response.data.message);
            set({ error: error.response?.data?.message || 'Login failed', loading: false });
        } finally {
            set({ loading: false })
        }
    },

    signup: async (name, email, password) => {
        set({ loading: true })
        try {
            const response = await axiosUrl.post('/company/signup', {
                name,
                email,
                password,
            });
            set({ company: response.data.company, loading: false });
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response.data.message);
            set({ error: error.response?.data?.message || 'Signup failed', loading: false });
        } finally {
            set({ loading: false })
        }
    },

    logout: async () => {
        try {
            await axiosUrl.post('/company/logout');
            set({ company: null });
            toast.success('Logged Out Successfully')
        } catch (error) {
            set({ error: error.response?.data?.message || 'Logout failed', loading: false });
        }
    }
}))

export default useCompanyStore;
