const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Project = require('../models/Project');
const { authenticate, optionalAuth } = require('../middleware/auth');

// استخدام optionalAuth - يضيف المستخدم إذا كان موجوداً
router.use(optionalAuth);

router.get('/', async (req, res) => {
  try {
    const { client, contractor, status } = req.query;
    const query = {};
    
    // عزل البيانات: إذا كان المستخدم مسجل دخوله، يرى فقط بياناته
    if (req.user) {
      if (req.userRole === 'contractor') {
        // المقاول يرى فقط مشاريعه
        query.contractor = req.userId;
      } else if (req.userRole === 'client') {
        // العميل يرى فقط مشاريعه
        query.client = req.userId;
      }
    }
    
    // Filter by client (supports both ObjectId and String for backward compatibility)
    if (client && !req.user) {
      // فقط إذا لم يكن المستخدم مسجل دخوله (للإدارة)
      if (mongoose.Types.ObjectId.isValid(client)) {
        query.$or = [
          { client: new mongoose.Types.ObjectId(client) },
          { client: client.toString() }
        ];
      } else {
        query.$or = [
          { client: client },
          { client: { $regex: client, $options: 'i' } }
        ];
      }
    }
    
    // Filter by contractor (ObjectId) - فقط إذا لم يكن المستخدم مقاول
    if (contractor && req.userRole !== 'contractor') {
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
    // عزل البيانات: إضافة contractor تلقائياً إذا كان المستخدم مقاول
    if (req.user && req.userRole === 'contractor') {
      req.body.contractor = req.userId;
      req.body.createdBy = req.userId;
    }
    // عزل البيانات: إضافة client تلقائياً إذا كان المستخدم عميل
    if (req.user && req.userRole === 'client') {
      req.body.client = req.userId;
      req.body.createdBy = req.userId;
    }
    
    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create project', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن المستخدم يملك المشروع
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (req.user) {
      const isOwner = 
        (req.userRole === 'contractor' && project.contractor?.toString() === req.userId.toString()) ||
        (req.userRole === 'client' && project.client?.toString() === req.userId.toString());
      
      if (!isOwner) {
        return res.status(403).json({ error: 'You do not have permission to update this project' });
      }
    }
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('contractor', 'name companyName email')
      .populate('client', 'name email');
    
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update project', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن المستخدم يملك المشروع
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (req.user) {
      const isOwner = 
        (req.userRole === 'contractor' && project.contractor?.toString() === req.userId.toString()) ||
        (req.userRole === 'client' && project.client?.toString() === req.userId.toString());
      
      if (!isOwner) {
        return res.status(403).json({ error: 'You do not have permission to delete this project' });
      }
    }
    
    await Project.findByIdAndDelete(req.params.id);
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

