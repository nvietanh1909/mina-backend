const express = require('express');
const { createTransaction, getTransactionsByUserId, deleteTransaction } = require('../controllers/transactionController');
const router = express.Router();

// Route tạo giao dịch
router.post('/create', createTransaction);

// Route lấy danh sách giao dịch của người dùng theo userId
router.get('/:userId', getTransactionsByUserId);

// Route xóa transaction
router.delete('/delete/:userId/:transactionId', deleteTransaction);

module.exports = router;
