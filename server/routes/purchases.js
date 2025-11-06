const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Purchase = require('../models/Purchase');
const Project = require('../models/Project');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/', async (req, res) => {
  try {
    const { supplier, project, status } = req.query;
    const query = {};
    
    // عزل البيانات: إلزامي - يجب أن يكون المستخدم مسجل دخوله
    if (!req.user || !req.userId || req.userRole !== 'contractor') {
      return res.json([]); // إرجاع قائمة فارغة إذا لم يكن مقاول مسجل دخوله
    }
    
    // المقاول يرى فقط المشتريات لمشاريعه
    // تحويل userId إلى ObjectId للتأكد من المطابقة
    const contractorId = mongoose.Types.ObjectId.isValid(req.userId) 
      ? new mongoose.Types.ObjectId(req.userId) 
      : req.userId;
    
    const userProjects = await Project.find({ contractor: contractorId }).select('_id');
    const projectIds = userProjects.map(p => p._id);
    if (projectIds.length === 0) {
      return res.json([]); // لا توجد مشاريع = لا توجد مشتريات
    }
    query.project = { $in: projectIds };
    
    if (supplier) query.supplier = supplier;
    if (status) query.status = status;
    
    const purchases = await Purchase.find(query)
      .populate('supplier', 'name companyName')
      .populate('project', 'name')
      .sort({ purchaseDate: -1 });
    
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchases', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier')
      .populate('project');
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن المشروع يخص المقاول
    if (req.user && req.userRole === 'contractor' && req.body.project) {
      const project = await Project.findById(req.body.project);
      if (!project || project.contractor?.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have permission to create purchase for this project' });
      }
    }
    
    const purchase = new Purchase(req.body);
    await purchase.save();
    
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('supplier')
      .populate('project');
    
    res.status(201).json(populatedPurchase);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create purchase', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن المشتري يخص المقاول
    const purchase = await Purchase.findById(req.params.id).populate('project');
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    if (req.user && req.userRole === 'contractor') {
      const project = await Project.findById(purchase.project?._id || purchase.project);
      if (!project || project.contractor?.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have permission to update this purchase' });
      }
    }
    
    const updatedPurchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier').populate('project');
    
    res.json(updatedPurchase);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update purchase', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن المشتري يخص المقاول
    const purchase = await Purchase.findById(req.params.id).populate('project');
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    
    if (req.user && req.userRole === 'contractor') {
      const project = await Project.findById(purchase.project?._id || purchase.project);
      if (!project || project.contractor?.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have permission to delete this purchase' });
      }
    }
    
    await Purchase.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete purchase', message: error.message });
  }
});

module.exports = router;



