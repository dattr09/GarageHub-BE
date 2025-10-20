const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Các route API

router.get('/user/:userId', /*authorizeRoles('Admin', 'Employee', 'Customer'),*/ orderController.getByUser);
router.get('/', /*authorizeRoles('Admin', 'Employee'),*/ orderController.getAll);
router.get('/:orderId', /*authorizeRoles('Admin', 'Employee'),*/ orderController.getById);
router.post('/', /*authorizeRoles('Admin', 'Employee', 'Customer'),*/ orderController.create);
router.put('/:orderId', /*authorizeRoles('Admin', 'Employee'),*/ orderController.update);
router.delete('/:orderId', /*authorizeRoles('Admin'),*/ orderController.delete);

module.exports = router;