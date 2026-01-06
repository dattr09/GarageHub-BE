const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const colors = {
    primary: '#2563eb',
    primaryDark: '#1d4ed8',
    primaryLight: '#dbeafe',
    accent: '#3b82f6',
    success: '#22c55e',
    warning: '#f59e0b',
    text: '#1f2937',
    textLight: '#6b7280',
    background: '#f8fafc',
    white: '#ffffff',
    border: '#e5e7eb',
};
function getEmailWrapper(content) {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Garage Hub</title>
        <!--[if mso]>
        <style type="text/css">
            table {border-collapse: collapse;}
            .fallback-font {font-family: Arial, sans-serif !important;}
        </style>
        <![endif]-->
    </head>
    <body style="margin: 0; padding: 0; background-color: ${colors.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.background};">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: ${colors.white}; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
                        ${content}
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`;
}
function getEmailHeader(title, subtitle) {
    return `
    <tr>
        <td style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); padding: 32px 24px; text-align: center;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                    <td align="center">
                        <div style="display: inline-block; background-color: rgba(255,255,255,0.15); border-radius: 12px; padding: 12px 16px; margin-bottom: 16px;">
                            <span style="font-size: 28px; font-weight: bold; color: ${colors.white}; letter-spacing: 0.5px;">🔧 Garage Hub</span>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding-top: 8px;">
                        <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: ${colors.white}; letter-spacing: 0.3px;">${title}</h1>
                        ${subtitle ? `<p style="margin: 8px 0 0; font-size: 14px; color: rgba(255,255,255,0.85);">${subtitle}</p>` : ''}
                    </td>
                </tr>
            </table>
        </td>
    </tr>`;
}
function getEmailFooter() {
    return `
    <tr>
        <td style="padding: 24px; background-color: ${colors.background}; border-top: 1px solid ${colors.border};">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                    <td align="center" style="padding-bottom: 16px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                            <tr>
                                <td style="padding: 0 8px;">
                                    <a href="#" style="display: inline-block; width: 36px; height: 36px; background-color: ${colors.primaryLight}; border-radius: 8px; text-align: center; line-height: 36px; text-decoration: none;">📘</a>
                                </td>
                                <td style="padding: 0 8px;">
                                    <a href="#" style="display: inline-block; width: 36px; height: 36px; background-color: ${colors.primaryLight}; border-radius: 8px; text-align: center; line-height: 36px; text-decoration: none;">📷</a>
                                </td>
                                <td style="padding: 0 8px;">
                                    <a href="#" style="display: inline-block; width: 36px; height: 36px; background-color: ${colors.primaryLight}; border-radius: 8px; text-align: center; line-height: 36px; text-decoration: none;">🌐</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="font-size: 13px; color: ${colors.textLight}; line-height: 1.6;">
                        <p style="margin: 0 0 4px;">📍 123 Đường ABC, Quận XYZ, TP.HCM</p>
                        <p style="margin: 0 0 4px;">📞 Hotline: <a href="tel:1800123456" style="color: ${colors.primary}; text-decoration: none;">1800-123-456</a></p>
                        <p style="margin: 0;">✉️ Email: <a href="mailto:support@garagehub.com" style="color: ${colors.primary}; text-decoration: none;">support@garagehub.com</a></p>
                    </td>
                </tr>
                <tr>
                    <td align="center" style="padding-top: 20px;">
                        <p style="margin: 0; font-size: 12px; color: ${colors.textLight};">© 2025 Garage Hub. All rights reserved.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>`;
}

function getButton(text, link, icon = '') {
    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 24px auto;">
        <tr>
            <td>
                <a href="${link}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); color: ${colors.white}; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); transition: all 0.3s;">
                    ${icon ? icon + ' ' : ''}${text}
                </a>
            </td>
        </tr>
    </table>`;
}

function getInfoBox(items) {
    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid ${colors.border};">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td style="font-size: 14px; color: ${colors.textLight};">${item.label}</td>
                        <td align="right" style="font-size: 14px; font-weight: 600; color: ${colors.text};">${item.value}</td>
                    </tr>
                </table>
            </td>
        </tr>`).join('');

    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.background}; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <tr>
            <td style="padding: 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    ${itemsHtml}
                </table>
            </td>
        </tr>
    </table>`;
}

async function sendOrderConfirmationEmail({ to, orderId, totalAmount, confirmationLink, items }) {
    const itemsHtml = items.map((item, index) => `
        <tr style="background-color: ${index % 2 === 0 ? colors.white : colors.background};">
            <td style="padding: 14px 12px; border-bottom: 1px solid ${colors.border};">
                <div style="font-size: 14px; font-weight: 500; color: ${colors.text}; margin-bottom: 2px;">${item.name}</div>
                <div style="font-size: 12px; color: ${colors.textLight};">Hãng: ${item.brand}</div>
            </td>
            <td align="center" style="padding: 14px 8px; border-bottom: 1px solid ${colors.border}; font-size: 14px; color: ${colors.text};">×${item.quantity}</td>
            <td align="right" style="padding: 14px 12px; border-bottom: 1px solid ${colors.border}; font-size: 14px; font-weight: 600; color: ${colors.primary};">${(item.price * item.quantity).toLocaleString()}đ</td>
        </tr>
    `).join('');

    const content = `
        ${getEmailHeader('Xác nhận đơn hàng', 'Cảm ơn bạn đã tin tưởng Garage Hub!')}
        
        <tr>
            <td style="padding: 32px 24px;">
                <p style="margin: 0 0 20px; font-size: 15px; color: ${colors.text}; line-height: 1.6;">
                    Xin chào,<br><br>
                    Chúng tôi đã nhận được đơn hàng của bạn và đang chờ xác nhận. Vui lòng kiểm tra thông tin bên dưới:
                </p>

                ${getInfoBox([
        { label: '🧾 Mã đơn hàng', value: orderId },
        { label: '💰 Tổng thanh toán', value: `<span style="color: ${colors.success}; font-size: 18px;">${totalAmount.toLocaleString()}đ</span>` }
    ])}

                <h3 style="margin: 28px 0 16px; font-size: 16px; font-weight: 600; color: ${colors.text};">📦 Chi tiết sản phẩm</h3>
                
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <thead>
                        <tr style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%);">
                            <th align="left" style="padding: 12px; font-size: 13px; font-weight: 600; color: ${colors.white}; text-transform: uppercase;">Sản phẩm</th>
                            <th align="center" style="padding: 12px; font-size: 13px; font-weight: 600; color: ${colors.white}; text-transform: uppercase;">SL</th>
                            <th align="right" style="padding: 12px; font-size: 13px; font-weight: 600; color: ${colors.white}; text-transform: uppercase;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                ${getButton('✅ XÁC NHẬN ĐƠN HÀNG', confirmationLink)}

                <p style="margin: 24px 0 0; font-size: 13px; color: ${colors.textLight}; text-align: center; line-height: 1.6;">
                    Nếu bạn không thực hiện đơn hàng này, vui lòng bỏ qua email này hoặc liên hệ với chúng tôi.
                </p>
            </td>
        </tr>

        ${getEmailFooter()}
    `;

    await transporter.sendMail({
        from: `"Garage Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject: `✅ Xác nhận đơn hàng #${orderId} - Garage Hub`,
        html: getEmailWrapper(content),
    });
}

module.exports = {
    sendOrderConfirmationEmail,
    colors,
    getEmailWrapper,
    getEmailHeader,
    getEmailFooter,
    getButton,
    getInfoBox,
};
