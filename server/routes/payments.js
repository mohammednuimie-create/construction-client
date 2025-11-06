const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Purchase = require('../models/Purchase');
const Project = require('../models/Project');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/', async (req, res) => {
  try {
    const { supplier, project, status, paymentMethod } = req.query;
    const query = {};
    
    // عزل البيانات: إذا كان المستخدم مسجل دخوله، يرى فقط مدفوعاته
    if (req.user && req.userRole === 'contractor') {
      // المقاول يرى فقط المدفوعات التي أنشأها أو لمشترياته
      const userProjects = await Project.find({ contractor: req.userId }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      const purchases = await Purchase.find({ project: { $in: projectIds } }).select('_id');
      const purchaseIds = purchases.map(p => p._id);
      query.$or = [
        { createdBy: req.userId },
        { purchase: { $in: purchaseIds } }
      ];
    }
    
    if (supplier) query.supplier = supplier;
    if (project && !req.user) query.project = project;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    const payments = await Payment.find(query)
      .populate('supplier', 'name companyName')
      .populate('project', 'name')
      .populate('purchase')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('supplier')
      .populate('project');
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // عزل البيانات: إضافة createdBy تلقائياً وإضافة التحقق من المشروع
    if (req.user && req.userRole === 'contractor') {
      req.body.createdBy = req.userId;
      
      // التحقق من أن المشتري يخص المقاول
      if (req.body.purchase) {
        const purchase = await Purchase.findById(req.body.purchase).populate('project');
        if (purchase && purchase.project) {
          const project = await Project.findById(purchase.project._id || purchase.project);
          if (!project || project.contractor?.toString() !== req.userId.toString()) {
            return res.status(403).json({ error: 'You do not have permission to create payment for this purchase' });
          }
        }
      }
    }
    
    const payment = new Payment(req.body);
    await payment.save();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('supplier')
      .populate('project')
      .populate('purchase');
    
    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create payment', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن المدفوعة تخص المقاول
    const payment = await Payment.findById(req.params.id).populate('purchase');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (req.user && req.userRole === 'contractor') {
      if (payment.createdBy?.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have permission to update this payment' });
      }
    }
    
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier').populate('project').populate('purchase');
    
    res.json(updatedPayment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update payment', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن المدفوعة تخص المقاول
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    if (req.user && req.userRole === 'contractor') {
      if (payment.createdBy?.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'You do not have permission to delete this payment' });
      }
    }
    
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment', message: error.message });
  }
});

module.exports = router;

