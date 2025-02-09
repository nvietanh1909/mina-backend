const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Route công khai
router.post('/signup', userController.register);
router.post('/login', userController.login);

// Route yêu cầu xác thực
router.use(auth);
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);

module.exports = router;