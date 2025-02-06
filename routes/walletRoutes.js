const express = require('express');
const { getAllWallets, getWalletsByUserId, createWallet, deleteWallet } = require('../controllers/walletController');
const router = express.Router();

// Lấy tất cả ví
router.get('/', getAllWallets);

// Lấy tất cả ví theo userId
router.get('/:userId', getWalletsByUserId);

// Tạo ví mới
router.post('/create', createWallet);

// Xóa ví theo walletId
router.delete('/delete/:userId/:walletId', deleteWallet);

module.exports = router;
