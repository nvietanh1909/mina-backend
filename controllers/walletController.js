const Wallet = require('../models/walletModel'); 
const User = require('../models/userModel'); 
const Transaction = require('../models/transactionModel')
exports.createWallet = async (req, res) => {
    try {
      const { name, description, currency } = req.body;
      
      const defaultWallet = await Wallet.findOne({ 
        userId: req.user.id,
        isDefault: true 
      });
  
      const wallet = await Wallet.create({
        userId: req.user.id,
        name,
        description,
        currency,
        isDefault: !defaultWallet
      });
  
      res.status(201).json({
        status: 'success',
        data: {
          wallet
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };
  
  exports.getAllWallets = async (req, res) => {
    try {
      const wallets = await Wallet.find({ userId: req.user.id });
  
      res.status(200).json({
        status: 'success',
        data: {
          wallets
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };
  
  exports.getWallet = async (req, res) => {
    try {
      const wallet = await Wallet.findOne({
        _id: req.params.id,
        userId: req.user.id
      });
  
      if (!wallet) {
        return res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy ví'
        });
      }
  
      res.status(200).json({
        status: 'success',
        data: {
          wallet
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };
  
  exports.updateWallet = async (req, res) => {
    try {
      const { name, description, isDefault } = req.body;
  
      const wallet = await Wallet.findOne({
        _id: req.params.id,
        userId: req.user.id
      });
  
      if (!wallet) {
        return res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy ví'
        });
      }
  
      if (name) wallet.name = name;
      if (description) wallet.description = description;
      if (typeof isDefault === 'boolean') wallet.isDefault = isDefault;
  
      await wallet.save();
  
      res.status(200).json({
        status: 'success',
        data: {
          wallet
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };
  
  exports.deleteWallet = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const wallet = await Wallet.findOne({
        _id: req.params.id,
        userId: req.user.id
      }).session(session);
  
      if (!wallet) {
        await session.abortTransaction();
        return res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy ví'
        });
      }
  
      if (wallet.isDefault) {
        await session.abortTransaction();
        return res.status(400).json({
          status: 'error',
          message: 'Không thể xóa ví mặc định'
        });
      }
  
      // Kiểm tra xem ví có giao dịch không
      const hasTransactions = await Transaction.exists({
        walletId: wallet._id
      }).session(session);
  
      if (hasTransactions) {
        await session.abortTransaction();
        return res.status(400).json({
          status: 'error',
          message: 'Không thể xóa ví đã có giao dịch'
        });
      }
  
      await wallet.deleteOne({ session });
      await session.commitTransaction();
  
      res.status(200).json({
        status: 'success',
        message: 'Xóa ví thành công'
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
  
  exports.getWalletBalance = async (req, res) => {
    try {
      const wallet = await Wallet.findOne({
        _id: req.params.id,
        userId: req.user.id
      });
  
      if (!wallet) {
        return res.status(404).json({
          status: 'error',
          message: 'Không tìm thấy ví'
        });
      }
  
      // Lấy tổng thu
      const totalIncome = await Transaction.aggregate([
        {
          $match: {
            walletId: wallet._id,
            type: 'income'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
  
      // Lấy tổng chi
      const totalExpense = await Transaction.aggregate([
        {
          $match: {
            walletId: wallet._id,
            type: 'expense'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          balance: wallet.balance,
          totalIncome: totalIncome[0]?.total || 0,
          totalExpense: totalExpense[0]?.total || 0
        }
      });
    } catch (error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };