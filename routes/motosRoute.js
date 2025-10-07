const express = require('express');
const router = express.Router();
const motosController = require('../controllers/motosController');


// Các route API
router.get('/', /*authorizeRoles('Admin', 'Employee'),*/ motosController.getAll);
router.get('/:licensePlate', /*authorizeRoles('Admin', 'Employee'),*/ motosController.getByLicensePlate);
router.post('/', /*authorizeRoles('Admin'),*/ motosController.create);
router.put('/:licensePlate', /*authorizeRoles('Admin', 'Employee'),*/ motosController.update);
router.delete('/:licensePlate', /*authorizeRoles('Admin'),*/ motosController.delete);

module.exports = router;
