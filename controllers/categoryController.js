const express = require('express');
const router = express.Router();
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

// ✅ GET - Fetch all categories
async function GetCategories(req, res) {
    try {
        const categories = await Category.findAll({
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data: categories,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
}

// ✅ NEW: GET - Fetch categories by collection (SAREE or JEWEL)
async function GetCategoriesByCollection(req, res) {
    try {
        const { collection } = req.params;

        if (!collection || !["SAREE", "JEWEL"].includes(collection.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Collection must be either 'SAREE' or 'JEWEL'",
            });
        }

        const categories = await Category.findAll({
            where: {
                collection: collection.toUpperCase(),
            },
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            collection: collection.toUpperCase(),
            data: categories,
            count: categories.length,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch categories",
        });
    }
}

// ✅ POST - Add category
async function CreateCategory(req, res) {
    try {
        const { name, collection } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        if (!collection || !["SAREE", "JEWEL"].includes(collection.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Collection must be either 'SAREE' or 'JEWEL'",
            });
        }

        const existingCategory = await Category.findOne({
            where: {
                name,
                collection: collection.toUpperCase(),
            },
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists in this collection",
            });
        }

        const newCategory = await Category.create({
            name,
            collection: collection.toUpperCase(),
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: newCategory,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to create category",
        });
    }
}

// ✅ DELETE - Delete category
async function DeleteCategory(req, res) {
    try {
        const { id } = req.params;

        const deleted = await Category.destroy({
            where: {
                id,
            },
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to delete category",
        });
    }
}

// ✅ GET - Fetch all subcategories
async function GetSubCategories(req, res) {
    try {
        const subcategories = await SubCategory.findAll({
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "name", "collection"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            data: subcategories,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch subcategories",
        });
    }
}

// ✅ NEW: GET - Fetch subcategories by collection
async function GetSubCategoriesByCollection(req, res) {
    try {
        const { collection } = req.params;

        if (!collection || !["SAREE", "JEWEL"].includes(collection.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: "Collection must be either 'SAREE' or 'JEWEL'",
            });
        }

        const subcategories = await SubCategory.findAll({
            include: [
                {
                    model: Category,
                    as: "category",
                    where: {
                        collection: collection.toUpperCase(),
                    },
                    attributes: ["id", "name", "collection"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            collection: collection.toUpperCase(),
            data: subcategories,
            count: subcategories.length,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch subcategories",
        });
    }
}

// ✅ POST - Create subcategory
async function CreateSubCategory(req, res) {
    try {
        const { name, categoryId, image, status } = req.body;

        if (!name || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "Subcategory name and categoryId are required",
            });
        }

        // Verify category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const existing = await SubCategory.findOne({
            where: {
                name,
                categoryId,
            },
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Subcategory already exists in this category",
            });
        }

        const subcategory = await SubCategory.create({
            name,
            categoryId,
            image,
            status,
        });

        return res.status(201).json({
            success: true,
            message: "Subcategory created successfully",
            data: subcategory,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to create subcategory",
        });
    }
}

// ✅ PUT - Update subcategory
async function UpdateSubCategory(req, res) {
    try {
        const { id } = req.params;
        const { name, categoryId, image, status } = req.body;

        const subcategory = await SubCategory.findByPk(id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
        }

        // Verify new category exists if provided
        if (categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
            }
        }

        await subcategory.update({
            name: name || subcategory.name,
            categoryId: categoryId || subcategory.categoryId,
            image: image || subcategory.image,
            status: status !== undefined ? status : subcategory.status,
        });

        return res.status(200).json({
            success: true,
            message: "Subcategory updated successfully",
            data: subcategory,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to update subcategory",
        });
    }
}

// ✅ DELETE - Delete subcategory
async function DeleteSubCategory(req, res) {
    try {
        const { id } = req.params;

        const deleted = await SubCategory.destroy({
            where: {
                id,
            },
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Subcategory deleted successfully",
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to delete subcategory",
        });
    }
}

module.exports = {
    GetCategories,
    GetCategoriesByCollection,
    CreateCategory,
    DeleteCategory,
    GetSubCategories,
    GetSubCategoriesByCollection,
    CreateSubCategory,
    UpdateSubCategory,
    DeleteSubCategory,
};
