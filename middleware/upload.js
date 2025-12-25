// middleware/upload.js
const multer = require("multer");

// memoryStorage: Không lưu file vào disk, lưu vào memory để upload lên Cloudinary
const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|jfif)$/)) {
    return cb(new Error("Only image files allowed!"), false);
  }
  cb(null, true);
};

// ---- UPLOAD RULES -----
const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFilter,
}).single("image");

const uploadImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: imageFilter,
}).array("images", 10);

// ---- WRAPPER -----
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
    next();
  });
};

module.exports = {
  uploadImageMiddleware: handleUpload(uploadImage),
  uploadImagesMiddleware: handleUpload(uploadImages),
};

