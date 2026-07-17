const Product = require("../models/Products");
const Category = require("../models/Category");
const supabase = require("../config/supabase");

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
            ],
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json({
            success: true,
            products: rows,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            total: count,
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
}

async function CreateProduct(req, res) {
    try {
        const {
            name,
            desc,
            discount,
            price,
            category,
            loom,
            status,
        } = req.body;

        let imageUrl = "";

        if (req.file) {
            const fileName = `uploads/product-${Date.now()}-${req.file.originalname}`;

            const { error } = await supabase.storage
                .from("uploads")
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Image upload failed",
                    error,
                });
            }

            const { data } = supabase.storage
                .from("uploads")
                .getPublicUrl(fileName);

            imageUrl = data.publicUrl;
        }

        /*
        ===========================
        LOCAL STORAGE (Commented)
        ===========================
    
        if (req.file) {
          const fileName = Date.now() + "-" + req.file.originalname;
    
          const uploadPath = path.join(
            __dirname,
            "../public/uploads",
            fileName
          );
    
          fs.writeFileSync(uploadPath, req.file.buffer);
    
          imageUrl = `/uploads/${fileName}`;
        }
    
        */

        const product = await Product.create({
            name,
            desc,
            discount,
            price,
            categoryId: category,
            image: imageUrl,
            loom,
            status,
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
}

async function UpdateProduct(req, res) {
    try {
        const { id } = req.params;

        await Product.update(req.body, {
            where: {
                id,
            },
        });

        const updated = await Product.findByPk(id);

        return res.status(200).json({
            success: true,
            data: updated,
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Update failed",
        });
    }
}

async function DeleteProduct(req, res) {
    try {
        const { id } = req.params;

        await Product.destroy({
            where: {
                id,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Product deleted",
        });
    } catch (err) {
        console.log(err);

        return res.status(500).json({
            success: false,
            message: "Delete failed",
        });
    }
}

module.exports = {
    GetProducts,
    CreateProduct,
    UpdateProduct,
    DeleteProduct,
};