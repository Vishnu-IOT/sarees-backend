const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
    SubmitRequest,
    GetAllRequests,
    GetRequestById,
    UpdateRequestStatus,
    DeleteRequest,
    GetRequestsByOrderId,
    GetRequestAdminById, // ✅ NEW
} = require('../controllers/submitRequestController');

// ✅ Use an absolute path (independent of process.cwd()) and make sure the
// folder actually exists — multer's diskStorage does NOT create missing
// directories on its own, and this was silently failing every attachment
// upload with an ENOENT error before.
const requestsUploadDir = path.join(__dirname, '../public/uploads/requests');

if (!fs.existsSync(requestsUploadDir)) {
    fs.mkdirSync(requestsUploadDir, { recursive: true });
    console.log('✅ Created uploads directory:', requestsUploadDir);
}

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, requestsUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + file.originalname;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // ✅ Added modern .docx mimetype — the old list only allowed the
        // legacy .doc mimetype, so real Word documents (.docx) from any
        // modern version of Word were silently rejected.
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and documents (.doc/.docx) are allowed'));
        }
    },
});

// Public routes
router.post('/create-submit-request/:userId', upload.single('attachment'), SubmitRequest);

// Admin routes
router.get('/get-request', GetAllRequests);
router.get('/reqeust-by-id/:userId', GetRequestById);
router.get('/admin-reqeust-by-id/:id', GetRequestAdminById);
router.post('/update-request/:id', UpdateRequestStatus);
router.get('/delete-request/:id', DeleteRequest);

// ✅ NEW: Get requests for specific order
router.get('/orders-request/:orderId', GetRequestsByOrderId);

module.exports = router;