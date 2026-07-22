const Product = require("../models/Products");
const Category = require("../models/Category");
const supabase = require("../config/supabase");
const SubCategory = require("../models/SubCategory");
const ProductAttribute = require("../models/ProductAttributes");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/mysqldb");

// const fs = require("fs");
// const path = require("path");

async function GetProducts(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "category"],
                },
                {
                    model: SubCategory,
                    as: "subcategory",
                    attributes: ["id", "name"],
                },
                {
                    model: ProductAttribute,
                    as: "attributes",
                    attributes: [
                        "id",
                        "color",
                        "image_url",
                        "sku",
                        "fabric",
                        "work",
                        "blouseLength",
                        "occasion",
                        "metal",
                        "purity",
                        "stone",
                        "weight",
                        "size",
                    ],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        return res.status(200).json({
            success: true,
            products: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            total: count,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
}

async function CreateProduct(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const {
            name,
            desc,
            discount,
            price,
            offerPrice,
            categoryId,
            subcategoryId,
            slug,
            loom,
            status,
            isFeatured,
            isNewArrival,
            variants = [],
        } = req.body;

        let imageUrl = "";

        if (req.files) {
            const fileName = `${Date.now()}-${req.files.originalname}`;

            const uploadPath = path.join(
                __dirname,
                "../public/uploads",
                fileName
            );

            fs.writeFileSync(uploadPath, req.files.buffer);

            imageUrl = `/uploads/${fileName}`;
        }

        const product = await Product.create(
            {
                name,
                desc,
                discount,
                price,
                offerPrice,
                categoryId,
                subcategoryId,
                loom,
                status,
                slug,
                isFeatured,
                isNewArrival,
            },
            { transaction }
        );

        if (Array.isArray(variants) && variants.length > 0) {
            const attributes = variants.map((variant, index) => ({
                productId: product.id,
                sku: variant.sku || null,
                color: variant.color || null,
                fabric: variant.fabric || null,
                work: variant.work || null,
                blouseLength: variant.blouseLength || null,
                occasion: variant.occasion || null,
                metal: variant.metal || null,
                purity: variant.purity || null,
                stone: variant.stone || null,
                weight: variant.weight || null,
                size: variant.size || null,
                image_url: req.files[index]
                    ? `/uploads/${req.files[index].filename}`
                    : null
            }));

            await ProductAttribute.bulkCreate(attributes, {
                transaction,
            });
        }

        await transaction.commit();

        const createdProduct = await Product.findByPk(product.id, {
            include: [
                {
                    model: Category,
                    as: "category",
                },
                {
                    model: SubCategory,
                    as: "subcategory",
                },
                {
                    model: ProductAttribute,
                    as: "attributes",
                },
            ],
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: createdProduct,
        });
    } catch (err) {
        await transaction.rollback();

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
}

async function UpdateProduct(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            await transaction.rollback();

            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const {
            name,
            desc,
            discount,
            price,
            offerPrice,
            categoryId,
            subcategoryId,
            slug,
            loom,
            status,
            isFeatured,
            isNewArrival,
            variants = [],
        } = req.body;

        // Get one existing variant only to preserve/delete the old image
        const existingAttribute = await ProductAttribute.findOne({
            where: {
                productId: id,
            },
            transaction,
        });

        let imageUrl = existingAttribute?.image_url || "";

        if (req.files) {
            // Delete old image
            if (existingAttribute?.image_url) {
                const oldImage = path.join(
                    __dirname,
                    "../public",
                    existingAttribute.image_url
                );

                if (fs.existsSync(oldImage)) {
                    fs.unlinkSync(oldImage);
                }
            }

            const fileName = `${Date.now()}-${req.files.originalname}`;

            const uploadPath = path.join(
                __dirname,
                "../public/uploads",
                fileName
            );

            fs.writeFileSync(uploadPath, req.files.buffer);

            imageUrl = `/uploads/${fileName}`;
        }

        // Update product
        await product.update(
            {
                name,
                desc,
                discount,
                price,
                offerPrice,
                categoryId,
                subcategoryId,
                loom,
                status,
                slug,
                isFeatured,
                isNewArrival,
            },
            { transaction }
        );

        // Remove old variants
        await ProductAttribute.destroy({
            where: {
                productId: id,
            },
            transaction,
        });

        // Insert new variants
        if (Array.isArray(variants) && variants.length > 0) {
            const attributes = variants.map((variant, index) => ({
                productId: id,
                sku: variant.sku || null,
                color: variant.color || null,
                fabric: variant.fabric || null,
                work: variant.work || null,
                blouseLength: variant.blouseLength || null,
                occasion: variant.occasion || null,
                metal: variant.metal || null,
                purity: variant.purity || null,
                stone: variant.stone || null,
                weight: variant.weight || null,
                size: variant.size || null,
                image_url: req.files[index]
                    ? `/uploads/${req.files[index].filename}`
                    : null
            }));

            await ProductAttribute.bulkCreate(attributes, {
                transaction,
            });
        }

        await transaction.commit();

        const updatedProduct = await Product.findByPk(id, {
            include: [
                {
                    model: Category,
                    as: "category",
                },
                {
                    model: SubCategory,
                    as: "subcategory",
                },
                {
                    model: ProductAttribute,
                    as: "attributes",
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct,
        });

    } catch (err) {
        await transaction.rollback();

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to update product",
        });
    }
}

async function DeleteProduct(req, res) {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            await transaction.rollback();

            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        const attributes = await ProductAttribute.findAll({
            where: {
                productId: id
            }
        });

        // Delete image from local storage
        let imagePath = null;

        if (attributes?.image_url) {
            imagePath = path.join(
                __dirname,
                "../public",
                attributes.image_url
            );
        }

        await product.destroy({ transaction });

        await transaction.commit();

        if (imagePath && fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (err) {
        await transaction.rollback();

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to delete product",
        });
    }
}

module.exports = {
    GetProducts,
    CreateProduct,
    UpdateProduct,
    DeleteProduct,
};