import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Megaphone,
    Users,
    Gift,
    Bell,
    LogOut,
    Menu,
    X,
} from 'lucide-react';
import useCompanyStore from '../stores/useCompanyStore';

const Sidebar = () => {

    const { logout } = useCompanyStore();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="md:min-h-screen md:bg-gradient-to-br md:from-blue-50 md:to-indigo-100 md:border-r md:border-indigo-200">
            {/* Mobile Header (hidden on md and above) */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                        <Megaphone className="w-5 h-5 text-indigo-600" />
                        <span className="ml-2 text-lg font-bold text-indigo-900">Campaign Platform</span>
                    </div>
                    <button
                        onClick={toggleMobileMenu}
                        className="p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Sidebar/Navigation */}
            <div
                className={`
                    fixed md:relative z-30 h-screen w-64
                    bg-gradient-to-br from-blue-50 to-indigo-100
                    transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 transition-transform duration-300 ease-in-out
                `}
            >
                <div className="p-5 text-xl font-bold text-indigo-900 flex items-center justify-center border-b border-indigo-200 bg-white/30 backdrop-blur-sm">
                    <Megaphone className="w-5 h-5 mr-2 text-indigo-700" />
                    Campaign Platform
                </div>

                <nav className="mt-6 px-3">
                    <ul onClick={() => setIsMobileMenuOpen(false)} className="space-y-2">
                        <li>
                            <Link
                                to="/dashboard"
                                className="flex items-center p-2.5 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900 rounded-lg transition-all duration-200 group"
                            >
                                <LayoutDashboard className="w-5 h-5 mr-3 text-indigo-600 group-hover:text-indigo-900" />
                                <span className="text-sm font-medium">Dashboard</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/campaigns"
                                className="flex items-center p-2.5 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900 rounded-lg transition-all duration-200 group"
                            >
                                <Megaphone className="w-5 h-5 mr-3 text-indigo-600 group-hover:text-indigo-900" />
                                <span className="text-sm font-medium">Campaigns</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/customers"
                                className="flex items-center p-2.5 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900 rounded-lg transition-all duration-200 group"
                            >
                                <Users className="w-5 h-5 mr-3 text-indigo-600 group-hover:text-indigo-900" />
                                <span className="text-sm font-medium">Customers</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/referrals"
                                className="flex items-center p-2.5 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900 rounded-lg transition-all duration-200 group"
                            >
                                <Gift className="w-5 h-5 mr-3 text-indigo-600 group-hover:text-indigo-900" />
                                <span className="text-sm font-medium">Referrals</span>
                            </Link>
                        </li>
                        {/* Logout Section */}
                        <div className="border-t border-indigo-200/50 mt-4 pt-2">
                            <li>
                                <button
                                    onClick={() => logout()}
                                    className="w-full flex items-center p-2.5 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-lg transition-all duration-200 group cursor-pointer"
                                >
                                    <LogOut className="w-5 h-5 mr-3 text-red-500 group-hover:text-red-700" />
                                    <span className="text-sm font-medium">Logout</span>
                                </button>
                            </li>
                        </div>
                    </ul>
                </nav>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 z-20 md:hidden" onClick={toggleMobileMenu} />
            )}
        </div>
    );
};

export default Sidebar;
