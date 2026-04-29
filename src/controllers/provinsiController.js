const provinsiModel = require('../models/provinsiModel');

const getAllProvinsi = async (req, res) => {
  try {
    const data = await provinsiModel.getAllProvinsi();
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getProvinsiById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await provinsiModel.getProvinsiById(id);
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Data provinsi tidak ditemukan' });
    }
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createProvinsi = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) {
      return res.status(400).json({ status: 'error', message: 'Nama provinsi wajib diisi' });
    }
    const data = await provinsiModel.createProvinsi(nama);
    res.status(201).json({ status: 'success', message: 'Provinsi berhasil ditambahkan', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateProvinsi = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;
    const existingData = await provinsiModel.getProvinsiById(id);
    
    if (!existingData) {
      return res.status(404).json({ status: 'error', message: 'Data provinsi tidak ditemukan' });
    }

    const data = await provinsiModel.updateProvinsi(id, nama);
    res.status(200).json({ status: 'success', message: 'Provinsi berhasil diperbarui', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const deleteProvinsi = async (req, res) => {
  try {
    const { id } = req.params;
    const existingData = await provinsiModel.getProvinsiById(id);
    
    if (!existingData) {
      return res.status(404).json({ status: 'error', message: 'Data provinsi tidak ditemukan' });
    }

    await provinsiModel.deleteProvinsi(id);
    res.status(200).json({ status: 'success', message: 'Provinsi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getAllProvinsi,
  getProvinsiById,
  createProvinsi,
  updateProvinsi,
  deleteProvinsi,
};
