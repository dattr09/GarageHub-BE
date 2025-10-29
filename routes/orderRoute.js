const express = require("express");
const { authenticateToken } = require("../middleware/authMiddleware");
const { createOrder } = require("../controllers/orderController");
const Order = require("../models/orderModel");

const router = express.Router();
const orderController = require("../controllers/orderController");

router.post("/", orderController.createOrder);
router.get("/", orderController.getAllOrders);
router.get("/user/:userId", orderController.getOrdersByUser);
router.get("/:orderId", orderController.getOrderById);
router.put("/:orderId", orderController.updateOrder);
router.delete("/:orderId", orderController.deleteOrder);
router.post("/", authenticateToken, createOrder);
router.get("/confirm-order/:id", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        // Kiểm tra nếu không tìm thấy đơn hàng
        if (!order) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/confirm-order/${req.params.id}?status=notfound`
            );
        }

        // Kiểm tra nếu đơn hàng đã được xác nhận trước đó
        if (order.status === "Completed") {
            return res.redirect(
                `${process.env.FRONTEND_URL}/confirm-order/${order._id}?status=already`
            );
        }

        // Cập nhật trạng thái đơn hàng thành "Completed"
        order.status = "Completed";
        order.updatedAt = new Date(); // Cập nhật thời gian chỉnh sửa
        await order.save();

        // Chuyển hướng sang frontend hiển thị giao diện xác nhận thành công
        return res.redirect(
            `${process.env.FRONTEND_URL}/confirm-order/${order._id}?status=success`
        );
    } catch (error) {
        console.error("Lỗi khi xác nhận đơn hàng:", error);

        // Chuyển hướng sang frontend hiển thị giao diện lỗi
        res.redirect(
            `${process.env.FRONTEND_URL}/confirm-order/${req.params.id}?status=error`
        );
    }
});

module.exports = router;
