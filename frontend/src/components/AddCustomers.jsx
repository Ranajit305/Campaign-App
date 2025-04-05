import { X, Upload, FileText, FileInput } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useCustomerStore from '../stores/useCustomerStore';

const AddCustomers = ({ setAddCustomer }) => {

    const { addSingleCustomer, addCustomers } = useCustomerStore();

    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);
    const [data, setData] = useState([]);

    const [addMode, setAddMode] = useState('single');
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        referrals: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFile(files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        setFileName(file.name);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            setData(content);
        };

        if (file.type === 'csv' || file.type === 'text/plain' || file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            console.log('Unsupported file type');
            // You might want to show an error to the user
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleAddCustomers = () => {
        if (addMode === "bulk") {
            addCustomers(data);
        } else {
            addSingleCustomer(formData.name, formData.email, formData.referrals);
        }
        setAddCustomer(false);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="fixed inset-0 bg-black/30" />

            <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Add Customers</h2>
                    <button
                        onClick={() => setAddCustomer(false)}
                        className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {addMode === 'bulk' ? (
                    <>
                        <div className="flex items-center pt-3 pl-7">
                            <p className="text-lg text-gray-800 font-medium">
                                Format:
                                <span className="font-sans text-blue-600 bg-blue-50 p-1.5 rounded-lg shadow-sm border border-blue-100 ml-2 mr-4 inline-flex items-center">
                                    <span className="mr-1">Name,</span>
                                    <span className="mx-1">Email,</span>
                                    <span className="mx-1">Referrals</span>
                                </span>
                            </p>
                        </div>

                        {/* Bulk Upload Section */}
                        <div className="p-6">
                            <div
                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}`}
                                onDragEnter={handleDragEnter}
                                onDragOver={(e) => e.preventDefault()}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={triggerFileInput}
                            >
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="p-3 rounded-full bg-indigo-100">
                                        <Upload className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {fileName ? fileName : 'Drag & drop your file here'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {fileName ? 'File ready for processing' : 'or click to browse files (CSV)'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".csv,.txt"
                                className="hidden"
                            />

                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                <FileText className="w-4 h-4 mr-2" />
                                <span>Supported formats: CSV</span>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Single Customer Form */
                    <div className="p-6 space-y-4">
                        <div className="space-y-3">
                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="John Doe"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                {/* Referrals */}
                                <div>
                                    <label htmlFor="referrals" className="block text-sm font-medium text-gray-700 mb-1">
                                        Referrals
                                    </label>
                                    <input
                                        type="number"
                                        id="referrals"
                                        name="referrals"
                                        min="0"
                                        value={formData.referrals}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal Footer */}
                <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 bg-gray-50">
                    {/* Left: Toggle Button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setAddMode(addMode === 'single' ? 'bulk' : 'single')}
                            className="px-4 py-2 text-sm font-medium cursor-pointer text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
                        >
                            {addMode === 'single' ? 'Add Bulk' : 'Add Single'}
                        </button>
                    </div>

                    {/* Right: Import Button */}
                    <div>
                        {addMode === 'single' ? (
                            <button
                                onClick={handleAddCustomers}
                                disabled={!formData.name || !formData.email || !formData.referrals}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${formData.name && formData.email && formData.referrals
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-indigo-400 cursor-not-allowed'
                                    }`}
                            >
                                Add Customer
                            </button>

                        ) : (
                            <button
                                onClick={handleAddCustomers}
                                disabled={!fileName}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${fileName
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-indigo-400 cursor-not-allowed'
                                    }`}
                            >
                                Import Customers
                            </button>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default AddCustomers