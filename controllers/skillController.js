// controllers/skillController.js
const skillModel = require('../models/skillModel');

const skillController = {
  create: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Skill name is required' });
      }
      const skill = await skillModel.createSkill(name.trim());
      res.status(201).json({ success: true, skill });
    } catch (error) {
      console.error('Error creating skill:', error);
      res.status(500).json({ success: false, message: 'Failed to create skill' });
    }
  },

  getAll: async (_req, res) => {
    try {
      const skills = await skillModel.getAllSkills();
      res.json({ success: true, skills });
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch skills' });
    }
  },

  getByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const skills = await skillModel.getWorkerSkills(userId);
      res.json({ success: true, skills });
    } catch (error) {
      console.error('Error fetching user skills:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user skills' });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Skill name is required' });
      }
      const skill = await skillModel.updateSkill(id, name.trim());
      if (!skill) {
        return res.status(404).json({ success: false, message: 'Skill not found' });
      }
      res.json({ success: true, skill });
    } catch (error) {
      console.error('Error updating skill:', error);
      res.status(500).json({ success: false, message: 'Failed to update skill' });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await skillModel.deleteSkill(id);
      if (!result) {
        return res.status(404).json({ success: false, message: 'Skill not found' });
      }
      res.json({ success: true, message: 'Skill deleted successfully' });
    } catch (error) {
      console.error('Error deleting skill:', error);
      res.status(500).json({ success: false, message: 'Failed to delete skill' });
    }
  }
};

module.exports = skillController;