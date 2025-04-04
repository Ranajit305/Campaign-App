import { useEffect, useState } from 'react';
import { Send, Mail, MessageSquare, Check, X, Gift, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import useReferralStore from '../stores/useReferralStore';
import AgentAI from '../components/AgentAI';
import { useAIStore } from '../stores/useAIStore';

const ReferralPage = () => {

    const { createReferral, isLoading, referralSend, getCampaign, campaign } = useReferralStore();
    const { setPageContext, generateMessage, isGeneratingMessage } = useAIStore();

    const [searchParams] = useSearchParams();
    const referralId = searchParams.get("ref");
    const campaignId = searchParams.get("campaign");

    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        createReferral(campaignId, referralId, email, message)
        setEmail('');
        setMessage('');
    };

    const handleGenerateMessage = () => {
        generateMessage(setMessage);
    }

    useEffect(() => {
        setPageContext();
        if (referralId && campaignId) {
            getCampaign(campaignId, referralId);
        } else {
            return;
        }
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
            {campaign?.status === 'completed' ? (
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4">
                    <div className="text-5xl mb-6">🎉</div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Campaign Over</h1>
                    <p className="text-gray-600">Thank you for participating!</p>
                </div>
            ) : (
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-indigo-600 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white">Share with Friends</h1>
                        <p className="text-indigo-100 mt-1">Invite friends to join our platform</p>
                    </div>

                    {/* Reward Section */}
                    <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex">
                        <div className="flex items-center justify-center">
                            <div className="bg-indigo-100 p-3 rounded-full mr-3">
                                <Gift className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className='flex items-center gap-2'>
                                <h3 className="font-medium text-indigo-800">Your Reward:</h3>
                                <p className="text-sm font-semibold text-indigo-600">{campaign?.reward?.customerReward}</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Email Input */}
                        <div className="space-y-1">
                            <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                                <Mail className="w-4 h-4 mr-2 text-indigo-500" />
                                Friend's Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="friend@example.com"
                                required
                                className="w-full px-4 py-2 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Message Input */}
                        <div className="space-y-1">
                            <div className='flex items-center justify-between'>
                                <label htmlFor="message" className="flex items-center text-sm font-medium text-gray-700">
                                    <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
                                    Personal Message
                                </label>
                                    <button
                                        className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-md active:scale-95
                                    ${email
                                                ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg"
                                                : "bg-gray-400 cursor-not-allowed"
                                            }`}
                                        type="button"
                                        disabled={!email || isGeneratingMessage}
                                        onClick={() => handleGenerateMessage()}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" style={{ display: isGeneratingMessage ? 'inline-block' : 'none' }} />
                                        {isGeneratingMessage ? "Generating..." : "Generate Message"}
                                    </button>
                            </div>
                            <textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Hey! Join this amazing platform..."
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !email || !message}
                            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${isLoading || !email || !message
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                                } text-white shadow-md`}
                        >
                            {isLoading ? (
                                <svg
                                    className="w-5 h-5 mr-2 animate-spin"
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
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    ></path>
                                </svg>
                            ) : (
                                <Send className="w-5 h-5 mr-2" />
                            )}
                            {isLoading ? 'Sending...' : 'Send Invitation'}
                        </button>


                        {/* Success Message */}
                        {referralSend !== null && (
                            <div
                                className={`mt-4 p-3 rounded-lg flex items-center ${referralSend === true
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                                    }`}
                            >
                                {referralSend === 400 ? (
                                    <>
                                        <X className="w-5 h-5 mr-2" />
                                        The Email has already been referred.
                                    </>
                                ) : referralSend === 404 ? (
                                    <>
                                        <X className="w-5 h-5 mr-2" />
                                        The campaign is over.
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        Invitation sent successfully!
                                    </>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            )}
            <AgentAI />
        </div>
    );
};

export default ReferralPage;