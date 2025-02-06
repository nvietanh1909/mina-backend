const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const connectDB = require('../config/mongo-config');
const jwt = require('jsonwebtoken');


// Lấy ra tất cả user
const getAllUsers = async (req, res) => {
  try {
    await connectDB();
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Thêm user
const signUpUser = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields (email, password, name) are required' });
  }

  const newUser = new User({
    email,
    password,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  try {
    await connectDB();
    const savedUser = await newUser.save();
    res.status(201).json({ message: 'User created successfully', user: savedUser });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Error saving user' });
  }
};


// Login 
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // So sánh mật khẩu nhập vào với mật khẩu trong cơ sở dữ liệu
    if (user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Lấy JWT_SECRET từ biến môi trường
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET, // Sử dụng biến môi trường JWT_SECRET
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

module.exports = {
  signUpUser,
  getAllUsers,
  loginUser,
};
