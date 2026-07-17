const express = require('express');
const { GetCategories, CreateCategory, DeleteCategory } = require('../controllers/categoryController');
const router = express.Router();

router.get('/get-category', GetCategories);
router.post('/create-category', CreateCategory);
router.post('/delete-category/:id', DeleteCategory);


module.exports = router;
