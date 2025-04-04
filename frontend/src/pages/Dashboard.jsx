import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, Users, Share2, UserPlus } from 'lucide-react';
import useCompanyStore from '../stores/useCompanyStore';
import { useEffect } from "react";

const Dashboard = () => {

    const { company, checkCompany } = useCompanyStore();

    useEffect(() => {
        checkCompany();
    }, [])

    // Sample data
    const stats = [
        { title: 'Total Campaigns', value: company?.totalCampaigns, icon: <Activity className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600' },
        { title: 'Total Referrals', value: company?.totalReferrals, icon: <Share2 className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600' },
        { title: 'New Customers', value: company?.newCustomers?.length, icon: <UserPlus className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
        { title: 'Total Customers', value: company?.totalCustomers, icon: <Users className="w-5 h-5" />, color: 'bg-orange-100 text-orange-600' },
    ];

    // Sample chart data
    const chartData = [
        { name: 'Campaigns', value: company.totalCampaigns },
        { name: 'Referrals', value: company.totalReferrals },
        { name: 'New Customers', value: company.newCustomers.length },
        { name: 'Total Customers', value: company.totalCustomers },
    ];

    return (
        <div className="p-4 mx-auto sm:p-6 md:w-[70%]">
            <div className='mt-20'>
                <h1 className="text-xl sm:text-2xl font-bold text-indigo-600 mb-4 sm:mb-6">Dashboard Overview</h1>

                {/* Stats Cards - Stack on mobile, grid on larger screens */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 mb-6 sm:mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-6 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-gray-500">{stat?.title}</p>
                                    <p className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2">{stat?.value.toLocaleString()}</p>
                                </div>
                                <div className={`p-2 sm:p-3 rounded-md sm:rounded-lg ${stat?.color}`}>
                                    {stat?.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chart Section */}
                <div className="bg-white rounded-lg sm:rounded-xl shadow-xs sm:shadow-sm p-4 sm:p-6 border border-gray-100 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800">Company Performance Overview</h2>
                    </div>

                    {/* Line Chart Container */}
                    <div className="h-60 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{
                                    top: 20,
                                    right: window.innerWidth < 640 ? 5 : 30,
                                    left: 0,
                                    bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} />
                                <YAxis tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }} width={window.innerWidth < 640 ? 30 : 40} />
                                <Tooltip />
                                {window.innerWidth >= 640 && <Legend />}
                                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;