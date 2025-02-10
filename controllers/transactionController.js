const Transaction = require('../models/transactionModel');
const Wallet = require('../models/walletModel');
const mongoose = require('mongoose');

exports.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { walletId, amount, type, category, date, notes } = req.body;

    // Kiểm tra ví có tồn tại và thuộc về user không
    const wallet = await Wallet.findOne({
      _id: walletId,
      userId: req.user.id
    }).session(session);

    if (!wallet) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy ví'
      });
    }

    // Kiểm tra số dư khi chi tiêu
    if (type === 'expense' && wallet.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        status: 'error',
        message: 'Số dư trong ví không đủ'
      });
    }

    const transaction = await Transaction.create([{
      userId: req.user.id,
      walletId,
      amount,
      type,
      category,
      date: date || new Date(),
      notes
    }], { session });

    // Cập nhật số dư ví
    const updateAmount = type === 'income' ? amount : -amount;
    await Wallet.findByIdAndUpdate(
      walletId,
      { $inc: { balance: updateAmount } },
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      status: 'success',
      data: {
        transaction: transaction[0]
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const {
      walletId,
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sort = '-date'
    } = req.query;

    const query = { userId: req.user.id };

    if (walletId) query.walletId = walletId;
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('category', 'name icon')
      .populate('walletId', 'name');

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    })
    .populate('category', 'name icon')
    .populate('walletId', 'name');

    if (!transaction) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy giao dịch'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        transaction
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Lấy giao dịch cũ
    const oldTransaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).session(session);

    if (!oldTransaction) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy giao dịch'
      });
    }

    const { amount, type, walletId } = req.body;

    // Nếu thay đổi ví hoặc số tiền, cần cập nhật số dư các ví
    if (amount !== oldTransaction.amount || 
        type !== oldTransaction.type || 
        walletId !== oldTransaction.walletId.toString()) {
      
      // Hoàn lại số dư ví cũ
      const oldWallet = await Wallet.findById(oldTransaction.walletId).session(session);
      const oldAmount = oldTransaction.type === 'income' ? -oldTransaction.amount : oldTransaction.amount;
      oldWallet.balance += oldAmount;
      await oldWallet.save({ session });

      // Cập nhật số dư ví mới
      const newWallet = await Wallet.findById(walletId || oldTransaction.walletId).session(session);
      const newAmount = (type || oldTransaction.type) === 'income' ? amount || oldTransaction.amount : -(amount || oldTransaction.amount);
      
      if (type === 'expense' && newWallet.balance + newAmount < 0) {
        await session.abortTransaction();
        return res.status(400).json({
          status: 'error',
          message: 'Số dư trong ví không đủ'
        });
      }

      newWallet.balance += newAmount;
      await newWallet.save({ session });
    }

    // Cập nhật giao dịch
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true, session }
    ).populate('category', 'name icon')
     .populate('walletId', 'name');

    await session.commitTransaction();

    res.status(200).json({
      status: 'success',
      data: {
        transaction: updatedTransaction
      }
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

exports.deleteTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).session(session);

    if (!transaction) {
      await session.abortTransaction();
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy giao dịch'
      });
    }

    // Cập nhật số dư ví
    const wallet = await Wallet.findById(transaction.walletId).session(session);
    const amount = transaction.type === 'income' ? -transaction.amount : transaction.amount;
    wallet.balance += amount;
    await wallet.save({ session });

    await transaction.deleteOne({ session });
    await session.commitTransaction();

    res.status(200).json({
      status: 'success',
      message: 'Xóa giao dịch thành công'
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  } finally {
    session.endSession();
  }
};

exports.getTransactionStats = async (req, res) => {
  try {
    const { walletId, startDate, endDate } = req.query;

    const query = { userId: req.user.id };
    if (walletId) query.walletId = walletId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObject = stats.reduce((acc, curr) => {
      acc[curr._id] = {
        total: curr.total,
        count: curr.count
      };
      return acc;
    }, {});

    // Thống kê theo danh mục
    const categoryStats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            type: '$type',
            category: '$category'
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id.category',
          foreignField: '_id',
          as: 'category'
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        overview: statsObject,
        categoryStats
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};
