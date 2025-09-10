// /server/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const DatauriParser = require('datauri/parser');
const cloudinary = require('../config/cloudinary'); // Adjust path if needed

// Use memoryStorage so the file is not saved to disk but kept in memory
const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).single('image'); // 'image' is the form field name

const parser = new DatauriParser();

const cloudinaryUpload = (req, res, next) => {
  // Use multer to handle the file upload
  multerUploads(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload failed.', error: err });
    }

    // If no file is provided, just move to the next middleware
    if (!req.file) {
      return next();
    }

    // Convert the file buffer to a Data URI
    const extName = path.extname(req.file.originalname).toString();
    const file64 = parser.format(extName, req.file.buffer);

    // Upload to Cloudinary
    cloudinary.uploader.upload(file64.content, {
        // You can add upload options here, e.g., a folder name
        // folder: 'my-app-uploads' 
    })
    .then((result) => {
        // Attach the Cloudinary response to the request object
        req.cloudinary = result;
        next();
    })
    .catch((error) => {
        return res.status(500).json({ message: 'Cloudinary upload failed.', error: error });
    });
  });
};

module.exports = cloudinaryUpload;
