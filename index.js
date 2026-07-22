const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const loginRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const sequelize = require("./config/mysqldb");

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors());

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ IMPORTANT: Serve static files for uploads
const uploadsDir = path.join(__dirname, "public/uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✅ Created uploads directory:", uploadsDir);
}

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

// ============================================
// ROUTES
// ============================================

app.get("/", (req, res) => {
    res.send("API is running for Sarees Website!");
});

app.use("/new", loginRoutes);
app.use("/category", categoryRoutes);
app.use("/products", productRoutes);
app.use("/orders", ordersRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "API is running", timestamp: new Date() });
});

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);

    // Multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            success: false,
            message: "File too large. Maximum size is 10MB",
        });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
            success: false,
            message: "Too many files uploaded",
        });
    }

    if (err.message === "Only image files are allowed") {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    // Generic error
    res.status(500).json({
        success: false,
        message: err.message || "Server error",
    });
});

// ============================================
// SERVER START
// ============================================

const port = process.env.PORT || 5002;

// Optional: Test database connection
sequelize
    .authenticate()
    .then(() => {
        console.log("✅ Database connection established");
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err.message);
    });

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📁 Uploads directory: ${uploadsDir}`);
});

module.exports = app;