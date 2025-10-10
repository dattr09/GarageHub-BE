const jwt = require("jsonwebtoken");

// Middleware xác thực
exports.authMiddleware = (req, res, next) => {
  const token =
    req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

  if (!token)
    return res
      .status(401)
      .json({ message: "Không có token hoặc chưa đăng nhập." });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn." });
  }
};

// Middleware phân quyền
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.roles)) {
      return res.status(403).json({ message: "Không có quyền truy cập." });
    }
    next();
  };
};
