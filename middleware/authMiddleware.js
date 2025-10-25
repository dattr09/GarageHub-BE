const jwt = require("jsonwebtoken");

// ✅ Middleware: Kiểm tra token
const authenticateToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Chưa đăng nhập hoặc thiếu token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Lưu thông tin user vào req
    next();
  } catch (err) {
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
