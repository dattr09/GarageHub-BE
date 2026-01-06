const nodemailer = require("nodemailer");
const { colors, getEmailWrapper, getEmailHeader, getEmailFooter, getButton, getInfoBox } = require("./confirmmail");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail(to, subject, otp, fullName) {
    const otpDigits = otp.toString().split('');
    const otpBoxesHtml = otpDigits.map(digit => `
        <td align="center" style="padding: 0 4px;">
            <div style="width: 48px; height: 56px; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%); border-radius: 10px; font-size: 24px; font-weight: bold; color: ${colors.white}; line-height: 56px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);">
                ${digit}
            </div>
        </td>
    `).join('');

    const content = `
        ${getEmailHeader('Mã xác thực OTP', 'Mã sẽ hết hạn sau 5 phút')}
        
        <tr>
            <td style="padding: 32px 24px;">
                <p style="margin: 0 0 8px; font-size: 16px; color: ${colors.text};">
                    Xin chào <strong style="color: ${colors.primary};">${fullName}</strong>,
                </p>
                <p style="margin: 0 0 28px; font-size: 15px; color: ${colors.textLight}; line-height: 1.6;">
                    Cảm ơn bạn đã sử dụng dịch vụ của Garage Hub! Đây là mã OTP để xác thực tài khoản của bạn:
                </p>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto 28px;">
                    <tr>
                        ${otpBoxesHtml}
                    </tr>
                </table>

                <div style="background-color: ${colors.background}; border-radius: 12px; padding: 20px; margin-bottom: 24px; border-left: 4px solid ${colors.primary};">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td style="vertical-align: top; padding-right: 12px;">
                                <span style="font-size: 20px;">⏰</span>
                            </td>
                            <td>
                                <p style="margin: 0; font-size: 14px; color: ${colors.text}; font-weight: 500;">Thời gian hiệu lực</p>
                                <p style="margin: 4px 0 0; font-size: 13px; color: ${colors.textLight};">Mã OTP này sẽ hết hạn sau <strong style="color: ${colors.primary};">5 phút</strong>. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div style="background-color: #fef3c7; border-radius: 12px; padding: 16px; text-align: center;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;">
                        ⚠️ <strong>Lưu ý bảo mật:</strong> Không chia sẻ mã OTP này với bất kỳ ai, kể cả nhân viên Garage Hub.
                    </p>
                </div>
            </td>
        </tr>

        ${getEmailFooter()}
    `;

    await transporter.sendMail({
        from: `"Garage Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🔐 ${subject}`,
        html: getEmailWrapper(content),
    });
}

async function sendPasswordResetEmail(to, resetLink, fullName) {
    const content = `
        ${getEmailHeader('Đặt lại mật khẩu', 'Yêu cầu khôi phục tài khoản')}
        
        <tr>
            <td style="padding: 32px 24px;">
                <p style="margin: 0 0 8px; font-size: 16px; color: ${colors.text};">
                    Xin chào <strong style="color: ${colors.primary};">${fullName}</strong>,
                </p>
                <p style="margin: 0 0 24px; font-size: 15px; color: ${colors.textLight}; line-height: 1.6;">
                    Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhấn vào nút bên dưới để tạo mật khẩu mới:
                </p>

                ${getButton('🔑 ĐẶT LẠI MẬT KHẨU', resetLink)}

                <div style="background-color: ${colors.background}; border-radius: 12px; padding: 20px; margin-top: 24px;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: ${colors.text};">📝 Lưu ý:</p>
                    <ul style="margin: 0; padding: 0 0 0 20px; font-size: 13px; color: ${colors.textLight}; line-height: 1.8;">
                        <li>Link đặt lại mật khẩu có hiệu lực trong 15 phút</li>
                        <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
                        <li>Tài khoản của bạn vẫn an toàn nếu bạn không thực hiện thao tác này</li>
                    </ul>
                </div>
            </td>
        </tr>

        ${getEmailFooter()}
    `;

    await transporter.sendMail({
        from: `"Garage Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🔑 Đặt lại mật khẩu - Garage Hub`,
        html: getEmailWrapper(content),
    });
}

async function sendWelcomeEmail(to, fullName) {
    const content = `
        ${getEmailHeader('Chào mừng đến với Garage Hub!', 'Nơi đồng hành cùng bạn trên mọi hành trình')}
        
        <tr>
            <td style="padding: 32px 24px;">
                <p style="margin: 0 0 8px; font-size: 16px; color: ${colors.text};">
                    Xin chào <strong style="color: ${colors.primary};">${fullName}</strong>,
                </p>
                <p style="margin: 0 0 24px; font-size: 15px; color: ${colors.textLight}; line-height: 1.6;">
                    Chúc mừng bạn đã đăng ký tài khoản thành công tại <strong>Garage Hub</strong>! Chúng tôi rất vui được đồng hành cùng bạn.
                </p>

                <div style="background: linear-gradient(135deg, ${colors.primaryLight} 0%, #e0f2fe 100%); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: ${colors.text};">🎁 Những gì bạn có thể làm:</h3>
                    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                            <td style="padding: 10px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td style="width: 40px; vertical-align: top;">
                                            <div style="width: 32px; height: 32px; background-color: ${colors.white}; border-radius: 8px; text-align: center; line-height: 32px;">🛒</div>
                                        </td>
                                        <td style="padding-left: 12px;">
                                            <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${colors.text};">Mua sắm phụ tùng</p>
                                            <p style="margin: 4px 0 0; font-size: 12px; color: ${colors.textLight};">Hàng ngàn phụ tùng chính hãng đang chờ bạn</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td style="width: 40px; vertical-align: top;">
                                            <div style="width: 32px; height: 32px; background-color: ${colors.white}; border-radius: 8px; text-align: center; line-height: 32px;">📅</div>
                                        </td>
                                        <td style="padding-left: 12px;">
                                            <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${colors.text};">Đặt lịch bảo dưỡng</p>
                                            <p style="margin: 4px 0 0; font-size: 12px; color: ${colors.textLight};">Dễ dàng đặt lịch online, tiết kiệm thời gian</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                        <td style="width: 40px; vertical-align: top;">
                                            <div style="width: 32px; height: 32px; background-color: ${colors.white}; border-radius: 8px; text-align: center; line-height: 32px;">🤖</div>
                                        </td>
                                        <td style="padding-left: 12px;">
                                            <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${colors.text};">Tư vấn với AI</p>
                                            <p style="margin: 4px 0 0; font-size: 12px; color: ${colors.textLight};">Trợ lý AI thông minh sẵn sàng giải đáp 24/7</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>

                ${getButton('🚀 BẮT ĐẦU KHÁM PHÁ', 'https://garagehub.com')}
            </td>
        </tr>

        ${getEmailFooter()}
    `;

    await transporter.sendMail({
        from: `"Garage Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject: `🎉 Chào mừng ${fullName} đến với Garage Hub!`,
        html: getEmailWrapper(content),
    });
}

async function sendAppointmentConfirmationEmail({ to, fullName, appointmentId, date, time, services, notes }) {
    const servicesHtml = services.map(service => `
        <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid ${colors.border};">
                <span style="display: inline-block; background-color: ${colors.primaryLight}; color: ${colors.primary}; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 500;">
                    ${service}
                </span>
            </td>
        </tr>
    `).join('');

    const content = `
        ${getEmailHeader('Xác nhận lịch hẹn', 'Lịch hẹn của bạn đã được đặt thành công!')}
        
        <tr>
            <td style="padding: 32px 24px;">
                <p style="margin: 0 0 8px; font-size: 16px; color: ${colors.text};">
                    Xin chào <strong style="color: ${colors.primary};">${fullName}</strong>,
                </p>
                <p style="margin: 0 0 24px; font-size: 15px; color: ${colors.textLight}; line-height: 1.6;">
                    Lịch hẹn của bạn đã được đặt thành công. Dưới đây là thông tin chi tiết:
                </p>

                ${getInfoBox([
        { label: '🎫 Mã lịch hẹn', value: appointmentId },
        { label: '📅 Ngày hẹn', value: date },
        { label: '⏰ Giờ hẹn', value: time }
    ])}

                <h3 style="margin: 24px 0 12px; font-size: 15px; font-weight: 600; color: ${colors.text};">🔧 Dịch vụ đã chọn:</h3>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${colors.background}; border-radius: 12px; padding: 16px;">
                    <tr><td style="padding: 16px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            ${servicesHtml}
                        </table>
                    </td></tr>
                </table>

                ${notes ? `
                <div style="margin-top: 20px; padding: 16px; background-color: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 13px; color: #92400e;"><strong>📝 Ghi chú:</strong> ${notes}</p>
                </div>
                ` : ''}

                <div style="margin-top: 24px; padding: 20px; background-color: ${colors.primaryLight}; border-radius: 12px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: ${colors.primary};">
                        💡 <strong>Nhớ đến đúng giờ nhé!</strong> Nếu cần thay đổi lịch hẹn, vui lòng liên hệ hotline: <a href="tel:1800123456" style="color: ${colors.primaryDark}; text-decoration: none; font-weight: 600;">1800-123-456</a>
                    </p>
                </div>
            </td>
        </tr>

        ${getEmailFooter()}
    `;

    await transporter.sendMail({
        from: `"Garage Hub" <${process.env.EMAIL_USER}>`,
        to,
        subject: `📅 Xác nhận lịch hẹn #${appointmentId} - Garage Hub`,
        html: getEmailWrapper(content),
    });
}

module.exports = sendEmail;
module.exports.sendEmail = sendEmail;
module.exports.sendPasswordResetEmail = sendPasswordResetEmail;
module.exports.sendWelcomeEmail = sendWelcomeEmail;
module.exports.sendAppointmentConfirmationEmail = sendAppointmentConfirmationEmail;