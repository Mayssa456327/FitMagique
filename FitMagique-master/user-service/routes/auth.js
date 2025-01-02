const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path'); // Add this line
const User = require('../models/user');
const router = express.Router();

const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZFVzZXIiOjEsIkVtYWlsVXNlciI6ImpvaG5AZXhhbXBsZS5jb20iLCJpYXQiOjE3MzU1OTg2ODQsImV4cCI6MTczNTYwMjI4NH0.pSHzyW_h7RnocvBSYO6EhwEBfU0jhXmg1nzvpUp4WpM';
const JWT_EXPIRES = '1h';
// Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', appName: 'FitMagique' });
});

// Register page
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', appName: 'FitMagique' });
});

// Register a new user
router.post('/register', async (req, res) => {
  const { idUser, NameUser, sexeUser, EmailUser, roleUser, telUser, adressUser, password } = req.body;

  if (!idUser || !NameUser || !EmailUser || !password) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      idUser,
      NameUser,
      sexeUser,
      EmailUser,
      roleUser,
      telUser,
      adressUser,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error registering user.', details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { EmailUser, password } = req.body;

  if (!EmailUser || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ EmailUser });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ idUser: user.idUser, EmailUser: user.EmailUser }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ message: 'Login successful.', token });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in.', details: err.message });
  }
});

// Logout (Invalidate token on client-side)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful.' });
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { EmailUser } = req.body;

  if (!EmailUser) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const user = await User.findOne({ EmailUser });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Simulate sending email (log the token)
    console.log(`Password reset link: http://localhost:3000/reset-password/${resetToken}`);

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Error sending password reset link.', details: err.message });
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ error: 'New password is required.' });
  }

  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ error: 'Error resetting password.', details: err.message });
  }
});

// View Profile
router.get('/profile', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ idUser: decoded.idUser });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user profile details
    res.json({
      idUser: user.idUser,
      NameUser: user.NameUser,
      sexeUser: user.sexeUser,
      EmailUser: user.EmailUser,
      roleUser: user.roleUser,
      telUser: user.telUser,
      adressUser: user.adressUser,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile', details: err.message });
  }
});

// Edit Profile
router.put('/profile', async (req, res) => {
  const token = req.headers['authorization'];
  const { NameUser, sexeUser, telUser, adressUser } = req.body;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ idUser: decoded.idUser });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user profile
    user.NameUser = NameUser || user.NameUser;
    user.sexeUser = sexeUser || user.sexeUser;
    user.telUser = telUser || user.telUser;
    user.adressUser = adressUser || user.adressUser;

    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating profile', details: err.message });
  }
});


module.exports = router;
