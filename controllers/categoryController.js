const express = require('express');
const router = express.Router();
const Category = require("../models/Category");

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

module.exports = {
    GetCategories,
    CreateCategory,
    DeleteCategory,
};