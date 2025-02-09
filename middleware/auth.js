const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const auth = async (req, res, next) => {
  try {
    // Kiểm tra header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Không tìm thấy token xác thực'
      });
    }
    // Lấy token từ header
    const token = authHeader.split(' ')[1];
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Tìm user từ token
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error();
      }

      // Thêm thông tin user vào request
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi server'
    });
  }
};

module.exports = auth;