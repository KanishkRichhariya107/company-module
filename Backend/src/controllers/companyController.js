// src/controllers/companyController.js
import pool from '../config/db.js';

export const createCompany = async (req, res, next) => {
  try {
    const owner_id = req.user.id;
    const { company_name, address, city, state, country, postal_code, industry, website, description } = req.body;
    const q = `INSERT INTO company_profile (owner_id, company_name, address, city, state, country, postal_code, industry, website, description)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`;
    const values = [owner_id, company_name, address, city, state, country, postal_code, industry, website || null, description || null];
    const r = await pool.query(q, values);
    res.json({ message: 'Company created', company: r.rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getCompany = async (req, res, next) => {
  try {
    const owner_id = req.user.id;
    const r = await pool.query('SELECT * FROM company_profile WHERE owner_id=$1', [owner_id]);
    res.json(r.rows[0] || null);
  } catch (err) {
    next(err);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const owner_id = req.user.id;
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key of ['company_name','address','city','state','country','postal_code','website','industry','description']) {
      if (req.body[key] !== undefined) {
        fields.push(`${key} = $${idx++}`);
        values.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ message: 'No fields to update' });
    values.push(owner_id);
    const q = `UPDATE company_profile SET ${fields.join(', ')} WHERE owner_id = $${idx} RETURNING *`;
    const r = await pool.query(q, values);
    res.json({ message: 'Company updated', company: r.rows[0] });
  } catch (err) {
    next(err);
  }
};
