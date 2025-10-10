const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");

// ======================= Helper ==========================
const createToken = (user) => {
  return jwt.sign({ id: user._id, roles: user.roles }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
};

// ======================= Đăng ký ==========================
exports.register = async (req, res) => {
  try {
    const { fullName, dateOfBirth, phoneNumber, address, email, password } =
      req.body;

    if (!email || !password || !fullName)
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút

    const user = new User({
      fullName,
      dateOfBirth,
      phoneNumber,
      address,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires,
      isVerified: false,
    });

    await user.save();

    await sendEmail(email, "Xác thực tài khoản", `Mã OTP của bạn là: ${otp}`);

    res.status(201).json({
      message:
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
    });
  } catch (err) {
    console.error("Lỗi register:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ======================= Xác thực OTP ==========================
exports.verifyCode = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Thiếu email hoặc OTP." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User không tồn tại." });

    if (user.isVerified)
      return res.status(400).json({ message: "Tài khoản đã xác thực." });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (user.otp !== hashedOtp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Xác thực email thành công! Bạn có thể đăng nhập." });
  } catch (err) {
    console.error("Lỗi verifyCode:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ======================= Đăng nhập ==========================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại." });

    if (!user.isVerified)
      return res
        .status(403)
        .json({ message: "Vui lòng xác thực email trước khi đăng nhập." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu." });

    const token = createToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Đăng nhập thành công.",
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          roles: user.roles,
        },
      });
  } catch (err) {
    console.error("Lỗi loginUser:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ======================= Đăng xuất ==========================
exports.logout = async (req, res) => {
  res.clearCookie("token").json({ message: "Đã đăng xuất." });
};

// ======================= Kiểm tra đăng nhập ==========================
exports.authCheck = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token)
      return res
        .status(401)
        .json({ loggedIn: false, message: "Chưa đăng nhập." });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    res.json({ loggedIn: true, user: decoded });
  } catch (err) {
    res
      .status(401)
      .json({ loggedIn: false, message: "Token không hợp lệ hoặc hết hạn." });
  }
};

// ======================= Đổi mật khẩu ==========================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp." });

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng." });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Đổi mật khẩu thành công." });
  } catch (error) {
    console.error("Lỗi changePassword:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ===== 1️⃣ Gửi OTP qua email =====
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "Không tồn tại người dùng với email này." });

    const otp = generateOTP(); // Tạo mã OTP ngẫu nhiên (6 chữ số)
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // Hết hạn sau 10 phút
    await user.save();

    await sendEmail(
      email,
      "Đặt lại mật khẩu",
      `Mã OTP để đặt lại mật khẩu của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`
    );

    res.json({ message: "OTP đã được gửi tới email của bạn." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== 2️⃣ Xác minh OTP và tạo resetToken =====
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại." });

    if (user.otp !== otp || user.otpExpires < Date.now())
      return res
        .status(400)
        .json({ message: "OTP không hợp lệ hoặc đã hết hạn." });

    // Tạo reset token (JWT tạm thời)
    const resetToken = jwt.sign(
      { id: user._id, action: "reset-password" },
      process.env.SECRET_KEY,
      { expiresIn: "10m" } // chỉ có hiệu lực 10 phút
    );

    res.json({ message: "Xác minh OTP thành công.", resetToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== 3️⃣ Đặt lại mật khẩu mới =====
exports.resetPassword = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader)
      return res.status(401).json({ message: "Thiếu token xác thực." });

    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn." });
    }

    if (decoded.action !== "reset-password")
      return res
        .status(403)
        .json({ message: "Token không hợp lệ cho thao tác này." });

    const { newPassword } = req.body;
    if (!newPassword)
      return res.status(400).json({ message: "Vui lòng nhập mật khẩu mới." });

    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ message: "Người dùng không tồn tại." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
