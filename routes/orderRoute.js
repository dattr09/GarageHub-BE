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
            return res.status(404).send(generateConfirmationHTML('notfound', null));
        }

        // Kiểm tra nếu đơn hàng đã được xác nhận trước đó
        if (order.status === "Completed") {
            return res.send(generateConfirmationHTML('already', order));
        }

        // Cập nhật trạng thái đơn hàng thành "Completed"
        order.status = "Completed";
        order.updatedAt = new Date();
        await order.save();

        // Emit socket event để cập nhật real-time trên mobile/web
        const orderSocket = req.app.get("orderSocket");
        if (orderSocket && order.userId) {
            orderSocket.emitOrderStatusUpdate(order.userId.toString(), order);
            console.log(`📦 Order status update emitted for user ${order.userId}`);
        }

        // Trả về trang HTML xác nhận thành công
        return res.send(generateConfirmationHTML('success', order));
    } catch (error) {
        console.error("Lỗi khi xác nhận đơn hàng:", error);
        return res.status(500).send(generateConfirmationHTML('error', null));
    }
});

// Helper function để tạo HTML response cho mobile
function generateConfirmationHTML(status, order) {
    const statusConfig = {
        success: {
            title: 'Xác nhận thành công!',
            message: `Đơn hàng #${order?.orderId || ''} đã được xác nhận thành công.`,
            icon: '✅',
            color: '#22c55e'
        },
        already: {
            title: 'Đã xác nhận trước đó',
            message: `Đơn hàng #${order?.orderId || ''} đã được xác nhận từ trước.`,
            icon: '📋',
            color: '#3b82f6'
        },
        notfound: {
            title: 'Không tìm thấy',
            message: 'Không tìm thấy đơn hàng này.',
            icon: '❌',
            color: '#ef4444'
        },
        error: {
            title: 'Lỗi hệ thống',
            message: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
            icon: '⚠️',
            color: '#f59e0b'
        }
    };

    const config = statusConfig[status] || statusConfig.error;

    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.title} - Garage Hub</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .card {
                background: white;
                border-radius: 20px;
                padding: 40px;
                text-align: center;
                max-width: 400px;
                width: 100%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .icon {
                font-size: 64px;
                margin-bottom: 20px;
            }
            .title {
                font-size: 24px;
                font-weight: bold;
                color: ${config.color};
                margin-bottom: 15px;
            }
            .message {
                font-size: 16px;
                color: #666;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .brand {
                font-size: 14px;
                color: #999;
                margin-top: 20px;
            }
            .close-btn {
                background: ${config.color};
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                cursor: pointer;
                text-decoration: none;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">${config.icon}</div>
            <h1 class="title">${config.title}</h1>
            <p class="message">${config.message}</p>
            <p class="message">Bạn có thể đóng trang này và quay lại ứng dụng.</p>
            <p class="brand">🔧 Garage Hub</p>
        </div>
    </body>
    </html>
    `;
}

module.exports = router;
