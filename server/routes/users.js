const express = require('express');

const router = express.Router();
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    console.log(`📥 [Users API] GET /users/${req.params.id}`);
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      console.error(`❌ [Users API] User not found: ${req.params.id}`);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Ensure both id and _id are in response
    const userData = user.toObject();
    userData.id = userData._id;
    console.log(`✅ [Users API] User found: ${userData.name} (${userData.email})`);
    res.json(userData);
  } catch (error) {
    console.error(`❌ [Users API] Error fetching user:`, error);
    res.status(500).json({ error: 'Failed to fetch user', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', message: error.message });
  }
});

module.exports = router;











