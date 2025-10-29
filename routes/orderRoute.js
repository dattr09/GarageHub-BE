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
router.get("/confirm-order/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;

        // Tìm đơn hàng theo ID
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
        }

        // Cập nhật trạng thái đơn hàng
        order.status = "Completed";
        await order.save();

        res.status(200).json({ message: "Đơn hàng đã được xác nhận thành công!", order });
    } catch (error) {
        console.error("Lỗi khi xác nhận đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server!", error: error.message });
    }
});

module.exports = router;
