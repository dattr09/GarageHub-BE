const Moto = require('../models/motoModel');

class MotosController {
  // [GET] /api/motos
  async getAll(req, res) {
    try {
      const motos = await Moto.find();
      res.json(motos);
    } catch (error) {
      console.error('Error fetching motos:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [GET] /api/motos/:licensePlate
  async getByLicensePlate(req, res) {
    const { licensePlate } = req.params;
    try {
      const moto = await Moto.findOne({ licensePlate });
      if (!moto) return res.status(404).json({ message: 'Moto not found' });
      res.json(moto);
    } catch (error) {
      console.error('Error fetching moto by licensePlate:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [GET] /api/motos/user/:userId
  async getByUserId(req, res) {
    const { userId } = req.params;
    try {
      const motos = await Moto.find({ userId });
      res.json(motos);
    } catch (error) {
      console.error('Error fetching motos by userId:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // [POST] /api/motos
  async create(req, res) {
    try {
      const moto = new Moto(req.body);
      const newMoto = await moto.save();
      res.status(201).json(newMoto);
    } catch (error) {
      console.error('Error creating moto:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // [PUT] /api/motos/:licensePlate
  async update(req, res) {
    const { licensePlate } = req.params;
    try {
      const updatedMoto = await Moto.findOneAndUpdate({ licensePlate }, req.body, { new: true });
      if (!updatedMoto) return res.status(404).json({ message: 'Moto not found' });
      res.json(updatedMoto);
    } catch (error) {
      console.error('Error updating moto:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // [DELETE] /api/motos/:licensePlate
  async delete(req, res) {
    const { licensePlate } = req.params;
    try {
      const deletedMoto = await Moto.findOneAndDelete({ licensePlate });
      if (!deletedMoto) return res.status(404).json({ message: 'Moto not found' });
      res.json({ message: 'Moto deleted successfully' });
    } catch (error) {
      console.error('Error deleting moto:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new MotosController();
