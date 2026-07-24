const Product = require("../models/Products");
const Category = require("../models/Category");
const supabase = require("../config/supabase");
const SubCategory = require("../models/SubCategory");
const ProductAttribute = require("../models/ProductAttributes");
const fs = require("fs");
const path = require("path");
const sequelize = require("../config/mysqldb");
const { Op } = require("sequelize");
const crypto = require("crypto");

// ✅ Get base URL from environment or construct it
const getBaseUrl = (req) => {
    return process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
};

// ✅ Function to add full URL to image_url
const addFullImageUrls = (products, baseUrl) => {
    return products.map((product) => {
        const productData = product.toJSON ? product.toJSON() : product;

        // Prefix the main product cover image
        if (productData.image_url && !productData.image_url.startsWith("http")) {
            productData.image_url = `${baseUrl}${productData.image_url}`;
        }

        if (productData.attributes && Array.isArray(productData.attributes)) {
            productData.attributes = productData.attributes.map((attr) => ({
                ...attr,
                image_url: attr.image_url ? `${baseUrl}${attr.image_url}` : null,
            }));
        }

        return productData;
    });
};

// ✅ Helper: strip the baseUrl back off an image_url the frontend sent us,
// so we always store/compare relative paths ("/uploads/xyz.jpg") internally.
const toRelativeImageUrl = (url, baseUrl) => {
    if (!url) return null;
    if (baseUrl && url.startsWith(baseUrl)) {
        return url.slice(baseUrl.length);
    }
    return url;
};

// ✅ Get all products (existing function - now filters by collection optionally)
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
                    attributes: ["id", "name", "collection"],
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

// ✅ NEW: Get only SAREE products
async function GetSarees(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            where: {
                collection: "SAREE",
                status: "active",
            },
            include: [
                {
                    model: Category,
                    as: "category",
                    where: { collection: "SAREE" },
                    attributes: ["id", "name", "collection"],
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
            collection: "SAREE",
            products: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            total: count,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch sarees",
        });
    }
}

// ✅ NEW: Get only JEWEL products
async function GetJewels(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 8;
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            where: {
                collection: "JEWEL",
                status: "active",
            },
            include: [
                {
                    model: Category,
                    as: "category",
                    where: { collection: "JEWEL" },
                    attributes: ["id", "name", "collection"],
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
            collection: "JEWEL",
            products: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            total: count,
        });
    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch jewels",
        });
    }
}

// ✅ NEW: Get all LOOM products (products tagged with loom: true)
async function GetLoomProducts(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const offset = (page - 1) * limit;

        const { count, rows } = await Product.findAndCountAll({
            where: {
                loom: true,
            },
            include: [
                {
                    model: Category,
                    as: "category",
                    attributes: ["id", "name", "collection"],
                },
                {
                    model: SubCategory,
                    as: "subcategory",
                    attributes: ["id", "name"],
                },
                {
                    model: ProductAttribute,
                    as: "attributes",
                },
            ],
            order: [["createdAt", "DESC"]],
            limit,
            offset,
            distinct: true,
        });

        const baseUrl = getBaseUrl(req);
        const productsWithFullUrls = addFullImageUrls(rows, baseUrl);

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
            message: "Failed to fetch loom products",
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
            collection,
            loom,
            status,
            isFeatured,
            isNewArrival,
            variants = [],
        } = req.body;

        const finalCollection = (collection && ["SAREE", "JEWEL"].includes(collection.toUpperCase()))
            ? collection.toUpperCase()
            : "SAREE";

        let imageUrl = "";

        // Main product cover image — sent as field name "mainImage"
        // const mainImageFile = req.files?.mainImage?.[0];
        // if (mainImageFile) {
        //     const fileName = `${Date.now()}-${mainImageFile.originalname}`;
        //     const uploadPath = path.join(__dirname, "../public/uploads", fileName);
        //     fs.writeFileSync(uploadPath, mainImageFile.buffer);
        //     imageUrl = `/uploads/${fileName}`;
        // }

        const mainImageFile = req.files?.mainImage?.[0];

        if (mainImageFile) {
            const fileExt = mainImageFile.originalname.split(".").pop();
            const uniqueId = crypto.randomUUID();

            const fileName = `products/main-${uniqueId}.${fileExt}`;

            const { error } = await supabase.storage
                .from("uploads")
                .upload(fileName, mainImageFile.buffer, {
                    contentType: mainImageFile.mimetype,
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data } = supabase.storage
                .from("uploads")
                .getPublicUrl(fileName);

            imageUrl = data.publicUrl;
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
                collection: finalCollection,
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
            let fileIndex = 0;

            // Variant images are under req.files.variantImages
            const variantFiles = req.files?.variantImages || [];

            // const attributes = variantsArray.map((variant) => {
            //     // let variantImageUrl = null;

            //     const hasImage = Boolean(variant.hasImage);
            //     // if (hasImage && variantFiles[fileIndex]) {
            //     //     const variantFile = variantFiles[fileIndex];
            //     //     const fileName = `${Date.now()}-${variantFile.originalname}`;
            //     //     const uploadPath = path.join(__dirname, "../public/uploads", fileName);
            //     //     fs.writeFileSync(uploadPath, variantFile.buffer);
            //     //     variantImageUrl = `/uploads/${fileName}`;
            //     //     fileIndex++;
            //     // }

            //     let variantImageUrl = null;

            //     if (hasImage && variantFiles[fileIndex]) {
            //         const variantFile = variantFiles[fileIndex];

            //         const fileExt = variantFile.originalname.split(".").pop();
            //         const uniqueId = crypto.randomUUID();

            //         const fileName = `products/variant-${uniqueId}.${fileExt}`;

            //         const { error } = await supabase.storage
            //             .from("uploads")
            //             .upload(fileName, variantFile.buffer, {
            //                 contentType: variantFile.mimetype,
            //                 upsert: false,
            //             });

            //         if (error) {
            //             throw error;
            //         }

            //         const { data } = supabase.storage
            //             .from("uploads")
            //             .getPublicUrl(fileName);

            //         variantImageUrl = data.publicUrl;

            //         fileIndex++;
            //     }

            //     return {
            //         productId: product.id,
            //         sku: variant.sku || null,
            //         color: variant.color || null,
            //         fabric: variant.fabric || null,
            //         work: variant.work || null,
            //         blouseLength: variant.blouseLength || null,
            //         occasion: variant.occasion || null,
            //         metal: variant.metal || null,
            //         purity: variant.purity || null,
            //         stone: variant.stone || null,
            //         weight: variant.weight || null,
            //         size: variant.size || null,
            //         image_url: variantImageUrl,
            //     };
            // });

            const attributes = [];

            for (const variant of variantsArray) {
                let variantImageUrl = null;

                const hasImage = Boolean(variant.hasImage);

                if (hasImage && variantFiles[fileIndex]) {
                    const file = variantFiles[fileIndex];

                    const fileExt = file.originalname.split(".").pop();
                    const uniqueId = crypto.randomUUID();
                    const fileName = `products/variant-${uniqueId}.${fileExt}`;

                    const { error } = await supabase.storage
                        .from("uploads")
                        .upload(fileName, file.buffer, {
                            contentType: file.mimetype,
                            upsert: false,
                        });

                    if (error) throw error;

                    const { data } = supabase.storage
                        .from("uploads")
                        .getPublicUrl(fileName);

                    variantImageUrl = data.publicUrl;
                    fileIndex++;
                }

                attributes.push({
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
                });
            }

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
        const {
            name,
            desc,
            discount,
            price,
            offerPrice,
            categoryId,
            subcategoryId,
            slug,
            collection,
            loom,
            status,
            isFeatured,
            isNewArrival,
            variants = "[]",
        } = req.body;

        const product = await Product.findByPk(id, { transaction });

        if (!product) {
            await transaction.rollback();

            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Validate collection if provided
        if (collection && !["SAREE", "JEWEL"].includes(collection)) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: "Collection must be either 'SAREE' or 'JEWEL'",
            });
        }

        let variantsObj;
        if (typeof variants === "string") {
            try {
                variantsObj = JSON.parse(variants);
            } catch (e) {
                console.error("Error parsing variants:", e);
                variantsObj = [];
            }
        } else {
            variantsObj = variants;
        }

        if (!Array.isArray(variantsObj)) {
            variantsObj = [];
        }

        const baseUrl = getBaseUrl(req);

        let mainImageUrl = product.image_url;

        // Main product cover image — sent as field name "mainImage"
        // const mainImageFile = req.files?.mainImage?.[0];
        // if (mainImageFile) {
        //     // Delete old main image file if it exists
        //     if (product.image_url && !product.image_url.startsWith("http")) {
        //         const oldImage = path.join(
        //             __dirname,
        //             "../public",
        //             product.image_url.replace(/^\/+/, "")
        //         );
        //         if (fs.existsSync(oldImage)) {
        //             fs.unlinkSync(oldImage);
        //         }
        //     }

        //     const fileName = `${Date.now()}-${mainImageFile.originalname}`;
        //     const uploadPath = path.join(__dirname, "../public/uploads", fileName);
        //     fs.writeFileSync(uploadPath, mainImageFile.buffer);
        //     mainImageUrl = `/uploads/${fileName}`;
        // }

        const mainImageFile = req.files?.mainImage?.[0];

        if (mainImageFile) {
            // Delete old image from Supabase
            if (product.image_url) {
                const oldPath = product.image_url.split("/object/public/uploads/")[1];

                if (oldPath) {
                    await supabase.storage.from("uploads").remove([oldPath]);
                }
            }

            const fileExt = mainImageFile.originalname.split(".").pop();
            const uniqueId = crypto.randomUUID();
            const fileName = `products/main-${uniqueId}.${fileExt}`;

            const { error } = await supabase.storage
                .from("uploads")
                .upload(fileName, mainImageFile.buffer, {
                    contentType: mainImageFile.mimetype,
                    upsert: false,
                });

            if (error) {
                throw error;
            }

            const { data } = supabase.storage
                .from("uploads")
                .getPublicUrl(fileName);

            mainImageUrl = data.publicUrl;
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
                collection: collection || product.collection,
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

        // const keptImageUrls = new Set(
        //     variantsObj
        //         .filter((v) => !v.hasNewImage && v.image_url)
        //         .map((v) => toRelativeImageUrl(v.image_url, baseUrl))
        // );

        // oldAttributes.forEach((attr) => {
        //     if (attr.image_url && !keptImageUrls.has(attr.image_url)) {
        //         const oldImage = path.join(
        //             __dirname,
        //             "../public",
        //             attr.image_url.replace(/^\/+/, "")
        //         );

        //         if (fs.existsSync(oldImage)) {
        //             fs.unlinkSync(oldImage);
        //         }
        //     }
        // });

        const keptImageUrls = new Set(
            variantsObj
                .filter((v) => !v.hasNewImage && v.image_url)
                .map((v) => v.image_url)
        );

        for (const attr of oldAttributes) {
            if (attr.image_url && !keptImageUrls.has(attr.image_url)) {
                const oldPath = attr.image_url.split("/object/public/uploads/")[1];

                if (oldPath) {
                    await supabase.storage.from("uploads").remove([oldPath]);
                }
            }
        }

        await ProductAttribute.destroy({
            where: { productId: id },
            transaction,
        });

        if (variantsObj.length > 0) {
            let fileIndex = 0;

            // Variant images are under req.files.variantImages
            const variantFiles = req.files?.variantImages || [];

            // const attributes = variantsObj.map((variant) => {
            //     // let variantImageUrl = toRelativeImageUrl(variant.image_url, baseUrl);

            //     // if (variant.hasNewImage && variantFiles[fileIndex]) {
            //     //     const file = variantFiles[fileIndex];
            //     //     const fileName = `${Date.now()}-${fileIndex}-${file.originalname}`;
            //     //     const uploadPath = path.join(
            //     //         __dirname,
            //     //         "../public/uploads",
            //     //         fileName
            //     //     );

            //     //     fs.writeFileSync(uploadPath, file.buffer);
            //     //     variantImageUrl = `/uploads/${fileName}`;
            //     //     fileIndex++;
            //     // }
            //     let variantImageUrl = variant.image_url || null;

            //     if (variant.hasNewImage && variantFiles[fileIndex]) {
            //         const file = variantFiles[fileIndex];

            //         const fileExt = file.originalname.split(".").pop();
            //         const uniqueId = crypto.randomUUID();
            //         const fileName = `products/variant-${uniqueId}.${fileExt}`;

            //         const { error } = await supabase.storage
            //             .from("uploads")
            //             .upload(fileName, file.buffer, {
            //                 contentType: file.mimetype,
            //                 upsert: false,
            //             });

            //         if (error) {
            //             throw error;
            //         }

            //         const { data } = supabase.storage
            //             .from("uploads")
            //             .getPublicUrl(fileName);

            //         variantImageUrl = data.publicUrl;
            //         fileIndex++;
            //     }

            //     return {
            //         productId: id,
            //         sku: variant.sku || null,
            //         color: variant.color || null,
            //         fabric: variant.fabric || null,
            //         work: variant.work || null,
            //         blouseLength: variant.blouseLength || null,
            //         occasion: variant.occasion || null,
            //         metal: variant.metal || null,
            //         purity: variant.purity || null,
            //         stone: variant.stone || null,
            //         weight: variant.weight || null,
            //         size: variant.size || null,
            //         image_url: variantImageUrl,
            //     };
            // });
            const attributes = [];

            for (const variant of variantsObj) {
                let variantImageUrl = variant.image_url || null;

                if (variant.hasNewImage && variantFiles[fileIndex]) {
                    const file = variantFiles[fileIndex];

                    const fileExt = file.originalname.split(".").pop();
                    const uniqueId = crypto.randomUUID();
                    const fileName = `products/variant-${uniqueId}.${fileExt}`;

                    const { error } = await supabase.storage
                        .from("uploads")
                        .upload(fileName, file.buffer, {
                            contentType: file.mimetype,
                            upsert: false,
                        });

                    if (error) throw error;

                    const { data } = supabase.storage
                        .from("uploads")
                        .getPublicUrl(fileName);

                    variantImageUrl = data.publicUrl;
                    fileIndex++;
                }

                attributes.push({
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
                });
            }

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
        const productWithFullUrls = addFullImageUrls([updatedProduct], baseUrl)[0];

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
                productId: id,
            },
        });

        await product.destroy({ transaction });

        await transaction.commit();

        // Delete main product image
        // if (product.image_url) {
        //     const imagePath = path.join(
        //         __dirname,
        //         "../public",
        //         product.image_url.replace(/^\/+/, "")
        //     );

        //     if (fs.existsSync(imagePath)) {
        //         fs.unlinkSync(imagePath);
        //     }
        // }

        if (product.image_url) {
            const oldPath = product.image_url.split("/object/public/uploads/")[1];

            if (oldPath) {
                await supabase.storage.from("uploads").remove([oldPath]);
            }
        }

        // Delete all variant images
        // attributes.forEach((attr) => {
        //     if (attr.image_url) {
        //         const imagePath = path.join(
        //             __dirname,
        //             "../public",
        //             attr.image_url.replace(/^\/+/, "")
        //         );

        //         if (fs.existsSync(imagePath)) {
        //             fs.unlinkSync(imagePath);
        //         }
        //     }
        // });

        for (const attr of attributes) {
            if (attr.image_url) {
                const oldPath = attr.image_url.split("/object/public/uploads/")[1];

                if (oldPath) {
                    const { error } = await supabase.storage
                        .from("uploads")
                        .remove([oldPath]);

                    if (error) {
                        console.error(error);
                    }
                }
            }
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
    GetSarees,
    GetJewels,
    GetLoomProducts,
    CreateProduct,
    UpdateProduct,
    DeleteProduct,
};
