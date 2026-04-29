const pool = require('../config/db');

const getAllProvinsi = async () => {
  const result = await pool.query('SELECT * FROM provinsi ORDER BY id ASC');
  return result.rows;
};

const getProvinsiById = async (id) => {
  const result = await pool.query('SELECT * FROM provinsi WHERE id = $1', [id]);
  return result.rows[0];
};

const createProvinsi = async (nama) => {
  const result = await pool.query(
    'INSERT INTO provinsi (nama) VALUES ($1) RETURNING *',
    [nama]
  );
  return result.rows[0];
};

const updateProvinsi = async (id, nama) => {
  const result = await pool.query(
    'UPDATE provinsi SET nama = $1 WHERE id = $2 RETURNING *',
    [nama, id]
  );
  return result.rows[0];
};

const deleteProvinsi = async (id) => {
  await pool.query('DELETE FROM provinsi WHERE id = $1', [id]);
};

module.exports = {
  getAllProvinsi,
  getProvinsiById,
  createProvinsi,
  updateProvinsi,
  deleteProvinsi,
};
