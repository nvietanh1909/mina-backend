const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/mongo-config');

// Import routes
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const walletRoutes = require('./routes/walletRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
connectDB();

// Use user routes for handling user-related requests
app.use('/users', userRoutes);
app.use('/transactions', transactionRoutes);
app.use('/wallets', walletRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
