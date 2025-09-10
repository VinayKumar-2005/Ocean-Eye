const Report = require('../models/reportModel');
const User = require('../models/userModel');
const axios = require('axios');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 }).populate('user', 'name');
        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
    const { description, severity, lat, lon, location } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image or video' });
    }

    try {
        const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        const aiResponse = await axios.post('http://localhost:5001/analyze', {
            media_url: mediaUrl,
            media_type: req.file.mimetype,
        });

        const report = await Report.create({
            description,
            severity,
            lat,
            lon,
            location,
            user: req.user.id,
            image: mediaUrl,
            aiAnalysis: aiResponse.data,
        });

        const newReport = await Report.findById(report._id).populate('user', 'name');
        res.status(201).json(newReport);

    } catch (error) {
        console.error("Error creating report:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Server error during report creation.' });
    }
};

module.exports = { getReports, createReport };