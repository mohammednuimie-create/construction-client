const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Project = require('../models/Project');

router.get('/', async (req, res) => {
  try {
    const { client, contractor, status } = req.query;
    const query = {};
    
    // Filter by client (supports both ObjectId and String for backward compatibility)
    if (client) {
      if (mongoose.Types.ObjectId.isValid(client)) {
        // Search for both ObjectId and String to support old data
        query.$or = [
          { client: new mongoose.Types.ObjectId(client) }, // New format: ObjectId
          { client: client.toString() } // Old format: String
        ];
      } else {
        // If not a valid ObjectId, search as string
        query.$or = [
          { client: client },
          { client: { $regex: client, $options: 'i' } }
        ];
      }
    }
    
    // Filter by contractor (ObjectId)
    if (contractor) {
      query.contractor = contractor;
    }
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    const projects = await Project.find(query)
      .populate('contractor', 'name companyName email')
      .populate('client', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('contractor', 'name companyName email')
      .populate('client', 'name email');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create project', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('contractor', 'name companyName email')
      .populate('client', 'name email');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update project', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project', message: error.message });
  }
});

// Upload images route (simple - stores image URLs)
router.post('/:id/upload', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // For now, we'll accept image URLs or base64 data
    // In production, you'd use multer to save files to disk/cloud storage
    const { imageUrl } = req.body;
    
    if (imageUrl) {
      if (!project.images) {
        project.images = [];
      }
      project.images.push(imageUrl);
      await project.save();
      return res.json({ images: project.images });
    }

    // If no imageUrl provided, return current images
    res.json({ images: project.images || [] });
  } catch (error) {
    res.status(400).json({ error: 'Failed to upload image', message: error.message });
  }
});

module.exports = router;

