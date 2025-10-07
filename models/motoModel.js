const mongoose = require("mongoose");

const motoSchema = new mongoose.Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    collection: 'Motos'
  }
);

module.exports = mongoose.model("Moto", motoSchema);
