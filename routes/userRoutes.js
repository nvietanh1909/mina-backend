const express = require('express');
const router = express.Router();
const { createUser, getAllUsers, loginUser } = require('../controllers/userController');

// Route to create a new user
router.post('/', createUser);

// Route to get all users
router.get('/', getAllUsers);

// Route to login user
router.post('/login', loginUser);

module.exports = router;
