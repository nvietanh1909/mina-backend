const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController')
const auth = require('../middleware/auth');

// Tất cả các routes đều yêu cầu xác thực
router.use(auth);

// Tạo và lấy danh sách ví
router.route('/')
  .post(walletController.createWallet)
  .get(walletController.getAllWallets);

// Các operations với một ví cụ thể
router.route('/:id')
  .get(walletController.getWallet)
  .patch(walletController.updateWallet)
  .delete(walletController.deleteWallet);

// Lấy số dư và thống kê của ví
router.get('/:id/balance', walletController.getWalletBalance);

module.exports = router;