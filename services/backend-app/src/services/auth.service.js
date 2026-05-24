// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

// In a real production app, this secret MUST be in a .env file!
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-dev';

/**
 * Business logic to register a new user.
 */
const registerUser = async (email, password, fullName, role) => {
  // 1. Check if user already exists
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    // We throw an error that the controller will catch
    throw new Error('Email already exists');
  }

  // 2. Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Create the user
  const newUser = await userRepository.createUser(email, passwordHash, fullName, role);
  return newUser;
};

/**
 * Business logic to log a user in.
 */
const loginUser = async (email, password) => {
  // 1. Find the user by email
  const user = await userRepository.findByEmail(email);
  if (!user) {
    // Generic error to prevent email enumeration
    throw new Error('Invalid email or password');
  }

  // 2. Compare the provided password with the stored hash
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // 3. Generate a JWT if credentials are valid
  // 3. Generate a JWT if credentials are valid
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: '7d' } // ← đổi từ '3h' thành '7d'
);

  // 4. Return the user info (without password) and the token
  return {
    user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role },
    token,
  };
};

const getUser = async (token) => {
  try {
    // Verify the token and attach the decoded payload (user info) to the request object
    const decoded = jwt.verify(token, JWT_SECRET);
    const { id, email, role } = decoded;
    const user = await userRepository.findByEmail(email);
    if (!user || user.id != id) {
      // Generic error to prevent user enumeration
      throw new Error('Invalid user');
    }
    return { user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role, phone: user.phone, address: user.address, dob: user.dob, created_at: user.created_at } };
  } catch (err) {
    throw new Error(err.message);
  }
};

const updateUserProfile = async (userId, data) => {
  const user = await userRepository.updateUserProfile(userId, {
    full_name: data.fullName,
    phone: data.phone,
    address: data.address,
    dob: data.dob
  });

  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    phone: user.phone,
    address: user.address,
    dob: user.dob,
    created_at: user.created_at
  };
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  updateUserProfile
};