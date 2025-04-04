import { useEffect, useState } from 'react';
import useCustomerStore from '../stores/useCustomerStore';
import { UserPlus, Users, UserX, Trash2, Loader, Trash, Mail } from 'lucide-react';
import AddCustomers from '../components/AddCustomers';

const Customers = () => {
    const { getAllCustomers, customers, openMail, isLoading } = useCustomerStore();

    const bgColors = {
        all: 'bg-indigo-600',
        new: 'bg-green-600',
        old: 'bg-blue-600',
    };

    const [customerType, setCustomerType] = useState('all');
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [addCustomer, setAddCustomer] = useState(false);

    useEffect(() => {
        getAllCustomers();
    }, []);

    useEffect(() => {
        if (isLoading || !customers) return;

        if (customerType === 'all') {
            setFilteredCustomers(customers);
        } else {
            setFilteredCustomers(customers.filter(c => c.status === customerType));
        }
    }, [customerType, customers, isLoading]);

    return (
        <div className="p-4 sm:p-6 md:w-[70%] mx-auto">
            <div className="mt-20">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-indigo-600">Customers</h1>
                        <p className="text-gray-500">Manage your customer base efficiently.</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => openMail()}
                            className='flex items-center gap-2 px-5 py-3 bg-white hover:bg-gray-100 text-black font-medium text-sm rounded-lg shadow-md transition cursor-pointer'
                        >
                            <Mail className='w-5 h-5 text-indigo-600' /> Mail Customers
                        </button>
                        <button
                            onClick={() => setAddCustomer(true)}
                            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-md transition cursor-pointer"
                        >
                            <UserPlus className="w-5 h-5" /> Add Customers
                        </button>
                    </div>

                    {addCustomer && <AddCustomers setAddCustomer={setAddCustomer} />}
                </div>

                {/* Toggle Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {['all', 'new', 'old']?.map((type) => (
                        <button
                            key={type}
                            onClick={() => setCustomerType(type)}
                            className={`px-5 py-2 rounded-lg transition flex items-center ${customerType === type
                                ? `${bgColors[type]} text-white`
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {type === 'new' && <UserPlus className="w-4 h-4" />}
                            {type === 'old' && <Users className="w-4 h-4" />}
                            <span className="ml-2 capitalize">{type}</span>
                            {type !== 'all' && (
                                <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                                    {Array.isArray(customers) ? customers.filter(c => c.status === type)?.length : 0}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Customers Table */}
                <div className="rounded-xl shadow-sm border border-gray-200 bg-white">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader className="h-10 w-10 text-indigo-600 animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden sm:block overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Referrals</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Join Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCustomers?.length > 0 ? (
                                            filteredCustomers?.map((customer, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 flex items-center space-x-4 w-full">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${customer?.totalReferrals >= 10
                                                            ? 'bg-yellow-100 border border-yellow-300'
                                                            : 'bg-indigo-100'
                                                            }`}>
                                                            {customer?.totalReferrals >= 10 ? (
                                                                <span className="text-yellow-500 text-lg">★</span>
                                                            ) : (
                                                                <Users className="h-5 w-5 text-indigo-600" />
                                                            )}
                                                        </div>
                                                        <div className="truncate">
                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                {customer?.name}
                                                                {customer?.totalReferrals >= 10 && (
                                                                    <span className="ml-1 text-yellow-500">★</span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500 truncate">{customer?.email}</div>
                                                        </div>
                                                    </td>

                                                    {/* Rest of your existing columns remain unchanged */}
                                                    <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                                                        {customer?.totalReferrals || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${customer?.status === 'new'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {customer?.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4 text-right text-sm text-gray-900 whitespace-nowrap">
                                                        {new Date(customer?.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center">
                                                    <UserX className="mx-auto h-12 w-12 text-gray-400" />
                                                    <p className="mt-2 text-sm text-gray-500">No customers found.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="sm:hidden bg-white rounded-lg">
                                {filteredCustomers?.length > 0 ? (
                                    filteredCustomers?.map((customer, index) => (
                                        <div key={index} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition">
                                            <div className='flex items-center justify-between'>
                                                <div className="flex items-center space-x-4">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <Users className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{customer?.name}</div>
                                                        <div className="text-sm text-gray-500">{customer?.email}</div>
                                                        <div className="text-sm text-gray-500">
                                                            Joined: {new Date(customer?.createdAt).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {customer?.totalReferrals || 0} referrals
                                                    </span>
                                                    <div className={`mt-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${customer?.status === 'new'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-blue-100 text-blue-800 flex items-center justify-center'
                                                        }`}>
                                                        {customer?.status}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <UserX className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">No customers found.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

    );
};

export default Customers;
