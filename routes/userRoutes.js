const express = require('express');
const router = express.Router();
const { signUpUser, getAllUsers, loginUser, getUserById, authenticateToken, getUserMe } = require('../controllers/userController');

// Route to create a new user
router.post('/signup', signUpUser);

// Route to get all users
router.get('/', getAllUsers);

// Route to login user
router.post('/login', loginUser);

// Route to get user by id
router.get('/:id', getUserById);

// Route to get user by id
router.get('/me', authenticateToken, getUserMe);

module.exports = router;
