const express = require('express');
const router = express.Router();
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");

// GET - Fetch all categories
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

// POST - Add category
async function CreateCategory(req, res) {
    try {
        const { category } = req.body;

        const existingCategory = await Category.findOne({
            where: {
                category,
            },
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        const newCategory = await Category.create({
            category,
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

// DELETE - Delete category
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

// GET - Fetch all subcategories
async function GetSubCategories(req, res) {
    try {
        const subcategories = await SubCategory.findAll({
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "category"],
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

// POST - Create subcategory
async function CreateSubCategory(req, res) {
    try {
        const { name, categoryId, image, status } = req.body;

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

// PUT - Update subcategory
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

        await subcategory.update({
            name,
            categoryId,
            image,
            status,
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

// DELETE - Delete subcategory
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
    CreateCategory,
    DeleteCategory,
    GetSubCategories,
    CreateSubCategory,
    UpdateSubCategory,
    DeleteSubCategory,
};