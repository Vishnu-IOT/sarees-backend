const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    SubmitRequest,
    GetAllRequests,
    GetRequestById,
    UpdateRequestStatus,
    DeleteRequest,
    GetRequestsByOrderId,
    GetRequestAdminById, // ✅ NEW
} = require('../controllers/submitRequestController');

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/requests');
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
        const allowedMimes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images, PDFs, and documents are allowed'));
        }
    },
});

// Public routes
router.post('/create-submit-request/:userId', upload.single('attachment'), SubmitRequest);

// Admin routes
router.get('/get-request', GetAllRequests);
router.get('/reqeust-by-id/:userId', GetRequestById);
router.get('/admin-reqeust-by-id/:id', GetRequestAdminById);
router.put('/update-request/:id', UpdateRequestStatus);
router.delete('/delete-request/:id', DeleteRequest);

// ✅ NEW: Get requests for specific order
router.get('/orders-request/:orderId', GetRequestsByOrderId);

module.exports = router;