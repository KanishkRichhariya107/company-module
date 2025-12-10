import pool from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signToken, verifyToken } from "../utils/jwt.js";
import crypto from "crypto";
import dotenv from "dotenv";
import { sendEmail } from "../utils/email.js";
import admin from "../utils/firebase.js";
import bcrypt from "bcrypt";

dotenv.config();

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

dotenv.config();

// ---------------- SEND VERIFY EMAIL (protected) ----------------
export const sendVerifyEmail = async (req, res) => {
  try {
    // authMiddleware must set req.user (id and email)
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    if (!userId || !userEmail) return res.status(401).json({ message: "Not authenticated" });

    // create a short-lived verification token (type included)
    const token = signToken({ id: userId, type: "email_verify" }, { expiresIn: "15m" });

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // send real email via nodemailer util
    await sendEmail(
      userEmail,
      "Verify Your Email",
      `
        <h2>Email Verification</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyLink}">${verifyLink}</a>
        <p>If you didn't request this, ignore.</p>
      `
    );

    return res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("sendVerifyEmail error:", err);
    return res.status(500).json({ message: "Error sending email" });
  }
};

// ---------------- VERIFY EMAIL (public) ----------------
// GET /api/auth/verify-email?token=...
export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).json({ message: "Missing token" });

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // ensure this token was issued for email verification
    if (payload.type !== "email_verify") return res.status(400).json({ message: "Invalid token type" });

    const userId = payload.id;
    await pool.query("UPDATE users SET is_email_verified = TRUE WHERE id = $1", [userId]);

    // Option A: redirect to a frontend success page
    // return res.redirect(`${process.env.CLIENT_URL}/verify-success`);
    // Option B: return JSON
    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("verifyEmail error:", err);
    return res.status(500).json({ message: "Verification failed" });
  }
};

// ---------------- SEND VERIFY MOBILE (protected, optional helper) ----------------
// NOTE: with Firebase SMS the client usually triggers the SMS flow. This endpoint simply
// confirms user exists and returns the mobile number so the client can use Firebase UI to send SMS.
export const sendVerifyMobile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const r = await pool.query("SELECT mobile_no, id FROM users WHERE id=$1", [userId]);
    if (!r.rows.length) return res.status(404).json({ message: "User not found" });

    const mobile = r.rows[0].mobile_no;
    if (!mobile) return res.status(400).json({ message: "No mobile number on record" });

    // For Firebase flow: client will call Firebase to send SMS to `mobile`.
    // We return the mobile so the client can use it in its Firebase call.
    return res.json({ message: "OK", mobile });
  } catch (err) {
    console.error("sendVerifyMobile error:", err);
    return res.status(500).json({ message: "Failed to initiate mobile verification" });
  }
};

// ---------------- VERIFY MOBILE (server verifies firebase token from client) ----------------
// POST /api/auth/verify-mobile  { firebase_token }
export const verifyMobile = async (req, res) => {
  try {
    const { firebase_token } = req.body;
    if (!firebase_token) return res.status(400).json({ message: "Missing firebase_token" });

    // verify token with Firebase Admin SDK
    const decoded = await admin.auth().verifyIdToken(firebase_token);

    // decoded.uid is firebase user id. You must map firebase user -> your DB user.
    // Approach: during phone sign-in on client, set `uid` or email claim to your app user id,
    // or the client sends current JWT along with firebase_token to link accounts.
    // We'll support the simple flow: require Authorization header (your JWT) + firebase_token,
    // then mark that jwt user as verified.

    // Prefer using the authenticated user (if available)
    const jwtUserId = req.user?.id;
    if (!jwtUserId) return res.status(401).json({ message: "Send your JWT with firebase_token" });

    // optional: you can also verify that decoded.phone_number matches DB mobile_no
    const r = await pool.query("SELECT mobile_no FROM users WHERE id=$1", [jwtUserId]);
    if (!r.rows.length) return res.status(404).json({ message: "User not found" });
    const dbMobile = r.rows[0].mobile_no;
    if (decoded.phone_number && dbMobile && decoded.phone_number.replace(/\s+/g,'') !== dbMobile.replace(/\s+/g,'')) {
      // phone numbers don't match — reject (optional)
      // return res.status(400).json({ message: "Phone number mismatch" });
    }

    // mark mobile verified for jwt user
    await pool.query("UPDATE users SET is_mobile_verified = TRUE WHERE id = $1", [jwtUserId]);

    return res.json({ message: "Mobile verified successfully" });
  } catch (err) {
    console.error("verifyMobile error:", err);
    return res.status(400).json({ message: "Invalid or expired firebase token" });
  }
};

export const me = async (req, res, next) => { try { const userId = req.user?.id; const r = await pool.query('SELECT id, full_name, email, mobile_no, is_email_verified, is_mobile_verified FROM users WHERE id=$1', [userId]); res.json(r.rows[0] || null); } catch (err) { next(err); } };