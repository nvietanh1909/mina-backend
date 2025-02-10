const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Lấy thống kê giao dịch
router.get('/stats', transactionController.getTransactionStats);

// CRUD operations
router.route('/')
  .post(transactionController.createTransaction)
  .get(transactionController.getTransactions);

router.route('/:id')
  .get(transactionController.getTransaction)
  .patch(transactionController.updateTransaction)
  .delete(transactionController.deleteTransaction);

module.exports = router;