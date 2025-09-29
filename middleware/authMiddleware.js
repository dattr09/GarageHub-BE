const jwt = require("jsonwebtoken");

function auth(requiredRoles = []) {
  return (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;

      if (
        requiredRoles.length &&
        !requiredRoles.some((r) => decoded.roles.includes(r))
      ) {
        return res.status(403).json({ message: "Không có quyền truy cập" });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: "Token không hợp lệ" });
    }
  };
}

module.exports = auth;
