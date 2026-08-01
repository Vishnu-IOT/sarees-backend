const express = require("express");
const router = express.Router();

const {
    GetCategories,
    GetCategoriesByCollection,
    CreateCategory,
    DeleteCategory,
    GetSubCategories,
    GetSubCategoriesByCollection,
    CreateSubCategory,
    UpdateSubCategory,
    DeleteSubCategory,
    UpdateCategory,
    GetSubCategoriesByCategoryId,
    UpdateCategoryStatus,
    UpdateSubCategoryStatus,
} = require("../controllers/categoryController");

// ============ CATEGORIES ============

// ✅ GET - Fetch all categories
router.get("/get-categories", GetCategories);

// ✅ NEW: GET - Fetch categories by collection (SAREE or JEWEL)
router.get("/get-categories/:collection", GetCategoriesByCollection);

// ✅ PUT - Update Category
router.post("/update-category/:id", UpdateCategory);

// ✅ POST - Add category
router.post("/create-category", CreateCategory);

// ✅ GET - Update category Status (active/inactive)
router.get("/category-status-update", UpdateCategoryStatus);

// ✅ DELETE - Delete category
router.get("/delete-category/:id", DeleteCategory);

// ============ SUBCATEGORIES ============

// ✅ GET - Fetch all subcategories
router.get("/get-subcategories", GetSubCategories);

// ✅ NEW: GET - Fetch subcategories by collection
router.get("/get-subcategories/:collection", GetSubCategoriesByCollection);

// ✅ NEW: GET - Fetch subcategories by category ID
router.get("/get-subcategories-by-category/:categoryId", GetSubCategoriesByCategoryId);

// ✅ POST - Create subcategory
router.post("/create-subcategory", CreateSubCategory);

// ✅ PUT - Update subcategory
router.post("/update-subcategory/:id", UpdateSubCategory);

// ✅ GET - Update subcategory Status (active/inactive)
router.get("/subcategory-status-update", UpdateSubCategoryStatus);

// ✅ DELETE - Delete subcategory
router.get("/delete-subcategory/:id", DeleteSubCategory);

module.exports = router;
