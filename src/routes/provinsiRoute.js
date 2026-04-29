const express = require('express');
const router = express.Router();
const provinsiController = require('../controllers/provinsiController');

router.get('/', provinsiController.getAllProvinsi);
router.get('/:id', provinsiController.getProvinsiById);
router.post('/', provinsiController.createProvinsi);
router.put('/:id', provinsiController.updateProvinsi);
router.delete('/:id', provinsiController.deleteProvinsi);

module.exports = router;
