const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// Helper: tạo token
const createToken = (user) => {
  return jwt.sign({ id: user._id, roles: user.roles }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
};

// Đăng ký
exports.register = async (req, res) => {
  console.log("Register route hit:", req.body);
  try {
    const { fullName, dateOfBirth, phoneNumber, address, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    const user = new User({
      fullName,
      dateOfBirth,
      phoneNumber,
      address,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    await user.save();
    await sendEmail(email, "Xác thực tài khoản", `Mã OTP của bạn là: ${otp}`);

    res
      .status(201)
      .json({ message: "Đăng ký thành công, kiểm tra email để xác thực" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Xác thực OTP
exports.verifyCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    if (user.isVerified)
      return res.status(400).json({ message: "Tài khoản đã xác thực" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Xác thực thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng nhập
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Vui lòng xác thực email trước" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = createToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Đăng nhập thành công",
        user: { id: user._id, roles: user.roles },
      });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng xuất
exports.logout = async (req, res) => {
  res.clearCookie("token").json({ message: "Đã đăng xuất" });
};

// Kiểm tra đăng nhập
exports.authCheck = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    res.status(401).json({ loggedIn: false, message: "Token không hợp lệ" });
  }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(email, "Đặt lại mật khẩu", `Mã OTP của bạn là: ${otp}`);

    res.json({ message: "OTP đã gửi qua email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
