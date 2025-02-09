const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,  // Liên kết với user
        ref: 'User',
        required: true
    },
    Name: {
        type: String,
        required: true,
        default: "Default"
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Wallet = mongoose.model('Wallet', WalletSchema);
module.exports = Wallet;
