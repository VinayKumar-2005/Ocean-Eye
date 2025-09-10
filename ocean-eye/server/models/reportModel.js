const mongoose = require('mongoose');

const reportSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        description: { type: String, required: true },
        severity: { type: String, required: true },
        location: { type: String, required: true },
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
        image: { type: String, required: true }, // Image is required for analysis
        aiAnalysis: { type: Object }, // To store results from the AI model
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
