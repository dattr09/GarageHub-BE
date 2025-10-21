const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');

// Thống kê reviews
router.get('/stats', reviewsController.getStats);

// Lấy reviews đã duyệt (hiển thị công khai)
router.get('/approved', reviewsController.getApproved);

// Lấy reviews theo userId
router.get('/user/:userId', reviewsController.getByUser);

// Lấy tất cả reviews
router.get('/', /*authorizeRoles('Admin', 'Employee'),*/ reviewsController.getAll);

// Lấy 1 review theo ID
router.get('/:reviewId', reviewsController.getById);

// Tạo hoặc cập nhật review
router.post('/', /*authorizeRoles('Customer', 'User'),*/ reviewsController.createOrUpdate);

// Duyệt review (Admin only)
router.put('/:reviewId/approve', /*authorizeRoles('Admin'),*/ reviewsController.approve);

// Cập nhật review
router.put('/:reviewId', /*authorizeRoles('Admin', 'Customer'),*/ reviewsController.update);

// Xóa review
router.delete('/:reviewId', /*authorizeRoles('Admin'),*/ reviewsController.delete);

module.exports = router;
