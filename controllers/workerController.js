const workerModel = require('../models/workerModel');

const workerController = {
  create: async (req, res) => {
    try {
      const worker = await workerModel.createWorker({ ...req.body, userId: req.user.id });
      res.json({ success: true, worker });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const workers = await workerModel.getWorkers();
      res.json({ success: true, workers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  getById: async (req, res) => {
    try {
      const worker = await workerModel.getWorkerById(req.params.id);
      res.json({ success: true, worker });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  update: async (req, res) => {
    try {
      const worker = await workerModel.updateWorkerById(req.params.id, req.body);
      res.json({ success: true, worker });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await workerModel.deleteWorkerById(req.params.id);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = workerController;
