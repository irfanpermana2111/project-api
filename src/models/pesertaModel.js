const pool = require('../config/db');

const getAllPeserta = async () => {
  const result = await pool.query(`
    SELECT peserta.*, kabko.nama as nama_kabko, provinsi.nama as nama_provinsi
    FROM peserta
    LEFT JOIN kabko ON peserta.kabko_id = kabko.id
    LEFT JOIN provinsi ON kabko.provinsi_id = provinsi.id
    ORDER BY peserta.id ASC
  `);
  return result.rows;
};

const getPesertaById = async (id) => {
  const result = await pool.query('SELECT * FROM peserta WHERE id = $1', [id]);
  return result.rows[0];
};

const createPeserta = async (data) => {
  const { nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id } = data;
  const result = await pool.query(
    `INSERT INTO peserta (nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id]
  );
  return result.rows[0];
};

const updatePeserta = async (id, data) => {
  const { nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id } = data;
  const result = await pool.query(
    `UPDATE peserta 
     SET nama = $1, tempatlahir = $2, tanggallahir = $3, agama = $4, alamat = $5, telepon = $6, jk = $7, hobi = $8, foto = $9, kabko_id = $10 
     WHERE id = $11 RETURNING *`,
    [nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id, id]
  );
  return result.rows[0];
};

const deletePeserta = async (id) => {
  await pool.query('DELETE FROM peserta WHERE id = $1', [id]);
};

module.exports = {
  getAllPeserta,
  getPesertaById,
  createPeserta,
  updatePeserta,
  deletePeserta,
};
