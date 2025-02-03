const db = require('../config/firebase-config');

const getAllUsers = async (req, res) => {
  try {
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Thêm user mới
const addUser = async (req, res) => {
  const { userID, email, password, verification } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!userID || !email || !password || verification === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newUser = {
      userID,
      email,
      password, 
      verification,
    };

    const docRef = await db.collection('users').doc(userID).set(newUser); // Thêm vào collection 'users'
    res.status(201).json({ message: 'User added successfully', id: docRef.id });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Error saving user' });
  }
};

// Lấy user theo userID
const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = await db.collection('users').doc(id).get();
    if (!docRef.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ id: docRef.id, ...docRef.data() });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Cập nhật user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { userID, email, password, verification } = req.body;

  // Kiểm tra thông tin yêu cầu
  if (!userID || !email || !password || verification === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const docRef = db.collection('users').doc(id);
    await docRef.update({
      userID,
      email,
      password,
      verification
    });
    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Xóa user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const docRef = db.collection('users').doc(id);
    await docRef.delete();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
  getAllUsers,
  addUser,
  getUserById,
  updateUser,
  deleteUser
};
