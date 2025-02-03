const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route lấy tất cả giao dịch
router.get('/', transactionController.getAllTransactions);

// Route thêm giao dịch mới
router.post('/', transactionController.addTransaction);

// Route lấy giao dịch theo transactionID
router.get('/:id', transactionController.getTransactionById);

// Route cập nhật giao dịch
router.put('/:id', transactionController.updateTransaction);

// Route xóa giao dịch
router.delete('/:id', transactionController.deleteTransaction);

module.exports = router;
