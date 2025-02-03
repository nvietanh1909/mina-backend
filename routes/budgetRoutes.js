const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');

// Route lấy tất cả budgets
router.get('/', budgetController.getAllBudgets);

// Route thêm budget mới
router.post('/', budgetController.addBudget);

// Route lấy budget theo budgetID
router.get('/:id', budgetController.getBudgetById);

// Route cập nhật budget
router.put('/:id', budgetController.updateBudget);

// Route xóa budget
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;
