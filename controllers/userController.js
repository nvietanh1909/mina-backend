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

// Thêm user mới (Signup)
const signup = async (req, res) => {
  const { userID, email, password, verification } = req.body;

  if (!userID || !email || !password || verification === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).get();
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newUser = { userID, email, password, verification };
    await db.collection('users').doc(userID).set(newUser); 
    res.status(201).json({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ message: 'Error signing up user' });
  }
};

  const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
      const userSnapshot = await db.collection('users').where('email', '==', email).get();

      if (userSnapshot.empty) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = userSnapshot.docs[0].data();

      if (user.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
      }

      // Lưu thông tin người dùng vào session
      req.session.user = { id: userSnapshot.docs[0].id, ...user };

      res.status(200).json({
        message: 'Login successful',
        user: { id: userSnapshot.docs[0].id, ...user },
      });
    } catch (error) {
      console.error('Error logging in user:', error);
      res.status(500).json({ message: 'Error logging in user' });
    }
  };

// Lấy thông tin người dùng từ session
const getSession = (req, res) => {
  if (req.session.user) {
    res.status(200).json({
      message: 'User session found',
      user: req.session.user,
    });
  } else {
    res.status(404).json({ message: 'No user session found' });
  }
};

// Đổi mật khẩu (Repassword)
const repassword = async (req, res) => {
  const { userID, oldPassword, newPassword } = req.body;

  if (!userID || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'User ID, old password, and new password are required' });
  }

  try {
    const docRef = db.collection('users').doc(userID);
    const userSnapshot = await docRef.get();

    if (!userSnapshot.exists) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userSnapshot.data();

    if (user.password !== oldPassword) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }

    await docRef.update({
      password: newPassword,
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
};

// Lấy ngân sách hoạt động của người dùng
const getActiveBudgetsForUser = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Truy vấn vào Firestore để lấy ngân sách của người dùng theo userId và active = true
    const budgetsRef = db.collection('budgets')
      .where('userID', '==', userId)
      .where('active', '==', true);  // Lọc những ngân sách đang hoạt động

    const snapshot = await budgetsRef.get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No active budgets found for this user' });
    }

    // Lấy tất cả ngân sách và trả về
    const activeBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(activeBudgets);  // Trả về ngân sách hoạt động của người dùng

  } catch (error) {
    console.error('Error fetching active budgets for user:', error);
    res.status(500).json({ message: 'Error fetching active budgets for user' });
  }
};

// Các phương thức quản lý user khác (update, delete)
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

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { userID, email, password, verification } = req.body;

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

// Route truy xuất thông tin người dùng từ session
const getUserProfile = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'You need to log in first' });
  }

  // Dùng thông tin trong session để truy xuất dữ liệu người dùng từ Firestore
  const userId = req.session.user.id;
  db.collection('users').doc(userId).get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(doc.data());
    })
    .catch(error => {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Error fetching user profile' });
    });
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.status(200).json({ message: 'Logged out successfully' });
  });
};


module.exports = {
  getAllUsers,
  signup,
  login,
  repassword,
  getUserById,
  updateUser,
  deleteUser,
  getActiveBudgetsForUser,
  addUser,
  getUserProfile,
  logout,
  getSession,
};
