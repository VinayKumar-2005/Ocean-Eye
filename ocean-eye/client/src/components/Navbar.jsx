import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../features/authSlice.js';
import { Search, Plus, LogIn, LogOut, User } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate('/');
    };

    return (
        <div className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-blue-600">Ocean-Eye</Link>
                    
                    <div className="flex-1 max-w-lg mx-4">
                       <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                            <Search className="w-5 h-5 text-gray-500 mr-3" />
                            <input
                                type="text"
                                placeholder="Search reports, locations..."
                                className="bg-transparent flex-1 outline-none text-gray-700"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <span className="text-gray-700">Welcome, {user.name}</span>
                                <button 
                                    onClick={onLogout}
                                    className="flex items-center bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                                {/* Report button is now a Link and only shows when logged in */}
                                <Link to="/submit-report" className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Report
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors">
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Login
                                </Link>
                                <Link to="/register" className="flex items-center bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-300 transition-colors">
                                    <User className="w-4 h-4 mr-2" />
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;