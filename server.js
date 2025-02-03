const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const session = require('express-session'); 
const db = require('./config/firebase-config');

// Import các route
const budgetRoutes = require('./routes/budgetRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(bodyParser.json());
const PORT = process.env.PORT || 5000;

// Tạo secret ngẫu nhiên với chiều dài 64 ký tự (128-bit)
const generateSecret = () => crypto.randomBytes(64).toString('hex');

// Cấu hình session với secret ngẫu nhiên
app.use(session({
  secret: generateSecret(),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sử dụng các route
app.use('/budgets', budgetRoutes);
app.use('/categorys', categoryRoutes);
app.use('/transactions', transactionRoutes);
app.use('/users', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
