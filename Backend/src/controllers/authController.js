import pool from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    console.log('REGISTER BODY:', req.body);

    const { full_name, email, password, mobile_no } = req.body;
    let gender = req.body.gender;
    if (!gender || !['m','f','o'].includes(gender)) gender = 'o'; // default 'o' (other)

    // basic validation
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await hashPassword(password);

    const user = await pool.query(
      `INSERT INTO users (full_name, email, password, mobile_no, gender)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, mobile_no, gender`,
      [full_name, email, hashed, mobile_no || null, gender]
    );
    const token = signToken({ id: user.id, email: user.email });
    res.json({ message: 'Registered', token, user });
  } catch (err) {
    console.error('REGISTER ERROR', err);
    return res.status(500).json({ message: err.message });
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const r = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (!r.rows.length) return res.status(400).json({ message: 'Invalid credentials' });
    const user = r.rows[0];
    const ok = await comparePassword(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email });
    res.json({ message: 'Logged in', token, user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res) => {
  res.json({ message: 'Email verify endpoint (stub) — pretend verified' });
};

// stub: client will call /verify-mobile with otp (Phase1: just returns success)
export const verifyMobile = async (req, res) => {
  res.json({ message: 'Mobile verify endpoint (stub) — pretend verified' });
};

export const me = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const r = await pool.query('SELECT id, full_name, email, mobile_no, is_email_verified, is_mobile_verified FROM users WHERE id=$1', [userId]);
    res.json(r.rows[0] || null);
  } catch (err) {
    next(err);
  }
};