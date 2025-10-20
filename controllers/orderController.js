const Order = require('../models/orderModel');

class OrderController {
    // [POST] /api/orders
    async create(req, res) {
        try {
            const orderData = req.body;
            
            if (!orderData || !orderData.items || orderData.items.length === 0) {
                return res.status(400).json({ error: 'Đơn hàng không hợp lệ.' });
            }

            const order = new Order(orderData);
            const created = await order.save();
            
            return res.status(201).json(created);
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(400).json({ error: error.message });
        }
    }

    // [GET] /api/orders
    async getAll(req, res) {
        try {
            const orders = await Order.find()
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });
            return res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // [GET] /api/orders/user/:userId
    async getByUser(req, res) {
        try {
            const { userId } = req.params;
            
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }

            const orders = await Order.find({ userId })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });
            return res.status(200).json(orders);
        } catch (error) {
            console.error('Error fetching orders by user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // [GET] /api/orders/:orderId
    async getById(req, res) {
        try {
            const { orderId } = req.params;
            const order = await Order.findById(orderId)
                .populate('userId', 'name email');
            
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            return res.status(200).json(order);
        } catch (error) {
            console.error('Error fetching order by ID:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // [PUT] /api/orders/:orderId
    async update(req, res) {
        try {
            const { orderId } = req.params;
            const updatedOrder = await Order.findByIdAndUpdate(
                orderId, 
                req.body, 
                { new: true, runValidators: true }
            ).populate('userId', 'name email');
            
            if (!updatedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            return res.status(200).json(updatedOrder);
        } catch (error) {
            console.error('Error updating order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // [DELETE] /api/orders/:orderId
    async delete(req, res) {
        try {
            const { orderId } = req.params;
            const deletedOrder = await Order.findByIdAndDelete(orderId);
            
            if (!deletedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
            
            return res.status(200).json({ message: 'Order deleted successfully' });
        } catch (error) {
            console.error('Error deleting order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new OrderController();