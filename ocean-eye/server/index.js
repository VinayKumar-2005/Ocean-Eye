// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');

// Load environment variables FIRST
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize the Express application
const app = express();

// Apply middleware
app.use(cors()); // To allow cross-origin requests
app.use(express.json()); // To parse incoming JSON bodies

// --- THIS IS THE NEW LINE ---
// Serve static files from the "public" folder
app.use(express.static('public'));

// Define Routes
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (req, res) => {
    res.send('Ocean-Eye API is running...');
});

module.exports = app;
