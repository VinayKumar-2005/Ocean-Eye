import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReports } from '../features/reportSlice';
import { Filter, Search, Waves, Wind, ShieldCheck, Calendar, Mountain, AlertTriangle, CloudRain } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// --- Sub-component for the Filter Panel ---
const FilterPanel = ({ filters, setFilters }) => {

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            eventTypes: {
                ...prev.eventTypes,
                [name]: checked
            }
        }));
    };
    
    const handleVerifiedOnlyChange = (e) => {
        setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }));
    };

    return (
        <div className="bg-gray-900 text-white h-full p-6 flex flex-col">
            <div className="flex items-center mb-6">
                <h2 className="text-xl font-bold">Control Panel</h2>
            </div>

            {/* --- Location Search --- */}
            <div className="mb-6">
                <label className="text-sm font-medium mb-2 block text-gray-300">Location Search</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by location..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
                    />
                </div>
            </div>

            {/* --- Event Types --- */}
            <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-gray-300">Event Types</h3>
                <div className="space-y-2">
                    {Object.keys(filters.eventTypes).map((eventType) => (
                         <label key={eventType} className="flex items-center">
                            <input type="checkbox" name={eventType} checked={filters.eventTypes[eventType]} onChange={handleCheckboxChange} className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500" />
                            {eventType === 'Tsunami' && <AlertTriangle className="w-5 h-5 mx-2 text-blue-400" />}
                            {eventType === 'High Waves' && <Waves className="w-5 h-5 mx-2 text-red-400" />}
                            {eventType === 'Flooding' && <CloudRain className="w-5 h-5 mx-2 text-indigo-400" />}
                            {eventType === 'Storm' && <Wind className="w-5 h-5 mx-2 text-yellow-400" />}
                            {eventType === 'Erosion' && <Mountain className="w-5 h-5 mx-2 text-orange-400" />}
                            <span className="ml-2 text-sm">{eventType}</span>
                        </label>
                    ))}
                </div>
            </div>
            
            {/* --- Source & Verified --- */}
            <div className="mb-6">
                 <label htmlFor="source" className="text-sm font-medium mb-2 block text-gray-300">Source</label>
                 <select id="source" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white">
                    <option>All Sources</option>
                    <option>Citizen Reports</option>
                    <option>Official Channels</option>
                 </select>
            </div>

            <div className="mb-6">
                <label className="flex items-center">
                    <input type="checkbox" checked={filters.verifiedOnly} onChange={handleVerifiedOnlyChange} className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500" />
                    <ShieldCheck className="w-5 h-5 mx-2 text-green-400" />
                    <span className="ml-2 text-sm">Verified Reports Only</span>
                </label>
            </div>

            {/* --- Date Range --- */}
            <div className="mb-6">
                <h3 className="text-sm font-medium mb-3 text-gray-300">Date Range</h3>
                <div className="flex items-center space-x-2">
                    <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" />
                    <span>-</span>
                    <input type="text" placeholder="mm/dd/yyyy" className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400" />
                </div>
            </div>
        </div>
    );
};

// --- Sub-component for the Map Legend ---
const MapLegend = () => (
    <div className="absolute bottom-6 right-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-xl p-4 shadow-lg z-[1000] min-w-48">
        <h3 className="font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="space-y-2">
            <div className="flex items-center"><div className="w-4 h-4 bg-red-500 rounded-full mr-2 border border-white"></div><span className="text-sm text-gray-700">High Severity</span></div>
            <div className="flex items-center"><div className="w-4 h-4 bg-yellow-500 rounded-full mr-2 border border-white"></div><span className="text-sm text-gray-700">Medium Severity</span></div>
            <div className="flex items-center"><div className="w-4 h-4 bg-green-500 rounded-full mr-2 border border-white"></div><span className="text-sm text-gray-700">Safe / Verified</span></div>
        </div>
    </div>
);

// --- Sub-component for the Main Map ---
const MapComponent = ({ reports }) => {
    const position = [-25.2744, 133.7751]; // Default to Australia

    return (
        <div className="relative h-full w-full">
            <MapContainer center={position} zoom={4} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {reports.map(report => (
                    <Marker key={report._id || report.id} position={[report.lat, report.lon]}>
                        <Popup>
                            <div className="font-bold">{report.severity}</div>
                            <div>{report.description}</div>
                            <div className="text-xs text-gray-500 mt-1">{report.location}</div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <MapLegend />
        </div>
    );
};


// --- Main Dashboard Page Component ---
const DashboardPage = () => {
    const dispatch = useDispatch();
    const { reports, status } = useSelector((state) => state.reports);

    const [filters, setFilters] = useState({
        searchTerm: '',
        eventTypes: {
            'Tsunami': true,
            'High Waves': true,
            'Flooding': true,
            'Storm': true,
            'Erosion': true,
        },
        verifiedOnly: false,
    });

    useEffect(() => {
        if (status === 'idle') {
            dispatch(fetchReports());
        }
    }, [status, dispatch]);

    const filteredReports = useMemo(() => {
        // Assume reports have a 'severity' that matches one of the eventTypes keys
        // and a 'verified' boolean property for the 'verifiedOnly' filter.
        return reports.filter(report => {
            const searchMatch = report.location.toLowerCase().includes(filters.searchTerm.toLowerCase());
            const eventTypeMatch = filters.eventTypes[report.severity]; // Simplified logic for example
            const verifiedMatch = !filters.verifiedOnly || report.verified === true;
            
            return searchMatch && eventTypeMatch && verifiedMatch;
        });
    }, [reports, filters]);

    const summary = useMemo(() => {
        return {
            total: filteredReports.length,
            // Add more summary calculations if needed
        };
    }, [filteredReports]);

    return (
        <div className="flex" style={{ height: 'calc(100vh - 73px)' }}>
            <div className="w-1/4 h-full overflow-y-auto">
                <FilterPanel filters={filters} setFilters={setFilters} />
            </div>
            <div className="w-3/4 h-full relative flex flex-col">
                <div className="p-4 bg-white border-b border-gray-200">
                    <div className="flex items-center space-x-6 text-sm">
                       <div className="font-bold">Filtered Results:</div>
                       <div><span className="font-semibold">{summary.total}</span> Total Reports</div>
                    </div>
                </div>
                <div className="flex-grow">
                    {status === 'loading' && <div className="p-4">Loading Map...</div>}
                    {status === 'succeeded' && <MapComponent reports={filteredReports} />}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;

