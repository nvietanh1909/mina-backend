const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route lấy tất cả users
router.get('/', userController.getAllUsers);

// Route thêm user mới
router.post('/', userController.addUser);

// Route lấy user theo userID
router.get('/:id', userController.getUserById);

// Route cập nhật user
router.put('/:id', userController.updateUser);

// Route xóa user
router.delete('/:id', userController.deleteUser);

module.exports = router;
    