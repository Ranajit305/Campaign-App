import { useEffect, useState } from 'react';
import { User, Mail, Lock, Link2, Copy, Check, Gift } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useReferralStore from '../stores/useReferralStore';

const ReferredPage = () => {

    const { updateReferral, isLoading, isRegistered, referralLink, getCampaign, campaign } = useReferralStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
    });

    const [searchParams] = useSearchParams();
    const referralId = searchParams.get("ref");
    const campaignId = searchParams.get("campaign");

    const [isCopied, setIsCopied] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        updateReferral(referralId, formData);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    useEffect(() => {
        if (referralId && campaignId) {
            getCampaign(campaignId);
        } else {
            return;
        }
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
            {campaign?.status === 'completed' ? (
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
                    <div className="text-5xl mb-6">🎉</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Campaign Over</h1>
                    <p className="text-gray-600">Thank you for participating!</p>
                </div>
            ) : (
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center text-white">
                        <h1 className="text-2xl font-bold">
                            {isRegistered === true
                                ? 'Welcome to Our Community!'
                                : 'Create Your Account'}
                        </h1>
                        <p className="opacity-90 mt-1">
                            {isRegistered === true
                                ? 'Start sharing your referral link'
                                : 'Join us and get your personal referral link'}
                        </p>
                    </div>

                    <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex">
                        <div className="flex items-center justify-center">
                            <div className="bg-indigo-100 p-3 rounded-full mr-3">
                                <Gift className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className='flex items-center gap-2'>
                                <h3 className="font-medium text-indigo-800">Your Reward:</h3>
                                <p className="text-sm font-semibold text-indigo-600">{campaign?.reward?.referredReward}</p>
                            </div>
                        </div>
                    </div>

                    {/* Error Messages */}
                    {(isRegistered === 400 || isRegistered === 404) && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center mx-6 mt-4">
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                ></path>
                            </svg>
                            {isRegistered === 400
                                ? 'Already Registered with Company'
                                : 'The campaign is over'}
                        </div>
                    )}

                    {/* Signup Form */}
                    {!isRegistered ? (
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label
                                    htmlFor="name"
                                    className="flex items-center text-sm font-medium text-gray-700"
                                >
                                    <User className="w-4 h-4 mr-2 text-purple-500" />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="email"
                                    className="flex items-center text-sm font-medium text-gray-700"
                                >
                                    <Mail className="w-4 h-4 mr-2 text-purple-500" />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !formData.name || !formData.email}
                                className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all mt-4 ${isLoading
                                    ? 'bg-purple-400 cursor-not-allowed'
                                    : 'bg-purple-600 hover:bg-purple-700'
                                    } text-white shadow-md`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Creating Account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </form>
                    ) : (
                        /* Referral Section After Signup */
                        <div className="p-6">
                            <div className="bg-purple-50 rounded-xl p-5 text-center">
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                                    <Link2 className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    Your Referral Link
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 mb-4">
                                    Share this link with friends and earn rewards
                                </p>

                                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="flex-1 px-4 py-2 overflow-x-auto">
                                        <p className="text-sm font-medium text-purple-600 whitespace-nowrap">
                                            {referralLink}
                                        </p>
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                                    >
                                        {isCopied ? (
                                            <Check className="w-5 h-5" />
                                        ) : (
                                            <Copy className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReferredPage;