const Wallet = require('../models/walletModel'); 
const User = require('../models/userModel'); 
const connectDB = require('../config/mongo-config');

// Lấy ra tất cả wallet
const getAllWallets = async (req, res) => {
    try {
      await connectDB();
      const wallet = await Wallet.find();
      res.status(200).json(wallet);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      res.status(500).json({ message: 'Error fetching wallets' });
    }
  };

// Lấy tất cả ví theo userId
const getWalletsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại!" });
        }

        // Lấy danh sách ví của user
        const wallets = await Wallet.find({ userId });

        if (!wallets || wallets.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy ví nào!" });
        }

        res.status(200).json(wallets);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// Thêm ví mới
const createWallet = async (req, res) => {
    try {
        const { userId, balance} = req.body;

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User không tồn tại!" });
        }

        // Kiểm tra xem userId đã có ví chưa
        const existingWallet = await Wallet.findOne({ userId });
        if (existingWallet) {
            const wallet = new Wallet({ userId, balance:  0, active: true });
            await wallet.save();
        }

        // Tạo ví mới
        const wallet = new Wallet({ userId, balance, active: false });
        await wallet.save();

        res.status(201).json({ message: "Tạo ví thành công!", wallet });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};

// Xóa ví theo ID
const deleteWallet = async (req, res) => {
    try {
        const { walletId } = req.params;

        // Kiểm tra xem ví có tồn tại không
        const wallet = await Wallet.findById(walletId);
        if (!wallet) {
            return res.status(404).json({ message: "Không tìm thấy ví!" });
        }

        await Wallet.findByIdAndDelete(walletId);
        res.status(200).json({ message: "Xóa ví thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error });
    }
};


module.exports = {
    getAllWallets,
    getWalletsByUserId,
    createWallet,
    deleteWallet,
};
