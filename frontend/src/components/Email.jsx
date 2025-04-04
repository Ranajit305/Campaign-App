import React, { useEffect, useState } from 'react'
import { Mail, X, User, ChevronDown, RefreshCw, Filter, Star, Send } from 'lucide-react';
import useCustomerStore from '../stores/useCustomerStore';
import { useAIStore } from '../stores/useAIStore';

const Email = () => {

    const { generateEmail, isLoading, mailData } = useAIStore();
    const { sendMail, closeMail, customers, getAllCustomers } = useCustomerStore();

    const [emailTitle, setEmailTitle] = useState("");
    const [selectedEmail, setSelectedEmail] = useState("");
    const [recipientType, setRecipientType] = useState("single");
    const [messageType, setMessageType] = useState("professional");
    const [message, setMessage] = useState('');

    const [showError, setShowError] = useState(false);

    const handleGenerateMessage = () => {
        generateEmail(emailTitle, messageType, setMessage);
    }

    const handleEmail = (e) => {
        e.preventDefault();

        if (recipientType === 'single' && selectedEmail === "") {
            setShowError(true);
            return;
        }

        setShowError(false);

        sendMail(emailTitle, recipientType, selectedEmail, messageType, message);
        setEmailTitle("");
        setMessage("");
        setSelectedEmail("");
    }

    const handleCloseMail = () => {
        closeMail();
        setEmailTitle('');
        setMessage('');
        setRecipientType('single');
        setMessageType('professional');
    }

    useEffect(() => {
        getAllCustomers();
        if (mailData) {
            setEmailTitle(mailData.title);
            setRecipientType(mailData.type);
            setMessageType(mailData.msgType);
            setMessage(mailData.msg);
        }
    }, [mailData])

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-[rgba(0,0,0,0.3)] flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 space-y-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div className="flex items-center space-x-3">
                        <Mail className="h-6 w-6 text-indigo-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Send Email</h2>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <X onClick={() => handleCloseMail()} className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleEmail} className='flex flex-col gap-6'>
                    {/* Email Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Title</label>
                        <input
                            type="text"
                            placeholder="Summer Sale Announcement"
                            className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            value={emailTitle}
                            onChange={(e) => setEmailTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Recipient Filter */}
                    <div className={`${recipientType !== 'single' ? '' : 'grid grid-cols-1 md:grid-cols-2'}  gap-4`}>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                                Filter Recipients
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none"
                                    value={recipientType}
                                    onChange={(e) => setRecipientType(e.target.value)}
                                >
                                    <option value="single">Single Recipient</option>
                                    <option value="all">All Customers</option>
                                    <option value="loyal">Loyal Customers</option>
                                </select>
                                <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                            </div>
                            {showError && (
                                <p className="text-sm text-red-500 mt-1">Please select a customer email.</p>
                            )}
                        </div>

                        {/* Customer Email Dropdown */}
                        {recipientType === "single" && (
                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                    <User className="h-4 w-4 mr-2 text-gray-500" />
                                    To
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm appearance-none"
                                        value={selectedEmail}
                                        onChange={(e) => setSelectedEmail(e.target.value)}
                                    >
                                        <option value="" disabled>Select Customer</option>
                                        {customers?.map((customer, index) => (
                                            <option key={index} value={customer?.email}>
                                                {customer?.email}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Message Generation */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-medium text-gray-700">Message Content</h3>
                            <button
                                className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all shadow-md active:scale-95
                                    ${emailTitle
                                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
                                type="button"
                                disabled={!emailTitle || isLoading}
                                onClick={() => handleGenerateMessage()}
                            >
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" style={{ display: isLoading ? 'inline-block' : 'none' }} />
                                {isLoading ? "Generating..." : "Generate Message"}
                            </button>

                        </div>

                        <div className="flex space-x-3">
                            <button
                                className={`flex-1 py-2 px-4 rounded-lg outline-none ${messageType === "professional"
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
                                    }`}
                                type='button'
                                onClick={() => setMessageType("professional")}
                            >
                                Professional
                            </button>
                            <button
                                className={`flex-1 py-2 px-4 rounded-lg ${messageType === "casual"
                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
                                    }`}
                                type='button'
                                onClick={() => setMessageType("casual")}
                            >
                                Casual
                            </button>
                        </div>

                        <textarea
                            onChange={(e) => setMessage(e.target.value)}
                            value={message}
                            className="w-full h-40 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Your generated message will appear here..."
                            required
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <button type='submit' className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center">
                            <Send className="h-4 w-4 mr-2" />
                            Send Email
                        </button>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default Email