const kabkoModel = require('../models/kabkoModel');

const getAllKabko = async (req, res) => {
  try {
    const data = await kabkoModel.getAllKabko();
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getKabkoById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await kabkoModel.getKabkoById(id);
    if (!data) {
      return res.status(404).json({ status: 'error', message: 'Data kabupaten/kota tidak ditemukan' });
    }
    res.status(200).json({ status: 'success', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const createKabko = async (req, res) => {
  try {
    const { id_provinsi, nama } = req.body;
    if (!id_provinsi || !nama) {
      return res.status(400).json({ status: 'error', message: 'ID Provinsi dan nama kabupaten/kota wajib diisi' });
    }
    const data = await kabkoModel.createKabko(id_provinsi, nama);
    res.status(201).json({ status: 'success', message: 'Kabupaten/kota berhasil ditambahkan', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const updateKabko = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_provinsi, nama } = req.body;
    const existingData = await kabkoModel.getKabkoById(id);
    
    if (!existingData) {
      return res.status(404).json({ status: 'error', message: 'Data kabupaten/kota tidak ditemukan' });
    }

    const data = await kabkoModel.updateKabko(id, id_provinsi, nama);
    res.status(200).json({ status: 'success', message: 'Kabupaten/kota berhasil diperbarui', data });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const deleteKabko = async (req, res) => {
  try {
    const { id } = req.params;
    const existingData = await kabkoModel.getKabkoById(id);
    
    if (!existingData) {
      return res.status(404).json({ status: 'error', message: 'Data kabupaten/kota tidak ditemukan' });
    }

    await kabkoModel.deleteKabko(id);
    res.status(200).json({ status: 'success', message: 'Kabupaten/kota berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  getAllKabko,
  getKabkoById,
  createKabko,
  updateKabko,
  deleteKabko,
};
