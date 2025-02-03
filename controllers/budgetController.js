const db = require('../config/firebase-config');

// Lấy tất cả budgets
const getAllBudgets = async (req, res) => {
  try {
    const budgetsRef = db.collection('budgets');
    const snapshot = await budgetsRef.get();
    const budgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ message: 'Error fetching budgets' });
  }
};

// Thêm budget mới
const addBudget = async (req, res) => {
  const { budgetID, budgetName, balance, totalIncome, totalExpense, lastUpdated, userID, active } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!budgetID || !budgetName || !balance || !totalIncome || !totalExpense || !lastUpdated || !userID || active === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newBudget = {
      budgetID,
      budgetName,
      balance,
      totalIncome,
      totalExpense,
      lastUpdated,
      userID,
      active
    };

    const docRef = await db.collection('budgets').doc(budgetID).set(newBudget); // Thêm vào collection 'budgets'
    res.status(201).json({ message: 'Budget added successfully', id: docRef.id });
  } catch (error) {
    console.error('Error adding budget:', error);
    res.status(500).json({ message: 'Error saving budget' });
  }
};

// Lấy budget theo budgetID
const getBudgetById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = await db.collection('budgets').doc(id).get();
    if (!docRef.exists) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.status(200).json({ id: docRef.id, ...docRef.data() });
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ message: 'Error fetching budget' });
  }
};

// Cập nhật budget
const updateBudget = async (req, res) => {
  const { id } = req.params;
  const { budgetID, budgetName, balance, totalIncome, totalExpense, lastUpdated, userID, active } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!budgetID || !budgetName || !balance || !totalIncome || !totalExpense || !lastUpdated || !userID || active === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const docRef = db.collection('budgets').doc(id);
    await docRef.update({
      budgetID,
      budgetName,
      balance,
      totalIncome,
      totalExpense,
      lastUpdated,
      userID,
      active
    });
    res.status(200).json({ message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ message: 'Error updating budget' });
  }
};

// Xóa budget
const deleteBudget = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('budgets').doc(id);
    await docRef.delete();
    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ message: 'Error deleting budget' });
  }
};

module.exports = {
  getAllBudgets,
  addBudget,
  getBudgetById,
  updateBudget,
  deleteBudget
};
