const RepairOrder = require("../models/repairOrderModel");
const Order = require("../models/orderModel");

exports.getStatistics = async (req, res) => {
    try {
        const { type, month, year, quarter } = req.query;
        let dateFilter = {};

        // Lọc theo tháng
        if (type === "month") {
            dateFilter = {
                createdAt: {
                    $gte: new Date(`${year}-${month}-01`),
                    $lt: new Date(`${year}-${Number(month) + 1}-01`)
                }
            };
        }
        // Lọc theo quý
        else if (type === "quarter") {
            const startMonth = (quarter - 1) * 3 + 1;
            const endMonth = startMonth + 3;
            dateFilter = {
                createdAt: {
                    $gte: new Date(`${year}-${startMonth}-01`),
                    $lt: new Date(`${year}-${endMonth}-01`)
                }
            };
        }
        // Lọc theo năm
        else if (type === "year") {
            dateFilter = {
                createdAt: {
                    $gte: new Date(`${year}-01-01`),
                    $lt: new Date(`${Number(year) + 1}-01-01`)
                }
            };
        }

        // Đơn sửa chữa hoàn thành
        const repairs = await RepairOrder.find({ status: "Completed", ...dateFilter });
        const repairsCount = repairs.length;
        const repairsIncome = repairs.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

        // Đơn hàng đã bán thành công
        const orders = await Order.find({ ...dateFilter });
        const ordersCount = orders.length;
        const ordersIncome = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        res.json({
            orders: ordersCount,
            ordersIncome,
            repairs: repairsCount,
            repairsIncome
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};