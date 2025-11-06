const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const Project = require('../models/Project');
const Purchase = require('../models/Purchase');
const Payment = require('../models/Payment');
const Material = require('../models/Material');
const Issue = require('../models/Issue');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/', async (req, res) => {
  try {
    const { reportType, project, generatedBy } = req.query;
    const query = {};
    
    // عزل البيانات: إذا كان المستخدم مسجل دخوله، يرى فقط تقاريره
    if (req.user) {
      query.generatedBy = req.userId;
    }
    
    if (reportType) query.reportType = reportType;
    if (project && !req.user) query.project = project;
    if (generatedBy && !req.user) query.generatedBy = generatedBy;
    
    const reports = await Report.find(query)
      .populate('project', 'name')
      .populate('generatedBy', 'name email')
      .sort({ generatedAt: -1 });
    
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('project')
      .populate('generatedBy');
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch report', message: error.message });
  }
});

router.post('/generate/financial', async (req, res) => {
  try {
    const { startDate, endDate, project } = req.body;
    
    // عزل البيانات: التحقق من أن المشروع يخص المقاول
    if (req.user && req.userRole === 'contractor' && project) {
      const projectDoc = await Project.findById(project);
      if (!projectDoc || projectDoc.contractor?.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have permission to generate report for this project' });
      }
    }
    
    let query = {};
    if (project) query.project = project;
    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) query.purchaseDate.$lte = new Date(endDate);
    }
    
    // عزل البيانات: تصفية المشتريات حسب المستخدم
    if (req.user && req.userRole === 'contractor') {
      const userProjects = await Project.find({ contractor: req.userId }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      query.project = { $in: projectIds };
    }
    
    const purchases = await Purchase.find(query);
    const payments = await Payment.find({
      paymentDate: query.purchaseDate || {}
    });
    
    const totalPurchases = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalRemaining = totalPurchases - totalPayments;
    
    const report = new Report({
      reportType: 'financial',
      title: 'Financial Report',
      project,
      period: { startDate, endDate },
      data: {
        totalPurchases,
        totalPayments,
        totalRemaining,
        purchasesCount: purchases.length,
        paymentsCount: payments.length
      },
      generatedBy: req.userId || req.body.generatedBy
    });
    
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to generate financial report', message: error.message });
  }
});

router.post('/generate/inventory', async (req, res) => {
  try {
    // عزل البيانات: المقاول فقط يمكنه إنشاء تقرير المخزون
    if (!req.user || req.userRole !== 'contractor') {
      return res.status(403).json({ error: 'Only contractors can generate inventory reports' });
    }
    
    const materials = await Material.find();
    
    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter(m => m.quantity <= m.minStock);
    const outOfStockMaterials = materials.filter(m => m.quantity === 0);
    const totalValue = materials.reduce((sum, m) => sum + (m.quantity * m.pricePerUnit), 0);
    
    const report = new Report({
      reportType: 'inventory',
      title: 'Inventory Report',
      data: {
        totalMaterials,
        lowStockMaterials: lowStockMaterials.length,
        outOfStockMaterials: outOfStockMaterials.length,
        totalValue,
        materials: materials.map(m => ({
          name: m.name,
          quantity: m.quantity,
          minStock: m.minStock,
          status: m.status,
          value: m.quantity * m.pricePerUnit
        }))
      },
      generatedBy: req.userId
    });
    
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to generate inventory report', message: error.message });
  }
});

router.post('/generate/project', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // عزل البيانات: التحقق من أن المشروع يخص المستخدم
    if (req.user) {
      const isOwner = 
        (req.userRole === 'contractor' && project.contractor?.toString() === req.userId.toString()) ||
        (req.userRole === 'client' && project.client?.toString() === req.userId.toString());
      
      if (!isOwner) {
        return res.status(403).json({ error: 'You do not have permission to generate report for this project' });
      }
    }
    
    const issues = await Issue.find({ project: projectId });
    const totalIssued = issues.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    
    const report = new Report({
      reportType: 'project',
      title: `Project Report: ${project.name}`,
      project: projectId,
      data: {
        projectName: project.name,
        budget: project.budget,
        totalCost: project.totalCost,
        progress: project.progress,
        status: project.status,
        issuesCount: issues.length,
        totalIssued
      },
      generatedBy: req.userId || req.body.generatedBy
    });
    
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: 'Failed to generate project report', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // عزل البيانات: إضافة generatedBy تلقائياً
    if (req.user) {
      req.body.generatedBy = req.userId;
    }
    
    const report = new Report(req.body);
    await report.save();
    
    const populatedReport = await Report.findById(report._id)
      .populate('project')
      .populate('generatedBy');
    
    res.status(201).json(populatedReport);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create report', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن التقرير يخص المستخدم
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (req.user && report.generatedBy?.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'You do not have permission to delete this report' });
    }
    
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete report', message: error.message });
  }
});

module.exports = router;









