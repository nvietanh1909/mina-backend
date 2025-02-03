const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes cho người dùng
router.get('/', userController.getAllUsers);
router.post('/', userController.addUser);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.put('/repassword', userController.repassword);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/session', userController.getSession);

// Routes cho ngân sách
router.get('/:userId/budgets/active', userController.getActiveBudgetsForUser);

module.exports = router;
    