const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const authController = {
  register: async (req, res) => {
    try {
      const {
        username,
        password,
        role,
        firstName,
        middleName,
        familyName,
        email,
        phoneNumber,
        gender,
        age,
        address,
        status
      } = req.body;

      if (!username || !password || !role || !firstName || !familyName || !email) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: username, password, role, firstName, familyName, email'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await userModel.createUser({
        username,
        password: hashedPassword,
        role,
        firstName,
        middleName,
        familyName,
        email,
        phoneNumber,
        gender,
        age,
        address,
        status
      });

      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await userModel.findByUsername(username);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      res.json({ success: true, token });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  me: async (req, res) => {
    try {
      const user = await userModel.getUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.json({ success: true, user });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = authController;
