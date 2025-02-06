const Transaction = require('../models/transactionModel');
const User = require('../models/userModel');
const connectDB = require('../config/mongo-config');

// Tạo giao dịch mới (thu nhập hoặc chi phí)
const createTransaction = async (req, res) => {
  try {
    const { userId, amount, notes, category, date, type } = req.body;

    // Kiểm tra nếu type không phải là 'income' hoặc 'expense'
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Kiểm tra xem người dùng có tồn tại không
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Tạo một giao dịch mới
    const transaction = new Transaction({
      userId,
      amount,
      notes,
      category,
      date,
      type,
    });

    // Lưu giao dịch vào cơ sở dữ liệu
    await transaction.save();

    return res.status(201).json({
      message: 'Transaction created successfully',
      transaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Lấy danh sách giao dịch của người dùng
const getTransactionsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm giao dịch của người dùng
    const transactions = await Transaction.find({ userId });

    if (!transactions.length) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    return res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Xóa giao dịch transaction theo userId
const deleteTransaction = async (req, res) => {
  try {
      const { userId, transactionId } = req.params;
      // Kiểm tra xem user có tồn tại không
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Kiểm tra giao dịch có tồn tại và thuộc về user không
      const transaction = await Transaction.findOne({ _id: transactionId, userId });
      if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found or does not belong to this user' });
      }

      // Xóa giao dịch
      await Transaction.findByIdAndDelete(transactionId);

      return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTransaction,
  getTransactionsByUserId,
  deleteTransaction
};