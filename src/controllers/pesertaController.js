const pesertaModel = require('../models/pesertaModel');

const getAllPeserta = async (req, res) => {
  try {
    const data = await pesertaModel.getAllPeserta();
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getPesertaById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await pesertaModel.getPesertaById(id);
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Data peserta tidak ditemukan' });
    }
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createPeserta = async (req, res) => {
  try {
    const { nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id } = req.body;
    
    if (!nama || !kabko_id) {
      return res.status(400).json({ status: 'error', message: 'Nama dan ID Kabko wajib diisi' });
    }

    const data = await pesertaModel.createPeserta({
      nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id
    });
    res.status(201).json({ status: 'success', message: 'Peserta berhasil ditambahkan', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updatePeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id } = req.body;
    
    const existingData = await pesertaModel.getPesertaById(id);
    if (!existingData) {
      return res.status(404).json({ status: 'error', message: 'Data peserta tidak ditemukan' });
    }

    const data = await pesertaModel.updatePeserta(id, {
      nama, tempatlahir, tanggallahir, agama, alamat, telepon, jk, hobi, foto, kabko_id
    });
    res.status(200).json({ status: 'success', message: 'Peserta berhasil diperbarui', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const deletePeserta = async (req, res) => {
  try {
    const { id } = req.params;
    const existingData = await pesertaModel.getPesertaById(id);
    
    if (!existingData) {
      return res.status(404).json({ status: 'error', message: 'Data peserta tidak ditemukan' });
    }

    await pesertaModel.deletePeserta(id);
    res.status(200).json({ status: 'success', message: 'Peserta berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getAllPeserta,
  getPesertaById,
  createPeserta,
  updatePeserta,
  deletePeserta,
};
