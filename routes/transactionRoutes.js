// routes/transactionRoutes.js

const express = require('express');
const { createTransaction, getTransactionsByUserId } = require('../controllers/transactionController');
const router = express.Router();

// Route tạo giao dịch
router.post('/', createTransaction);

// Route lấy danh sách giao dịch của người dùng theo userId
router.get('/:userId', getTransactionsByUserId);

module.exports = router;
