const pool = require('../config/db');

const getAllKabko = async () => {
  const result = await pool.query(`
    SELECT kabko.*, provinsi.nama as nama_provinsi 
    FROM kabko 
    JOIN provinsi ON kabko.id_provinsi = provinsi.id 
    ORDER BY kabko.id ASC
  `);
  return result.rows;
};

const getKabkoById = async (id) => {
  const result = await pool.query('SELECT * FROM kabko WHERE id = $1', [id]);
  return result.rows[0];
};

const createKabko = async (id_provinsi, nama) => {
  const result = await pool.query(
    'INSERT INTO kabko (id_provinsi, nama) VALUES ($1, $2) RETURNING *',
    [id_provinsi, nama]
  );
  return result.rows[0];
};

const updateKabko = async (id, id_provinsi, nama) => {
  const result = await pool.query(
    'UPDATE kabko SET id_provinsi = $1, nama = $2 WHERE id = $3 RETURNING *',
    [id_provinsi, nama, id]
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
