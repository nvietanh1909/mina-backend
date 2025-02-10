const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Wallet phải thuộc về một user']
  },
  balance: {
    type: Number,
    required: [true, 'Số dư là bắt buộc'],
    default: 0,
    min: [0, 'Số dư không được âm']
  },
  name: {
    type: String,
    required: [true, 'Tên ví là bắt buộc'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    required: [true, 'Loại tiền tệ là bắt buộc'],
    default: 'VND'
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Tự động tạo một ví mặc định khi user được tạo
walletSchema.statics.createDefaultWallet = async function(userId) {
  return this.create({
    userId,
    name: 'Default Wallet',
    description: 'Default Wallet',
    balance: 0,
    isDefault: true
  });
};

// Đảm bảo chỉ có một ví mặc định
walletSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;