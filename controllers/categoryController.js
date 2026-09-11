const express = require('express');
const router = express.Router();
const Category = require("../models/Category");
const SubCategory = require("../models/SubCategory");
const Product = require("../models/Products");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const {
    toFullImageUrl,
    toRelativeImageUrl,
} = require("../utils/imageUrl");

// ✅ GET - Fetch all categories
const { fn, col } = require("sequelize");

// ✅ Helper: attach a full, loadable image URL onto one or many subcategories
const withFullImageUrl = (subcategories) => {
    const list = Array.isArray(subcategories) ? subcategories : [subcategories];

    const mapped = list.map((sub) => {
        const data = sub.toJSON ? sub.toJSON() : sub;
        return {
            ...data,
            image: toFullImageUrl(data.image),
        };
    });

    return Array.isArray(subcategories) ? mapped : mapped[0];
};

// ✅ Helper: save an uploaded subcategory image (multer memoryStorage) to disk
// and return the RELATIVE path that should be stored in the database.
const saveSubCategoryImage = (file) => {
    if (!file) return null;

    const fileExt = file.originalname.split(".").pop();
    const uniqueId = crypto.randomUUID();
    const fileName = `subcategories/${uniqueId}.${fileExt}`;
    const uploadPath = path.join(__dirname, "../public/uploads", fileName);

    fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
    fs.writeFileSync(uploadPath, file.buffer);

    return `/uploads/${fileName}`;
};

// ✅ Helper: delete a previously stored subcategory image from disk (best-effort)
const deleteSubCategoryImageFile = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith("http")) return;

    const filePath = path.join(
        __dirname,
        "../public",
        relativeUrl.replace(/^\/+/, "")
    );

    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("Failed to delete old subcategory image:", err);
    }
};

// ✅ Optional status filter — pass ?status=active or ?status=inactive on any
// listing endpoint to filter. Omit it (or pass anything else) to get
// everything, exactly like before — fully backwards compatible.
const buildStatusFilter = (req) => {
    const { status } = req.query;
    return ["active", "inactive"].includes(status) ? { status } : {};
};

async function GetCategories(req, res) {
    try {
        const categories = await Category.findAll({
            where: buildStatusFilter(req),
            attributes: {
                include: [
                    [fn("COUNT", col("subcategories.id")), "subcategoryCount"],
                ],
            },
            include: [
                {
                    model: SubCategory,
                    as: "subcategories",
                    attributes: [],
                },
            ],
            group: ["Category.id"],
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
                ...buildStatusFilter(req),
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
        const { name, collection, status } = req.body;

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

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive",
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
            status: status || "active",
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

// ✅ PUT - Update Category
async function UpdateCategory(req, res) {
    try {
        const { id } = req.params;
        const { name, collection, status } = req.body;

        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        await category.update({
            name: name || category.name,
            collection: collection
                ? collection.toUpperCase()
                : category.collection,
            status: status || category.status,
        });

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to update Category",
        });
    }
}

// ✅ GET - Update category status
async function UpdateCategoryStatus(req, res) {
    try {
        const { id, status } = req.query;

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive",
            });
        }

        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        await category.update({ status });

        return res.status(200).json({
            success: true,
            message: `Category ${status} successfully`,
            data: category,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to update category status",
        });
    }
}

// ✅ DELETE - Delete category
async function DeleteCategory(req, res) {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // ✅ Products reference categories with an ON DELETE RESTRICT
        // constraint — deleting a category that still has products always
        // fails at the database level. Check first so we can return a
        // clear, actionable message instead of a generic 500.
        const productCount = await Product.count({ where: { categoryId: id } });

        if (productCount > 0) {
            return res.status(409).json({
                success: false,
                message: `Cannot delete this category — ${productCount} product(s) are still assigned to it. Move or delete those products first.`,
            });
        }

        // Subcategories are set to cascade-delete with their category, so
        // no need to block on those.
        await category.destroy();

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (err) {
        console.error(err);

        // ✅ Fallback safety net in case a foreign key constraint fires for
        // a reason we didn't pre-check (e.g. DB schema drift).
        if (err.name === "SequelizeForeignKeyConstraintError") {
            return res.status(409).json({
                success: false,
                message:
                    "Cannot delete this category because other records (products or subcategories) still reference it.",
            });
        }

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
            where: buildStatusFilter(req),
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
            data: withFullImageUrl(subcategories),
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
            where: buildStatusFilter(req),
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
            data: withFullImageUrl(subcategories),
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

// ✅ NEW: GET - Fetch subcategories by category ID
async function GetSubCategoriesByCategoryId(req, res) {
    try {
        const { categoryId } = req.params;

        const subcategories = await SubCategory.findAll({
            where: {
                categoryId,
                ...buildStatusFilter(req),
            },
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
            data: withFullImageUrl(subcategories),
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
        const { name, categoryId, status } = req.body;
        // Allow either a real uploaded file (req.file, field name "image")
        // or a plain URL/path string in the body (backwards compatible).
        let { image } = req.body;

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

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive",
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

        // ✅ If a file was uploaded, save it to disk and store the relative path
        if (req.file) {
            image = saveSubCategoryImage(req.file);
        } else if (image) {
            // Frontend may have sent back a full URL — normalize to relative
            image = toRelativeImageUrl(image);
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
            data: withFullImageUrl(subcategory),
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
        const { name, categoryId, status } = req.body;
        let { image } = req.body;

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

        // ✅ New file uploaded — replace the old one on disk
        if (req.file) {
            deleteSubCategoryImageFile(subcategory.image);
            image = saveSubCategoryImage(req.file);
        } else if (image) {
            image = toRelativeImageUrl(image);
        } else {
            image = subcategory.image;
        }

        await subcategory.update({
            name: name || subcategory.name,
            categoryId: categoryId || subcategory.categoryId,
            image,
            status: status !== undefined ? status : subcategory.status,
        });

        return res.status(200).json({
            success: true,
            message: "Subcategory updated successfully",
            data: withFullImageUrl(subcategory),
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to update subcategory",
        });
    }
}
// ✅ GET - Update subcategory status
async function UpdateSubCategoryStatus(req, res) {
    try {
        const { id, status } = req.query;

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive",
            });
        }

        const subcategory = await SubCategory.findByPk(id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
        }

        await subcategory.update({ status });

        return res.status(200).json({
            success: true,
            message: `Subcategory ${status} successfully`,
            data: withFullImageUrl(subcategory),
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to update subcategory status",
        });
    }
}

// ✅ DELETE - Delete subcategory
async function DeleteSubCategory(req, res) {
    try {
        const { id } = req.params;

        const subcategory = await SubCategory.findByPk(id);

        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
        }

        // Products keep their subcategoryId nullable and SET NULL on delete,
        // so deleting a subcategory is normally safe even if products use
        // it — but guard against schema drift with a friendly message.
        const productCount = await Product.count({
            where: { subcategoryId: id },
        });

        await subcategory.destroy();

        // Clean up the stored image file on disk (best-effort)
        deleteSubCategoryImageFile(subcategory.image);

        return res.status(200).json({
            success: true,
            message:
                productCount > 0
                    ? `Subcategory deleted successfully. ${productCount} product(s) that used it now have no subcategory.`
                    : "Subcategory deleted successfully",
        });
    } catch (err) {
        console.error(err);

        if (err.name === "SequelizeForeignKeyConstraintError") {
            return res.status(409).json({
                success: false,
                message:
                    "Cannot delete this subcategory because products still reference it. Reassign those products first.",
            });
        }

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
    UpdateCategory,
    UpdateCategoryStatus,
    DeleteCategory,
    GetSubCategories,
    GetSubCategoriesByCollection,
    GetSubCategoriesByCategoryId,
    CreateSubCategory,
    UpdateSubCategory,
    UpdateSubCategoryStatus,
    DeleteSubCategory,
};
