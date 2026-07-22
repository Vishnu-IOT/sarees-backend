const express = require('express');
const { GetCategories, CreateCategory, DeleteCategory, GetSubCategories, CreateSubCategory, UpdateSubCategory, DeleteSubCategory } = require('../controllers/categoryController');
const router = express.Router();

router.get('/get-category', GetCategories);
router.post('/create-category', CreateCategory);
router.post('/delete-category/:id', DeleteCategory);

router.get("/get-sub-category", GetSubCategories);
router.post("/create-sub-category", CreateSubCategory);
router.post("/update-sub-category/:id", UpdateSubCategory);
router.post("/delete-sub-category/:id", DeleteSubCategory);


module.exports = router;
