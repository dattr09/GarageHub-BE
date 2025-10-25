const mongoose = require("mongoose");

const motoSchema = new mongoose.Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "Xe phải thuộc một thương hiệu"],
    },
    model: { type: String, required: true },
    color: { type: String },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Moto", motoSchema);
