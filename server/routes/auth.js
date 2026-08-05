const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'texflow_super_secret_jwt_key_2026';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, company } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'Please provide all required fields (name, email, password, role)' });
    }

    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      password: passwordHash,
      role: role.toLowerCase() === 'supplier' ? 'supplier' : 'buyer',
      company: company || (role === 'supplier' ? 'Textile Supplier Co.' : 'Fashion Brand'),
      onboardingCompleted: false,
      createdAt: new Date().toISOString()
    };

    await db.createUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const onboardingProfile = await db.getOnboardingProfile(user.id);
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword,
      onboardingProfile: onboardingProfile || null
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Current User (/me)
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const onboardingProfile = await db.getOnboardingProfile(user.id);
    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      onboardingProfile: onboardingProfile || null
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Save Onboarding Profile
router.post('/onboarding', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const profile = {
      userId: decoded.id,
      role: decoded.role,
      ...req.body
    };

    const saved = await db.saveOnboardingProfile(profile);

    return res.json({
      message: 'Onboarding completed successfully',
      profile: saved
    });
  } catch (err) {
    console.error('Onboarding error:', err);
    return res.status(400).json({ error: 'Failed to save onboarding profile' });
  }
});

module.exports = router;
