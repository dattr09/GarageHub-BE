const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// ✅ Middleware: Kiểm tra token
const authenticateToken = async (req, res, next) => {
  // Check cookie first, then Authorization header
  let token = req.cookies["jwt-token"];

  // If no cookie, check Authorization header (for mobile apps)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Chưa đăng nhập hoặc thiếu token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Lấy thông tin user mới nhất từ DB (bao gồm roles mới)
    const user = await User.findById(decoded.userId).select("fullName email roles");

    if (!user) {
      return res.status(401).json({ message: "User không tồn tại." });
    }

    // Gán user info mới nhất vào req.user
    req.user = {
      userId: user._id,
      name: user.fullName,
      email: user.email,
      roles: user.roles, // Roles mới nhất từ DB
    };

    next();
  } catch (err) {
    console.error("Lỗi xác thực token:", err.message);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

// ✅ Middleware: Phân quyền
const authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !req.user.roles?.some((role) => allowedRoles.includes(role))
    ) {
      console.error("Unauthorized access attempt:", req.user);
      return res.status(403).json({ message: "Không có quyền truy cập." });
    }
    next();
  };
};

// ✅ Export cả hai middleware
module.exports = { authenticateToken, authorizeRoles };
