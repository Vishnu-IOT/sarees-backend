const Product = require("../models/Products");
const Category = require("../models/Category");
const supabase = require("../config/supabase");
const SubCategory = require("../models/SubCategory");
const ProductAttribute = require("../models/ProductAttributes");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/mysqldb");

// ✅ Get base URL from environment or construct it
const getBaseUrl = (req) => {
    return process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
};

// ✅ Function to add full URL to image_url
const addFullImageUrls = (products, baseUrl) => {
    return products.map((product) => {
        const productData = product.toJSON ? product.toJSON() : product;

        if (productData.attributes && Array.isArray(productData.attributes)) {
            productData.attributes = productData.attributes.map((attr) => ({
                ...attr,
                image_url: attr.image_url ? `${baseUrl}${attr.image_url}` : null,
            }));
        }

        return productData;
    });
};

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

        // ✅ Add full URLs to responses
        const baseUrl = getBaseUrl(req);
        const productsWithFullUrls = addFullImageUrls(rows, baseUrl);

        return res.status(200).json({
            success: true,
            products: productsWithFullUrls,
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

        if (req.file) {
            const fileName = `${Date.now()}-${req.file.originalname}`;

            const uploadPath = path.join(
                __dirname,
                "../public/uploads",
                fileName
            );

            fs.writeFileSync(uploadPath, req.file.buffer);

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
                image_url: imageUrl,
            },
            { transaction }
        );

        // Parse variants if it comes as JSON string from FormData
        let variantsArray = variants;
        if (typeof variantsArray === "string") {
            try {
                variantsArray = JSON.parse(variantsArray);
            } catch (e) {
                console.error("Error parsing variants:", e);
                variantsArray = [];
            }
        }

        // Ensure variants is an array
        if (!Array.isArray(variantsArray)) {
            variantsArray = [];
        }

        if (variantsArray.length > 0) {
            const attributes = variantsArray.map((variant, index) => {
                let variantImageUrl = null;

                // If files array exists and has file for this variant
                if (req.files && req.files[index]) {
                    const fileName = `${Date.now()}-${index}-${req.files[index].originalname}`;
                    const uploadPath = path.join(
                        __dirname,
                        "../public/uploads",
                        fileName
                    );

                    fs.writeFileSync(uploadPath, req.files[index].buffer);
                    variantImageUrl = `/uploads/${fileName}`;
                }

                return {
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
                    image_url: variantImageUrl,
                };
            });

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

        // ✅ Add full URLs to response
        const baseUrl = getBaseUrl(req);
        const productWithFullUrls = addFullImageUrls([createdProduct], baseUrl)[0];

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: productWithFullUrls,
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

        let {
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

        // Parse variants if it comes as JSON string
        if (typeof variants === "string") {
            try {
                variants = JSON.parse(variants);
            } catch (e) {
                console.error("Error parsing variants:", e);
                variants = [];
            }
        }

        if (!Array.isArray(variants)) {
            variants = [];
        }

        let mainImageUrl = product.image_url;

        if (req.file) {
            if (product.image_url) {
                const oldImage = path.join(__dirname, "../public", product.image_url);

                if (fs.existsSync(oldImage)) {
                    fs.unlinkSync(oldImage);
                }
            }

            const fileName = `${Date.now()}-${req.file.originalname}`;
            const uploadPath = path.join(
                __dirname,
                "../public/uploads",
                fileName
            );

            fs.writeFileSync(uploadPath, req.file.buffer);
            mainImageUrl = `/uploads/${fileName}`;
        }

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
                image_url: mainImageUrl,
            },
            { transaction }
        );

        const oldAttributes = await ProductAttribute.findAll({
            where: { productId: id },
            transaction,
        });

        oldAttributes.forEach((attr) => {
            if (attr.image_url) {
                const oldImage = path.join(__dirname, "../public", attr.image_url);

                if (fs.existsSync(oldImage)) {
                    fs.unlinkSync(oldImage);
                }
            }
        });

        await ProductAttribute.destroy({
            where: { productId: id },
            transaction,
        });

        if (variants.length > 0) {
            const attributes = variants.map((variant, index) => {
                let variantImageUrl = null;

                if (req.files && req.files[index]) {
                    const fileName = `${Date.now()}-${index}-${req.files[index].originalname}`;
                    const uploadPath = path.join(
                        __dirname,
                        "../public/uploads",
                        fileName
                    );

                    fs.writeFileSync(uploadPath, req.files[index].buffer);
                    variantImageUrl = `/uploads/${fileName}`;
                }

                return {
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
                    image_url: variantImageUrl,
                };
            });

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

        // ✅ Add full URLs to response
        const baseUrl = getBaseUrl(req);
        const productWithFullUrls = addFullImageUrls([updatedProduct], baseUrl)[0];

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: productWithFullUrls,
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
                productId: id,
            },
        });

        await product.destroy({ transaction });

        await transaction.commit();

        // Delete main product image
        if (product.image_url) {
            const imagePath = path.join(__dirname, "../public", product.image_url);

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        // Delete all variant images
        attributes.forEach((attr) => {
            if (attr.image_url) {
                const imagePath = path.join(__dirname, "../public", attr.image_url);

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        });

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