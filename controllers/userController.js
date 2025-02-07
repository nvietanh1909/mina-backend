const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const connectDB = require('../config/mongo-config');
const bcrypt = require('bcrypt');
const authenticateToken = require('../middleware/authenticateToken');

// Lấy tất cả user
const getAllUsers = async (req, res) => {
  try {
    await connectDB();
    const users = await User.find().select('-password'); // Không trả về password
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Đăng ký user
const signUpUser = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    await connectDB();

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,  
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: 'User created successfully',
      user: { id: savedUser._id, email: savedUser.email, name: savedUser.name },
    });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Error saving user' });
  }
};


// Đăng nhập user
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Tạo token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

// Lấy thông tin user theo ID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    await connectDB();
    const user = await User.findById(id).select('-password');  // Không trả về password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Middleware kiểm tra token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = user;
    next();
  });
};

// Lấy thông tin user hiện tại (dùng token xác thực)
const getUserMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');  // Lấy thông tin user theo userId từ token

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Error fetching user data');
  }
};

module.exports = {
  signUpUser,
  getAllUsers,
  loginUser,
  getUserById,
  authenticateToken,
  getUserMe,
};
