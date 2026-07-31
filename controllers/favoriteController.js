const db = require('../models');
const Product = require('../models/Products');
const User = require('../models/User');
const Favorite = require('../models/Favourites');
const ProductAttribute = require('../models/ProductAttributes');


// Add to favorites
async function AddToFavorite(req, res) {
    try {
        const { userId, productId, productType } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId required'
            });
        }

        if (!productId || !productType) {
            return res.status(400).json({
                success: false,
                message: 'productId and productType required'
            });
        }

        if (!['SAREE', 'JEWEL'].includes(productType)) {
            return res.status(400).json({
                success: false,
                message: 'productType must be SAREE or JEWEL'
            });
        }

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if already favorited
        const existingFavorite = await Favorite.findOne({
            where: { userId, productId, productType }
        });

        if (existingFavorite) {
            return res.status(409).json({
                success: false,
                message: 'Already in favorites'
            });
        }

        const favorite = await Favorite.create({
            userId,
            productId,
            productType
        });

        return res.status(201).json({
            success: true,
            message: 'Added to favorites',
            data: favorite
        });
    } catch (err) {
        console.error('Error adding favorite:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to add favorite',
            error: err.message
        });
    }
}

// Remove from favorites
async function RemoveFromFavorite(req, res) {
    try {
        const { productId, userId, productType } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId query param required'
            });
        }

        if (!productType) {
            return res.status(400).json({
                success: false,
                message: 'productType query param required'
            });
        }

        const deleted = await Favorite.destroy({
            where: { userId, productId, productType }
            // where: { userId, productId }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Favorite not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Removed from favorites'
        });
    } catch (err) {
        console.error('Error removing favorite:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to remove favorite',
            error: err.message
        });
    }
}

// Get user's favorites
async function GetMyFavorites(req, res) {
    try {
        const { userId, productType } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId query param required'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        let where = { userId };
        if (productType) {
            where.productType = productType;
        }

        const { count, rows } = await Favorite.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'price', 'offerPrice', 'collection'],
                    include: [
                        {
                            model: ProductAttribute,
                            as: 'attributes', // Use your association alias
                            attributes: ['image_url'],
                            limit: 1,
                            order: [['id', 'ASC']],
                            separate: true
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset,
            distinct: true
        });

        if (rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No favorites found',
                userId,
                data: [],
                currentPage: page,
                totalPages: 0,
                total: 0
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Favorites fetched successfully',
            userId,
            data: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            total: count
        });
    } catch (err) {
        console.error('Error fetching favorites:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch favorites',
            error: err.message
        });
    }
}

// Check if product is favorited
async function CheckIsFavorited(req, res) {
    try {
        const { productId, userId, productType } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId query param required'
            });
        }

        if (!productType) {
            return res.status(400).json({
                success: false,
                message: 'productType query param required'
            });
        }

        const isFavorited = await Favorite.findOne({
            where: { userId, productId, productType }
        });

        return res.status(200).json({
            success: true,
            productId: parseInt(productId),
            isFavorited: !!isFavorited
        });
    } catch (err) {
        console.error('Error checking favorite:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to check favorite',
            error: err.message
        });
    }
}

// Get favorites count for a product
async function GetFavoritesCount(req, res) {
    try {
        const { productId, productType } = req.query;

        if (!productType) {
            return res.status(400).json({
                success: false,
                message: 'productType query param required'
            });
        }

        const count = await Favorite.count({
            where: { productId, productType }
        });

        return res.status(200).json({
            success: true,
            productId: parseInt(productId),
            favoriteCount: count
        });
    } catch (err) {
        console.error('Error getting count:', err);
        return res.status(500).json({
            success: false,
            message: 'Failed to get count',
            error: err.message
        });
    }
}

module.exports = {
    AddToFavorite,
    RemoveFromFavorite,
    GetMyFavorites,
    CheckIsFavorited,
    GetFavoritesCount
};