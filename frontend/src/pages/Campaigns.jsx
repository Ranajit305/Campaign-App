import { Megaphone, Plus, Search, Filter, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import useCampaignStore from '../stores/useCampaignStore';
import CreateCampaign from '../components/CreateCampaign';

const Campaigns = () => {

    const { campaigns, getCampaigns, updateCampaign, newCampaign, openCampaign } = useCampaignStore();
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        getCampaigns();
    }, []);

    const filteredCampaigns = campaigns.filter(campaign => {
        if (statusFilter === 'All') return true;
        return campaign.status.toLowerCase() === statusFilter.toLowerCase();
    });

    return (
        <div className="p-4 mx-auto sm:p-6 md:w-[70%]">
            <div className='mt-20'>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-indigo-600">Campaigns</h1>
                        <p className="text-gray-500">Manage your referral campaigns</p>
                    </div>
                    <div className="flex sm:flex-row gap-3 mb-6">
                        {/* Filters Section */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                            >
                                <option value="All">All Campaigns</option>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                            onClick={() => openCampaign()}
                            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            <span>New Campaign</span>
                        </button>
                    </div>
                </div>

                {/* Campaigns Grid */}
                {filteredCampaigns?.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredCampaigns?.map((campaign, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="p-5">
                                    {/* Header with status */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{campaign?.name}</h3>
                                        {campaign?.status === 'completed' ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                                                {campaign?.status}
                                            </span>
                                        ) : (
                                            <div className="relative">
                                                <select
                                                    value={campaign?.status}
                                                    onChange={(e) => updateCampaign(campaign?._id, e.target.value)}
                                                    className={`px-2.5 py-1 pr-6 rounded-full text-xs font-medium capitalize appearance-none cursor-pointer focus:outline-none ${campaign.status === "active"
                                                        ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                                        : "bg-gray-50 text-gray-700 ring-1 ring-gray-200"
                                                        }`}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 opacity-50 pointer-events-none" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Campaign Description */}
                                    {campaign?.description && (
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {campaign.description}
                                        </p>
                                    )}

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">Referrals</p>
                                            <p className="font-semibold text-lg mt-1">{campaign?.totalReferrals}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">New Customers</p>
                                            <p className="font-semibold text-lg mt-1">{campaign?.newCustomers}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">Start Date</p>
                                            <p className="font-medium text-sm mt-1">
                                                {new Date(campaign?.activePeriod?.startTime).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <p className="text-xs text-gray-500 font-medium">End Date</p>
                                            <p className="font-medium text-sm mt-1">
                                                {new Date(campaign?.activePeriod?.endTime).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rewards Section */}
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-xs font-medium text-gray-500 mb-2">REWARDS</p>
                                        <div className="flex flex-wrap gap-3">
                                            <div className="bg-purple-50 px-3 py-2 rounded-lg flex-1 min-w-[120px]">
                                                <p className="text-xs text-purple-600 font-medium">For Referral</p>
                                                <p className="font-semibold text-purple-800 mt-1">
                                                    {campaign?.reward?.customerReward || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="bg-amber-50 px-3 py-2 rounded-lg flex-1 min-w-[120px]">
                                                <p className="text-xs text-amber-600 font-medium">For Referred</p>
                                                <p className="font-semibold text-amber-800 mt-1">
                                                    {campaign?.reward?.referredReward || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                        <Megaphone className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-800 mb-1">
                            {statusFilter === 'All' ? 'No campaigns found' : `No ${statusFilter.toLowerCase()} campaigns`}
                        </h3>
                        <p className="text-gray-500">
                            {statusFilter === 'All'
                                ? 'Create your first campaign to get started'
                                : 'Try adjusting your filters or create a new campaign'}
                        </p>
                        <button
                            onClick={() => openCampaign()}
                            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition inline-flex items-center"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            <span>Create Campaign</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Campaigns