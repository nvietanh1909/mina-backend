const db = require('../config/firebase-config'); // Import Firebase DB

// Lấy tất cả giao dịch
const getAllTransactions = async (req, res) => {
  try {
    const transactionsRef = db.collection('transactions'); // Truy cập collection 'transactions'
    const snapshot = await transactionsRef.get(); // Lấy tất cả dữ liệu
    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Error fetching transactions' });
  }
};

// Thêm giao dịch mới
const addTransaction = async (req, res) => {
  const { transactionID, type, amount, date, categoryID, budgetID } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!transactionID || !type || !amount || !date || !categoryID || !budgetID) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newTransaction = {
      transactionID,
      type,
      amount,
      date,
      categoryID,
      budgetID
    };

    const docRef = await db.collection('transactions').doc(transactionID).set(newTransaction); // Thêm vào collection 'transactions'
    res.status(201).json({ message: 'Transaction added successfully', id: docRef.id });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Error saving transaction' });
  }
};

// Lấy giao dịch theo transactionID
const getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = await db.collection('transactions').doc(id).get();
    if (!docRef.exists) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(200).json({ id: docRef.id, ...docRef.data() });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ message: 'Error fetching transaction' });
  }
};

// Cập nhật giao dịch
const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const { transactionID, type, amount, date, categoryID, budgetID } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!transactionID || !type || !amount || !date || !categoryID || !budgetID) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const docRef = db.collection('transactions').doc(id);
    await docRef.update({
      transactionID,
      type,
      amount,
      date,
      categoryID,
      budgetID
    });
    res.status(200).json({ message: 'Transaction updated successfully' });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Error updating transaction' });
  }
};

// Xóa giao dịch
const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('transactions').doc(id);
    await docRef.delete();
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Error deleting transaction' });
  }
};

module.exports = {
  getAllTransactions,
  addTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};
