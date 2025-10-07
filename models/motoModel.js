// src/models/Moto.js
const mongoose = require("mongoose");

const motoSchema = new mongoose.Schema(
  {
    licensePlate: { type: String, required: true, unique: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
  },
  {
    timestamps: true,
    collection: 'Motos'
  }
);

module.exports = mongoose.model("Moto", motoSchema);
