import { X, Gift, Calendar, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import useCampaignStore from '../stores/useCampaignStore';
import { useAIStore } from '../stores/useAIStore';

const CreateCampaign = () => {

    const { createCampaign, closeCampaign } = useCampaignStore();
    const { generateDescription, isLoading, campaignData } = useAIStore();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: null,
        endDate: null,
        customerReward: '',
        referredReward: ''
    });

    const [errors, setErrors] = useState({});

    const handleGenerateDescription = () => {
        generateDescription(formData.title, setFormData);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when field is edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date
        }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
            newErrors.endDate = 'End date must be after start date';
        }
        if (!formData.customerReward) newErrors.customerReward = 'Reward is required';
        if (!formData.referredReward) newErrors.referredReward = 'Reward is required';

        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const campaignData = {
                name: formData.title,
                description: formData.description,
                customerReward: formData.customerReward,
                referredReward: formData.referredReward,
                startTime: formData.startDate.toISOString(),  // Send as ISO string
                endTime: formData.endDate.toISOString(),
            };
            createCampaign(campaignData);
            setFormData({
                title: '',
                description: '',
                startDate: null,
                endDate: null,
                customerReward: '',
                referredReward: ''
            });
            closeCampaign();
        }
    };

    const handleCloseCampaign = () => {
        closeCampaign();
        setFormData({
            title: '',
            description: '',
            startDate: null,
            endDate: null,
            customerReward: '',
            referredReward: ''
        });
    }

    useEffect(() => {
        if (campaignData) {
            setFormData(campaignData);
        }
    }, [campaignData])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div
                className="fixed inset-0 bg-black/30"
            />

            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Create New Campaign</h2>
                    <button
                        onClick={() => handleCloseCampaign()}
                        className="p-1 rounded-full hover:bg-gray-100 transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Campaign Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Summer Sale 2023"
                        />
                        {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <button
                                type="button"
                                onClick={() => handleGenerateDescription()}
                                disabled={!formData.title} // Disable button if title is empty
                                className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-md active:scale-95
                                    ${formData.title
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {isLoading ? 'Generating...' : 'Generate Description'}
                            </button>
                        </div>

                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.description ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Describe your campaign to customers..."
                        />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date *
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.startDate}
                                    onChange={(date) => handleDateChange(date, 'startDate')}
                                    selectsStart
                                    startDate={formData.startDate}
                                    endDate={formData.endDate}
                                    minDate={new Date()}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.startDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholderText="Select start date"
                                />
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date *
                            </label>
                            <div className="relative">
                                <DatePicker
                                    selected={formData.endDate}
                                    onChange={(date) => handleDateChange(date, 'endDate')}
                                    selectsEnd
                                    startDate={formData.startDate}
                                    endDate={formData.endDate}
                                    minDate={formData.startDate || new Date()}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.endDate ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholderText="Select end date"
                                />
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                        </div>
                    </div>

                    {/* Rewards Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center">
                            <Gift className="w-5 h-5 text-indigo-600 mr-2" />
                            Reward Settings
                        </h3>

                        {/* Customer Reward */}
                        <div>
                            <label htmlFor="customerReward" className="block text-sm font-medium text-gray-700 mb-1">
                                Reward for Referrer *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="customerReward"
                                    name="customerReward"
                                    value={formData.customerReward}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.customerReward ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="$20 credit"
                                />
                                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.customerReward && <p className="mt-1 text-sm text-red-600">{errors.customerReward}</p>}
                        </div>

                        {/* Referred Reward */}
                        <div>
                            <label htmlFor="referredReward" className="block text-sm font-medium text-gray-700 mb-1">
                                Reward for Referee *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="referredReward"
                                    name="referredReward"
                                    value={formData.referredReward}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition ${errors.referredReward ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="15% discount"
                                />
                                <Gift className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            {errors.referredReward && <p className="mt-1 text-sm text-red-600">{errors.referredReward}</p>}
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Create Campaign
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateCampaign