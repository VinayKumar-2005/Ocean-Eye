import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { createReport, reset } from '../features/reportSlice';
import { MapPin } from 'lucide-react';

const SubmitReportPage = () => {
    // State for all form fields
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('Moderate');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState('');
    const [location, setLocation] = useState(null);
    const [isLocating, setIsLocating] = useState(false);
    
    // State to track if the submission was successful for redirection
    const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get the submission status from Redux
    const { status, error } = useSelector((state) => state.reports);

    // Effect to handle redirection after successful submission
    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(reset()); // Reset the error state
        }

        if (isSubmitSuccess) {
            dispatch(reset()); // Reset the submission state
            navigate('/'); // Navigate to homepage
        }
    }, [isSubmitSuccess, error, navigate, dispatch]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                setLocation({
                    lat: latitude,
                    lon: longitude,
                    name: data.display_name || 'Unknown Location',
                });
            } catch (err) {
                console.error("Reverse geocoding failed:", err);
                setLocation({ lat: latitude, lon: longitude, name: 'Coordinates Captured' });
            } finally {
                setIsLocating(false);
            }
        }, () => {
            alert('Unable to retrieve your location. Please enable location permissions.');
            setIsLocating(false);
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!location) {
            alert("Please get your current location before submitting.");
            return;
        }
        if (!image) {
            alert("Please upload an image or video before submitting.");
            return;
        }

        const reportData = new FormData();
        reportData.append('description', description);
        reportData.append('severity', severity);
        reportData.append('image', image);
        reportData.append('lat', location.lat);
        reportData.append('lon', location.lon);
        reportData.append('location', location.name);

        // Dispatch the action and check if it was fulfilled
        const resultAction = await dispatch(createReport(reportData));
        if (createReport.fulfilled.match(resultAction)) {
            setIsSubmitSuccess(true);
        }
    };

    return (
        <div className="flex justify-center mt-12 mb-12">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
                    Submit New Hazard Report
                </h1>
                <form onSubmit={onSubmit}>
                    <div className="mb-6">
                        <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the hazard you observed..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="severity" className="block text-gray-700 text-sm font-bold mb-2">
                            Severity Level
                        </label>
                        <select
                            id="severity"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                        >
                            <option>Safe</option>
                            <option>Moderate</option>
                            <option>High Waves</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Location
                        </label>
                        <button 
                            type="button"
                            onClick={handleGetLocation}
                            disabled={isLocating}
                            className="w-full flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            {isLocating ? 'Fetching...' : 'Get Current Location'}
                        </button>
                        {location && (
                            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg flex items-start">
                                <MapPin className="w-4 h-4 mr-2 mt-1 text-gray-500 flex-shrink-0" />
                                <span>{location.name}</span>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
                            Upload Image or Video
                        </label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*,video/*"
                            onChange={handleImageChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            required
                        />
                    </div>

                    {preview && (
                        <div className="mb-6">
                            <p className="text-gray-700 text-sm font-bold mb-2">Media Preview:</p>
                            <img src={preview} alt="Preview" className="rounded-lg w-full" />
                        </div>
                    )}
                    
                    <div className="mb-6">
                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300" disabled={status === 'loading'}>
                            {status === 'loading' ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitReportPage;

