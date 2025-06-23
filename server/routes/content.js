const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const auth = require('../middleware/auth');

// Get content
router.get('/', async (req, res) => {
  try {
    let content = await Content.findOne();
    if (!content) {
      // Create default content if none exists
      content = await Content.create({});
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update content
router.put('/', auth, async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      {}, 
      req.body, 
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
    res.json(content);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;