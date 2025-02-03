const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Route lấy tất cả categories
router.get('/', categoryController.getAllCategories);

// Route thêm category mới
router.post('/', categoryController.addCategory);

// Route lấy category theo categoryID
router.get('/:id', categoryController.getCategoryById);

// Route cập nhật category
router.put('/:id', categoryController.updateCategory);

// Route xóa category
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
