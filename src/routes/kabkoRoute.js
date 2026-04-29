const express = require('express');
const router = express.Router();
const kabkoController = require('../controllers/kabkoController');

router.get('/', kabkoController.getAllKabko);
router.get('/:id', kabkoController.getKabkoById);
router.post('/', kabkoController.createKabko);
router.put('/:id', kabkoController.updateKabko);
router.delete('/:id', kabkoController.deleteKabko);

module.exports = router;
