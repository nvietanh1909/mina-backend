const db = require('../config/firebase-config');

// Lấy tất cả categories
const getAllCategories = async (req, res) => {
  try {
    const categoriesRef = db.collection('categories'); 
    const snapshot = await categoriesRef.get();
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Thêm category mới
const addCategory = async (req, res) => {
  const { categoryID, name, type, icon, color, createdAt } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!categoryID || !name || !type || !icon || !color || !createdAt) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newCategory = {
      categoryID,
      name,
      type,
      icon, // Icon có thể lưu dưới dạng base64 hoặc URL của ảnh
      color,
      createdAt,
    };

    const docRef = await db.collection('categories').doc(categoryID).set(newCategory); // Thêm vào collection 'categories'
    res.status(201).json({ message: 'Category added successfully', id: docRef.id });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Error saving category' });
  }
};

// Lấy category theo categoryID
const getCategoryById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = await db.collection('categories').doc(id).get();
    if (!docRef.exists) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ id: docRef.id, ...docRef.data() });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Cập nhật category
const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { categoryID, name, type, icon, color, createdAt } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!categoryID || !name || !type || !icon || !color || !createdAt) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const docRef = db.collection('categories').doc(id);
    await docRef.update({
      categoryID,
      name,
      type,
      icon,
      color,
      createdAt
    });
    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
};

// Xóa category
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('categories').doc(id);
    await docRef.delete();
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

module.exports = {
  getAllCategories,
  addCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
};
