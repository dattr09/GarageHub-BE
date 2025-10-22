const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to, subject, otp, fullName) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border-radius: 10px; background-color: #f4f4f4; text-align: center; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);">
      <div style="background-color: #4CAF50; padding: 20px; border-radius: 10px 10px 0 0;">
        <h1 style="color: #fff; font-size: 28px; margin: 0;">Garage Hub</h1>
        <p style="color: #d9fdd3; font-size: 16px; margin: 5px 0 0;">Nơi đồng hành cùng bạn trên mọi hành trình</p>
      </div>
      <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 10px 10px;">
        <p style="font-size: 18px; color: #333; margin: 0;">Xin chào <strong style="color: #4CAF50;">${fullName}</strong>,</p>
        <p style="font-size: 16px; color: #555; margin: 15px 0;">
          Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi! Đây là mã OTP để xác thực tài khoản của bạn:
        </p>
        <div style="margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #4CAF50; padding: 15px 25px; border: 2px dashed #4CAF50; border-radius: 8px; display: inline-block;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #777; margin: 15px 0;">
          Mã OTP này sẽ hết hạn sau <strong>5 phút</strong>. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
        </p>
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
    subject,
    html: htmlContent,
  });
}

module.exports = sendEmail;
