import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchReports } from '../features/reportSlice.js';
import { User, MapPin, AlertTriangle, CheckCircle, BrainCircuit } from 'lucide-react';
import heroImage from '../assets/ocean-hero.jpg';

// --- UPDATED ReportCard Component ---
const ReportCard = ({ report }) => {
    // Helper to style the user-reported severity
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'High Waves': return 'bg-red-100 text-red-800 border-red-200';
            case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Safe': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Helper to style the AI-analyzed danger zone
    const getDangerZoneColor = (dangerZone = '') => {
        if (dangerZone.includes('Red Zone')) return 'text-red-600 font-bold';
        if (dangerZone.includes('Yellow Zone')) return 'text-yellow-600 font-bold';
        if (dangerZone.includes('Green Zone')) return 'text-green-600 font-bold';
        return 'text-gray-600';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 transition-all duration-300 hover:shadow-md">
            <div className="p-6">
                {/* --- User Report Section --- */}
                <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        {/* Note: We now use report.user.name because of the .populate() in the backend */}
                        <h3 className="font-semibold text-gray-900">{report.user ? report.user.name : 'Anonymous'}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1" />
                            {report.location} • {new Date(report.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                    </span>
                </div>
                <p className="text-gray-700 mb-4">{report.description}</p>
                {report.image && (
                    <img
                        src={report.image}
                        alt="Hazard report"
                        className="w-full h-auto object-cover rounded-lg mb-4"
                    />
                )}

                {/* --- AI Analysis Section --- */}
                {report.aiAnalysis && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                        <div className="flex items-center text-blue-600 mb-2">
                           <BrainCircuit className="w-5 h-5 mr-2" />
                           <h4 className="font-bold text-sm">AI Analysis</h4>
                        </div>
                        <p className="text-sm text-gray-800 mb-1">
                           <span className="font-semibold">Assessment: </span>
                           <span className={getDangerZoneColor(report.aiAnalysis.danger_zone)}>
                               {report.aiAnalysis.danger_zone || 'N/A'}
                           </span>
                        </p>
                        <p className="text-sm text-gray-600 italic">
                           "{report.aiAnalysis.description || 'No description generated.'}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- StatsCard Component (No Changes) ---
const StatsCard = ({ icon: Icon, title, value, color }) => {
    const getColorClasses = (color) => {
        switch (color) {
            case 'red': return 'bg-red-100 text-red-600';
            case 'blue': return 'bg-blue-100 text-blue-600';
            case 'green': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className={`inline-flex p-3 rounded-full ${getColorClasses(color)} mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
            <div className="text-gray-600">{title}</div>
        </div>
    );
};

// --- Main LandingPage Component (No Changes) ---
const LandingPage = () => {
    const dispatch = useDispatch();
    const { reports, status, error } = useSelector((state) => state.reports);

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchReports());
        }
    }, [status, dispatch]);

    let content;
    if (status === 'loading' && reports.length === 0) {
        content = <p className="text-center text-gray-600">Loading reports...</p>;
    } else if (status === 'succeeded' || (status === 'loading' && reports.length > 0)) {
        content = reports.map((report) => (
            <ReportCard key={report._id || report.id} report={report} />
        ));
    } else if (status === 'failed') {
        content = <p className="text-center text-red-600">{error}</p>;
    }

    return (
        <div>
            <div
                className="relative bg-cover bg-center bg-no-repeat py-28 text-center"
                style={{ backgroundImage: `url(${heroImage})` }}
            >
                <div className="absolute inset-0 bg-black opacity-40"></div>
                <div className="relative z-10 max-w-6xl mx-auto px-6 text-white">
                    <h1 className="text-6xl font-bold mb-6 drop-shadow-lg">
                        Ocean Safety Intelligence
                    </h1>
                    <p className="text-xl mb-8 max-w-2xl mx-auto drop-shadow-md">
                        Real-time ocean conditions and safety reports from the community
                    </p>
                    <Link
                        to="/dashboard"
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        View Dashboard
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <StatsCard icon={AlertTriangle} title="Active Alerts" value="23" color="red" />
                    <StatsCard icon={MapPin} title="Locations Monitored" value="156" color="blue" />
                    <StatsCard icon={CheckCircle} title="Verified Reports" value="1.2K" color="green" />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-6">Latest Reports</h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {content}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span className="text-gray-600">Reports Today</span><span className="font-semibold">47</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">High Severity</span><span className="font-semibold text-red-600">8</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Safe Conditions</span><span className="font-semibold text-green-600">31</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

