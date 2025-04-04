import { Users, Gift, CheckCircle2, Clock, XCircle, ChevronDown, Search, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import useReferralStore from '../stores/useReferralStore';

const Referrals = () => {
    const { getReferrals, referrals, isLoading } = useReferralStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter referrals based on search and status
    const filteredReferrals = Array.isArray(referrals) ? referrals.filter(referral => {
        const matchesSearch =
            referral.referredBy?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            referral.referredToEmail?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || referral.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    }) : [];


    // Get status icon and color
    const getStatusInfo = (status) => {
        switch (status) {
            case 'completed':
                return { icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-100 text-green-800' };
            case 'pending':
                return { icon: <Clock className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' };
            case 'failed':
                return { icon: <XCircle className="w-4 h-4" />, color: 'bg-red-100 text-red-800' };
            default:
                return { icon: null, color: 'bg-gray-100 text-gray-800' };
        }
    };

    useEffect(() => {
        getReferrals();
    }, []);
    console.log(referrals)

    return (
        <div className="p-4 sm:p-6 md:w-[70%] mx-auto">
            <div className="mt-20">
                {/* Header Section */}
                <div className="flex justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-indigo-600">Referrals</h1>
                        <p className="text-gray-500">Track all customer referral activity</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none w-full sm:w-40 pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                            >
                                <option>All</option>
                                <option>Completed</option>
                                <option>Pending</option>
                                <option>Failed</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Loader for data fetching */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="h-10 w-10 text-indigo-600 animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* Referrals List - Mobile View */}
                        <div className="lg:hidden space-y-4">
                            {filteredReferrals?.length > 0 ? (
                                filteredReferrals?.map((referral, index) => {
                                    const statusInfo = getStatusInfo(referral.status);
                                    return (
                                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900 truncate">{referral?.referredBy?.name}</p>
                                                            <p className="text-xs text-gray-500 truncate">{referral?.referredBy?.email}</p>
                                                        </div>
                                                        <span
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                                                        >
                                                            {referral?.status}
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 space-y-2">
                                                        <div className='text-sm'>
                                                            <p className='text-gray-500 mr-2'>Campaign: <span className='font-medium text-gray-900'>{referral?.campaignId.name}</span></p>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <span className="text-gray-500 mr-2">Referred:</span>
                                                            <span className="font-medium text-gray-900">{referral?.referredToEmail}</span>
                                                        </div>

                                                        <div className="flex items-center text-sm">
                                                            <span className="text-gray-500 mr-2">Reward:</span>
                                                            <Gift className="w-4 h-4 text-purple-500 mr-1" />
                                                            <span className="font-medium text-gray-900">{referral?.reward}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals found</h3>
                                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>

                        {/* Referrals Table - Desktop View */}
                        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred Email</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Reward</th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredReferrals?.length > 0 ? (
                                            filteredReferrals?.map((referral, index) => {
                                                const statusInfo = getStatusInfo(referral?.status);
                                                return (
                                                    <tr key={index} className="hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-start space-x-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-gray-900">{referral?.referredBy?.name}</span>
                                                                    <span className="text-sm text-gray-500">{referral?.referredBy?.email}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-sm text-gray-900">{referral?.referredToEmail}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-sm text-gray-900">{referral?.campaignId?.name}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo?.color}`}
                                                            >
                                                                {referral?.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <Gift className="w-5 h-5 text-purple-500" />
                                                                <span className="text-sm font-medium text-gray-900">{referral?.reward}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center">
                                                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No referrals found</h3>
                                                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>

    );
};

export default Referrals