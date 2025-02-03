// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./config/firebase-config');  // Đảm bảo đúng đường dẫn tới firebase-config.js

const app = express();
app.use(bodyParser.json()); // Phân tích các request body dưới dạng JSON

// API lấy danh sách chi tiêu
app.get('/api/expenses', async (req, res) => {
  try {
    const expensesRef = db.collection('expenses');
    const snapshot = await expensesRef.get();
    if (snapshot.empty) {
      return res.status(404).send('No expenses found');
    }
    const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).send('Error fetching expenses');
  }
});

// API thêm chi tiêu mới
app.post('/api/expenses', async (req, res) => {
  const { description, amount, date } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!description || !amount || !date) {
    return res.status(400).send('All fields are required');
  }

  try {
    const newExpense = {
      description,
      amount,
      date,
    };

    const docRef = await db.collection('expenses').add(newExpense);
    console.log('New expense added with ID:', docRef.id);
    res.status(201).json({ message: 'Expense added successfully', id: docRef.id });
  } catch (error) {
    console.error('Error saving expense:', error);
    res.status(500).send('Error saving expense');
  }
});

// API sửa chi tiêu
app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { description, amount, date } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!description || !amount || !date) {
    return res.status(400).send('All fields are required');
  }

  try {
    const expenseRef = db.collection('expenses').doc(id);
    await expenseRef.update({
      description,
      amount,
      date,
    });
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).send('Error updating expense');
  }
});

// API xóa chi tiêu
app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const expenseRef = db.collection('expenses').doc(id);
    await expenseRef.delete();
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).send('Error deleting expense');
  }
});

// Cấu hình server chạy trên port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
