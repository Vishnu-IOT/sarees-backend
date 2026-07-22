// middlewares/upload.js

const multer = require("multer");
const path = require("path");

// ✅ Use memory storage to process in controller
const storage = multer.memoryStorage();

// ✅ Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
    },
    fileFilter: (req, file, cb) => {
        // ✅ Accept only image files
        const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed"));
        }
    },
});

module.exports = upload;