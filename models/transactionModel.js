const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  amount: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
});

// Tạo mô hình cho giao dịch
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
