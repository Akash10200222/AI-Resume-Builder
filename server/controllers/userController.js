import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import Resume from '../models/Resume.js';

const sanitizeUser = (user) => {
  const userObject = user.toObject ? user.toObject() : { ...user };
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST: /api/users/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(newUser._id);

    return res.status(201).json({
      message: 'User created successfully',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// POST: /api/users/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Login successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET: /api/users/data
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// GET: /api/users/resumes
export const getUserResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 });
    return res.status(200).json({ resumes });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
