// src/repositories/user.repository.js
const db = require('../config/db');

/**
 * Finds a user by their email.
 * @param {string} email - The email to search for.
 * @returns {Promise<object|undefined>} The user object or undefined if not found.
 */
const findByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

const findById = async (id) => {
  const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
};

const updateUserProfile = async (userId, data) => {
  const allowed = ['full_name', 'phone', 'address', 'dob'];
  const sets = [];
  const vals = [];
  let i = 1;

  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key}=$${i}`);
      vals.push(data[key]);
      i++;
    }
  }

  if (!sets.length) {
    return findById(userId);
  }

  vals.push(userId);
  const { rows } = await db.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id=$${i} RETURNING *`,
    vals
  );

  return rows[0];
};

/**
 * Creates a new user in the database.
 * @param {string} email
 * @param {string} passwordHash - The already hashed password.
 * @param {string} fullName
 * @param {string} role - 'STUDENT', 'ACADEMIC_OFFICE', or 'ADMIN'.
 * @returns {Promise<object>} The newly created user object (without password hash).
 */
const createUser = async (email, passwordHash, fullName, role) => {
  const { rows } = await db.query(
    'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role, created_at',
    [email, passwordHash, fullName, role]
  );
  return rows[0];
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUserProfile,
};