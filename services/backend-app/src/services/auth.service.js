// src/services/auth.service.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');

// In a real production app, this secret MUST be in a .env file!
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';

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
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '3h' } // Token will be valid for 1 hour
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
      console.log(user.id);
      console.log(typeof(user.id));
      console.log(id);
      console.log(typeof(id));
      // Generic error to prevent email enumeration
      throw new Error('Invalid user');
    }
    return { user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } };
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser
};