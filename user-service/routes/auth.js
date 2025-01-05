const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const router = express.Router();

// JWT Secret and Expiry
const JWT_SECRET = 'your_jwt_secret';
const JWT_EXPIRES = '1h';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Register page (GET)
router.get('/register', (req, res) => {
  res.render('register', { title: 'Register', appName: 'FitMagique' });
});

// Register (POST)
router.post('/register', async (req, res) => {
  const { NameUser, EmailUser, password } = req.body;

  if (!NameUser || !EmailUser || !password) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ EmailUser });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      NameUser,
      EmailUser,
      password: hashedPassword,
    });

    // Save user to database
    await user.save();
    
    // Redirect to login after successful registration
    res.redirect('/api/auth/login'); // Redirect to login page
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

// Login page
router.get('/login', (req, res) => {
  res.render('login', { title: 'Login', appName: 'FitMagique' });
});

// Logout (POST)
router.post('/logout', (req, res) => {
  // Typically, you would invalidate the JWT on the client side (e.g., by deleting the token from localStorage)
  res.json({ message: 'Logout successful.' });
});

// Forgot Password (GET)
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { title: 'Forgot Password', appName: 'FitMagique' });
});

// Forgot Password (POST)
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
    console.log(`Password reset link: http://localhost:3001/reset-password/${resetToken}`);

    res.json({ message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Error sending password reset link.', details: err.message });
  }
});

// Reset Password (GET)
router.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  res.render('reset-password', { token });
});

// Reset Password (POST)
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

// View Profile (GET)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ idUser: req.user.idUser });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

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

// Edit Profile (PUT)
router.put('/profile', verifyToken, async (req, res) => {
  const { NameUser, sexeUser, telUser, adressUser } = req.body;

  try {
    const user = await User.findOne({ idUser: req.user.idUser });

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
