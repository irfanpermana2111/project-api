const pool = require('../config/db');

const getAllKabko = async () => {
  const result = await pool.query(`
    SELECT kabko.*, provinsi.nama as nama_provinsi 
    FROM kabko 
    JOIN provinsi ON kabko.provinsi_id = provinsi.id 
    ORDER BY kabko.id ASC
  `);
  return result.rows;
};

const getKabkoById = async (id) => {
  const result = await pool.query('SELECT * FROM kabko WHERE id = $1', [id]);
  return result.rows[0];
};

const createKabko = async (provinsi_id, nama) => {
  const result = await pool.query(
    'INSERT INTO kabko (provinsi_id, nama) VALUES ($1, $2) RETURNING *',
    [provinsi_id, nama]
  );
  return result.rows[0];
};

const updateKabko = async (id, provinsi_id, nama) => {
  const result = await pool.query(
    'UPDATE kabko SET provinsi_id = $1, nama = $2 WHERE id = $3 RETURNING *',
    [provinsi_id, nama, id]
  );
  return result.rows[0];
};

const deleteKabko = async (id) => {
  await pool.query('DELETE FROM kabko WHERE id = $1', [id]);
};

module.exports = {
  getAllKabko,
  getKabkoById,
  createKabko,
  updateKabko,
  deleteKabko,
};
