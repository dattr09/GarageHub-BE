const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendOrderConfirmationEmail({ to, orderId, totalAmount, confirmationLink, items }) {
    const itemsHtml = items
        .map(
            (item) => `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: left;">${item.name}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.brand}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${item.price.toLocaleString()} đ</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${(item.price * item.quantity).toLocaleString()} đ</td>
            </tr>
        `
        )
        .join("");

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f4f4f4; text-align: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
            <div style="background-color: #4CAF50; padding: 20px; border-radius: 10px 10px 0 0;">
                <h1 style="color: #fff; font-size: 28px; margin: 0;">Garage Hub</h1>
                <p style="color: #d9fdd3; font-size: 16px; margin: 5px 0 0;">Xác nhận đơn hàng của bạn</p>
            </div>
            <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 10px 10px;">
                <p style="font-size: 18px; color: #333; margin: 0;">Xin chào,</p>
                <p style="font-size: 16px; color: #555; margin: 15px 0;">
                    Đơn hàng của bạn đã được tạo thành công! Đây là thông tin đơn hàng:
                </p>
                <div style="margin: 20px 0;">
                    <p style="font-size: 16px; color: #333; margin: 0;">Mã đơn hàng: <strong>${orderId}</strong></p>
                    <p style="font-size: 16px; color: #333; margin: 0;">Tổng tiền: <strong>${totalAmount.toLocaleString()} đ</strong></p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f4f4f4;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Tên sản phẩm</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Hãng</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Số lượng</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Giá</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Tạm tính</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                <p style="font-size: 16px; color: #555; margin: 15px 0;">
                    Nhấn vào liên kết dưới đây để xác nhận đơn hàng:
                </p>
                <a href="${confirmationLink}" style="font-size: 16px; color: #4CAF50; text-decoration: none; font-weight: bold;">
                    Xác nhận đơn hàng
                </a>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 14px; color: #888; margin: 0;">
                    Nếu bạn cần hỗ trợ, vui lòng liên hệ với chúng tôi qua email hoặc hotline bên dưới.
                </p>
            </div>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 12px; color: #888; margin: 0;">© 2025 Garage Hub. All rights reserved.</p>
                <p style="font-size: 12px; color: #888; margin: 0;">Hotline: 1800-123-456 | Email: support@garagehub.com</p>
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"Garage Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Xác nhận đơn hàng từ Garage Hub",
        html: htmlContent,
    });
}

module.exports = {
    sendOrderConfirmationEmail,
};