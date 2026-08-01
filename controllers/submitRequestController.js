const { Op } = require('sequelize');
const SubmitRequestModel = require('../models/SubmitRequest');
const Order = require('../models/Orders');
const User = require('../models/User');
const OrderItem = require('../models/OrderItems');

// POST - Submit a new request
async function SubmitRequest(req, res) {
    try {
        const { name, email, phone, subject, message, requestType, orderId } = req.body;
        const { userId } = req.params;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, subject, and message are required',
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'UserId is required!',
            });
        }

        if (message.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Message must be at least 10 characters long',
            });
        }

        // ✅ Validate orderId if provided
        let orderData = null;
        if (orderId) {
            orderData = await Order.findByPk(orderId);

            if (!orderData) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found',
                });
            }

            // Optional: Check if user owns this order
            if (userId && orderData.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only submit requests for your own orders',
                });
            }
        }

        // Create request
        const submitRequest = await SubmitRequestModel.create({
            userId,
            orderId: orderId || null, // ✅ NEW
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? phone.trim() : null,
            subject: subject.trim(),
            message: message.trim(),
            requestType: requestType || 'inquiry',
            attachmentUrl: req.file ? `/uploads/requests/${req.file.filename}` : null,
        });

        // Fetch with associations
        const requestWithAssociations = await SubmitRequestModel.findByPk(
            submitRequest.id,
            {
                include: [
                    {
                        association: 'order',
                        model: Order,
                        attributes: ['id', 'orderNumber', 'subtotal', 'grandTotal', 'status'],
                    },
                ],
            }
        );

        // TODO: Send confirmation email to user

        return res.status(201).json({
            success: true,
            message: 'Your request has been submitted successfully. We will get back to you soon.',
            data: requestWithAssociations,
        });
    } catch (err) {
        console.error('SubmitRequest Error:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to submit request',
            error: err.message,
        });
    }
}

// GET - Get all requests (Admin only)
async function GetAllRequests(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const status = req.query.status || '';
        const requestType = req.query.requestType || '';
        const priority = req.query.priority || '';
        const orderId = req.query.orderId || ''; // ✅ NEW: Filter by orderId

        const where = {};
        if (status) where.status = status;
        if (requestType) where.requestType = requestType;
        if (priority) where.priority = priority;
        if (orderId) where.orderId = orderId; // ✅ NEW

        const { count, rows } = await SubmitRequestModel.findAndCountAll({
            where,
            include: [
                {
                    association: 'user',
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    required: false,
                },
                {
                    // ✅ NEW: Include order details
                    association: 'order',
                    model: Order,
                    attributes: ['id', 'orderNumber', 'subtotal', 'grandTotal', 'status', 'createdAt'],
                    required: false,
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return res.status(200).json({
            success: true,
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            data: rows,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch requests',
            error: err.message,
        });
    }
}

// GET - Get request by ID
async function GetRequestById(req, res) {
    try {
        const { userId } = req.params;

        const request = await SubmitRequestModel.findAll({
            where: { userId },
            include: [
                {
                    association: 'user',
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    required: false,
                },
                {
                    // ✅ NEW: Include order details
                    association: 'order',
                    model: Order,
                    attributes: ['id', 'orderNumber', 'subtotal', 'grandTotal', 'status', 'createdAt'],
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                            attributes: ['productName', 'sku', 'color', 'quantity', 'price'],
                        },
                    ],
                    required: false,
                },
            ],
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: request,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch request',
            error: err.message,
        });
    }
}

// GET - Get request by ID
async function GetRequestAdminById(req, res) {
    try {
        const { id } = req.params;

        const request = await SubmitRequestModel.findByPk(id, {
            include: [
                {
                    association: 'user',
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    required: false,
                },
                {
                    // ✅ NEW: Include order details
                    association: 'order',
                    model: Order,
                    attributes: ['id', 'orderNumber', 'subtotal', 'grandTotal', 'status', 'createdAt'],
                    include: [
                        {
                            model: OrderItem,
                            as: 'items',
                            attributes: ['productName', 'sku', 'color', 'quantity', 'price'],
                        },
                    ],
                    required: false,
                },
            ],
        });

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        return res.status(200).json({
            success: true,
            data: request,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch request',
            error: err.message,
        });
    }
}

// PUT - Update request status (Admin only)
async function UpdateRequestStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, priority, adminNotes } = req.body;

        const request = await SubmitRequestModel.findByPk(id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        const validStatuses = ['pending', 'in_progress', 'resolved', 'rejected'];
        const validPriorities = ['low', 'medium', 'high'];

        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
            });
        }

        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority',
            });
        }

        await request.update({
            status: status || request.status,
            priority: priority || request.priority,
            adminNotes: adminNotes || request.adminNotes,
        });

        return res.status(200).json({
            success: true,
            message: 'Request updated successfully',
            data: request,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to update request',
            error: err.message,
        });
    }
}

// DELETE - Delete request
async function DeleteRequest(req, res) {
    try {
        const { id } = req.params;

        const deleted = await SubmitRequestModel.destroy({
            where: { id },
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Request not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Request deleted successfully',
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete request',
            error: err.message,
        });
    }
}

// ✅ NEW: Get requests for a specific order
async function GetRequestsByOrderId(req, res) {
    try {
        const { orderId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await SubmitRequestModel.findAndCountAll({
            where: { orderId },
            include: [
                {
                    association: 'user',
                    model: User,
                    attributes: ['id', 'name', 'email'],
                    required: false,
                },
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
        });

        return res.status(200).json({
            success: true,
            total: count,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            data: rows,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch order requests',
            error: err.message,
        });
    }
}

module.exports = {
    SubmitRequest,
    GetAllRequests,
    GetRequestById,
    GetRequestAdminById,
    UpdateRequestStatus,
    DeleteRequest,
    GetRequestsByOrderId, // ✅ NEW
};