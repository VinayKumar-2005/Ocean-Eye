const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = 'public/uploads/';

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up storage engine for where to save the files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // The path is now relative to the server's root directory
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    // Create a unique filename to avoid name conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Initialize the upload middleware with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload;

