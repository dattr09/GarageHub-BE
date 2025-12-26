const RepairOrder = require("../models/repairOrderModel");
const Order = require("../models/orderModel");

exports.getStatistics = async (req, res) => {
    try {
        const { type, month, year, quarter } = req.query;
        let dateFilter = {};

        // Lọc theo tháng
        if (type === "month") {
            const monthNum = Number(month);
            const yearNum = Number(year);
            
            // Ngày bắt đầu: 00:00:00 của ngày 1 tháng đó
            const startDate = new Date(Date.UTC(yearNum, monthNum - 1, 1, 0, 0, 0, 0));
            
            // Ngày kết thúc: 00:00:00 của ngày 1 tháng sau
            // Nếu tháng là 12, tháng sau là tháng 1 năm sau
            const endMonth = monthNum === 12 ? 1 : monthNum + 1;
            const endYear = monthNum === 12 ? yearNum + 1 : yearNum;
            const endDate = new Date(Date.UTC(endYear, endMonth - 1, 1, 0, 0, 0, 0));
            
            dateFilter = {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            };
        }
        // Lọc theo quý
        else if (type === "quarter") {
            const quarterNum = Number(quarter);
            const yearNum = Number(year);
            
            // Tính tháng bắt đầu (1, 4, 7, 10)
            const startMonth = (quarterNum - 1) * 3 + 1;
            // Tính tháng kết thúc (4, 7, 10, 13)
            const endMonth = startMonth + 3;
            
            // Ngày bắt đầu: 00:00:00 của ngày 1 tháng đầu quý
            const startDate = new Date(Date.UTC(yearNum, startMonth - 1, 1, 0, 0, 0, 0));
            
            // Ngày kết thúc: 00:00:00 của ngày 1 tháng sau quý (tháng đầu quý tiếp theo)
            // Nếu endMonth > 12, chuyển sang năm sau
            const endYear = endMonth > 12 ? yearNum + 1 : yearNum;
            const actualEndMonth = endMonth > 12 ? endMonth - 12 : endMonth;
            const endDate = new Date(Date.UTC(endYear, actualEndMonth - 1, 1, 0, 0, 0, 0));
            
            dateFilter = {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
                }
            };
        }
        // Lọc theo năm
        else if (type === "year") {
            const yearNum = Number(year);
            
            // Ngày bắt đầu: 00:00:00 ngày 1 tháng 1
            const startDate = new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0, 0));
            
            // Ngày kết thúc: 00:00:00 ngày 1 tháng 1 năm sau
            const endDate = new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0, 0));
            
            dateFilter = {
                createdAt: {
                    $gte: startDate,
                    $lt: endDate
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