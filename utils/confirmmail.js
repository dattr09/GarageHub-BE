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
                <td style="padding: 10px; border: 1px solid #eee;">${item.name}</td>
                <td style="padding: 10px; border: 1px solid #eee; text-align: center;">${item.brand}</td>
                <td style="padding: 10px; border: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; border: 1px solid #eee; text-align: right;">${item.price.toLocaleString()} đ</td>
                <td style="padding: 10px; border: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString()} đ</td>
            </tr>
        `
        )
        .join("");

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 40px; color: #333; text-align: center;">
            <div style="max-width: 650px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="background-color: #22c55e; color: white; padding: 25px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Garage Hub</h1>
                    <p style="margin: 5px 0 0; font-size: 16px;">Xác nhận đơn hàng của bạn</p>
                </div>

                <!-- Body -->
                <div style="padding: 30px;">
                    <p style="font-size: 16px; margin: 0 0 10px;">Xin chào,</p>
                    <p style="font-size: 15px; margin: 0 0 20px; line-height: 1.6;">
                        Cảm ơn bạn đã mua hàng tại <strong>Garage Hub</strong>! Dưới đây là thông tin đơn hàng của bạn:
                    </p>

                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                        <p style="margin: 5px 0; font-size: 15px;">🧾 <strong>Mã đơn hàng:</strong> ${orderId}</p>
                        <p style="margin: 5px 0; font-size: 15px;">💰 <strong>Tổng tiền:</strong> ${totalAmount.toLocaleString()} đ</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; text-align: center;">
                        <thead>
                            <tr style="background-color: #e5e7eb; text-align: center;">
                                <th style="padding: 10px; border: 1px solid #ddd;">Tên sản phẩm</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Hãng</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">SL</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Giá</th>
                                <th style="padding: 10px; border: 1px solid #ddd;">Tạm tính</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${confirmationLink}"
                           style="background-color: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                            ✅ XÁC NHẬN ĐƠN HÀNG
                        </a>
                    </div>

                    <p style="font-size: 13px; color: #888; text-align: center; margin-top: 25px;">
                        Nếu bạn không thực hiện đơn hàng này, vui lòng bỏ qua email này.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #22c55e; padding: 20px; text-align: center; color: white;">
                    <p style="font-size: 13px; margin: 0;">© 2025 Garage Hub. All rights reserved.</p>
                    <p style="font-size: 13px; margin: 5px 0 0;">Hotline: 1800-123-456 | Email: support@garagehub.com</p>
                </div>
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"Garage Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Xác nhận đơn hàng của bạn - Garage Hub",
        html: htmlContent,
    });
}

module.exports = {
    sendOrderConfirmationEmail,
};
