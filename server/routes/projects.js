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
    
    console.log(`📥 [Projects GET] User: ${req.user ? `${req.user.name} (${req.userRole})` : 'NOT AUTHENTICATED'}, ID: ${req.userId || 'N/A'}`);
    
    // عزل البيانات: إلزامي - يجب أن يكون المستخدم مسجل دخوله
    if (!req.user || !req.userId) {
      console.log(`🔒 [Projects GET] No authentication - returning empty array`);
      return res.json([]); // إرجاع قائمة فارغة إذا لم يكن مسجل دخوله
    }
    
    // عزل البيانات: المستخدم يرى فقط بياناته
    if (req.userRole === 'contractor') {
      // المقاول يرى فقط مشاريعه
      // البحث عن String و ObjectId معاً للتأكد من المطابقة
      const userIdStr = req.userId.toString();
      if (mongoose.Types.ObjectId.isValid(req.userId)) {
        const userIdObj = new mongoose.Types.ObjectId(req.userId);
        query.$or = [
          { contractor: userIdStr },
          { contractor: userIdObj }
        ];
        console.log(`🔒 [Projects GET] Filtering by contractor: ${userIdStr} (as String and ObjectId)`);
      } else {
        query.contractor = userIdStr;
        console.log(`🔒 [Projects GET] Filtering by contractor: ${userIdStr} (as String only)`);
      }
    } else if (req.userRole === 'client') {
      // العميل يرى فقط مشاريعه
      // البحث عن String و ObjectId معاً للتأكد من المطابقة
      const userIdStr = req.userId.toString();
      if (mongoose.Types.ObjectId.isValid(req.userId)) {
        const userIdObj = new mongoose.Types.ObjectId(req.userId);
        query.$or = [
          { client: userIdStr },
          { client: userIdObj }
        ];
        console.log(`🔒 [Projects GET] Filtering by client: ${userIdStr} (as String and ObjectId)`);
      } else {
        query.client = userIdStr;
        console.log(`🔒 [Projects GET] Filtering by client: ${userIdStr} (as String only)`);
      }
    } else {
      // إذا كان الدور غير معروف، لا نرجع أي بيانات
      console.log(`⚠️ [Projects GET] Unknown role: ${req.userRole} - returning empty array`);
      return res.json([]);
    }
    
    // لا نسمح بالتصفية اليدوية إذا كان المستخدم مسجل دخوله - البيانات معزولة تلقائياً
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    console.log(`🔍 [Projects GET] Query:`, JSON.stringify(query, null, 2));
    
    const projects = await Project.find(query)
      .populate('contractor', 'name companyName email')
      .populate('client', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`✅ [Projects GET] Found ${projects.length} projects for user ${req.user ? req.user.name : 'anonymous'}`);
    
    // Log project details for debugging
    if (projects.length > 0) {
      console.log(`📋 [Projects GET] Projects found:`);
      projects.forEach((p, idx) => {
        console.log(`  ${idx + 1}. "${p.name}" - Contractor: ${p.contractor?._id || p.contractor || 'NONE'} (${p.contractor?.name || 'N/A'}), Client: ${p.client?._id || p.client || 'NONE'}`);
      });
    }
    
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

