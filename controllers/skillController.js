// controllers/skillController.js
const skillModel = require('../models/skillModel');

const skillController = {
  create: async (req, res) => {
    try {
      const skill = await skillModel.createSkill(req.body.name);
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const skills = await skillModel.getAllSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getByUser: async (req, res) => {
    try {
      const skills = await skillModel.getWorkerSkills(req.params.userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  update: async (req, res) => {
    try {
      const skill = await skillModel.updateSkill(req.params.id, req.body.name);
      if (!skill) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const result = await skillModel.deleteSkill(req.params.id);
      if (!result?.success) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createSkill: async (req, res) => {
    try {
      const skill = await skillModel.createSkill(req.body.name);
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllSkills: async (req, res) => {
    try {
      const skills = await skillModel.getAllSkills();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSkillById: async (req, res) => {
    try {
      const skill = await skillModel.getSkillById(req.params.id);
      if (!skill) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSkill: async (req, res) => {
    try {
      const skill = await skillModel.updateSkill(req.params.id, req.body.name);
      if (!skill) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      res.json(skill);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteSkill: async (req, res) => {
    try {
      const result = await skillModel.deleteSkill(req.params.id);
      if (!result?.success) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // Worker or admin adds a skill
  create: async (req, res) => {
    try {
      const skill = await skillModel.createSkill({ ...req.body, userId: req.user.id });
      res.json({ success: true, skill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get all skills (everyone logged in can see)
  getAll: async (req, res) => {
    try {
      const skills = await skillModel.getSkills();
      res.json({ success: true, skills });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get skills for a specific user (worker profile)
  getByUser: async (req, res) => {
    try {
      const skills = await skillModel.getSkillsByUserId(req.params.userId);
      res.json({ success: true, skills });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Update a skill
  update: async (req, res) => {
    try {
      const skill = await skillModel.updateSkillById(req.params.id, req.body);
      res.json({ success: true, skill });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Delete a skill
  delete: async (req, res) => {
    try {
      const result = await skillModel.deleteSkillById(req.params.id);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

module.exports = skillController;
