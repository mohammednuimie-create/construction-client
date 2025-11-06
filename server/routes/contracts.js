const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/', async (req, res) => {
  try {
    const { client, contractor, project, status } = req.query;
    const query = {};
    
    // عزل البيانات: إذا كان المستخدم مسجل دخوله، يرى فقط عقوده
    if (req.user) {
      if (req.userRole === 'contractor') {
        // المقاول يرى فقط عقوده
        query.contractor = req.userId;
      } else if (req.userRole === 'client') {
        // العميل يرى فقط عقوده
        query.client = req.userId;
      }
    }
    
    if (client && !req.user) query.client = client;
    if (contractor && req.userRole !== 'contractor') query.contractor = contractor;
    if (project && !req.user) query.project = project;
    if (status) query.status = status;
    
    const contracts = await Contract.find(query)
      .populate('client', 'name email')
      .populate('contractor', 'name companyName email')
      .populate('project', 'name')
      .sort({ startDate: -1 });
    
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contracts', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('client')
      .populate('contractor')
      .populate('project');
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contract', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    // عزل البيانات: إضافة contractor أو client تلقائياً
    if (req.user && req.userRole === 'contractor') {
      req.body.contractor = req.userId;
    } else if (req.user && req.userRole === 'client') {
      req.body.client = req.userId;
    }
    
    const contract = new Contract(req.body);
    await contract.save();
    
    const populatedContract = await Contract.findById(contract._id)
      .populate('client')
      .populate('contractor')
      .populate('project');
    
    res.status(201).json(populatedContract);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create contract', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن العقد يخص المستخدم
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    if (req.user) {
      const isOwner = 
        (req.userRole === 'contractor' && contract.contractor?.toString() === req.userId.toString()) ||
        (req.userRole === 'client' && contract.client?.toString() === req.userId.toString());
      
      if (!isOwner) {
        return res.status(403).json({ error: 'You do not have permission to update this contract' });
      }
    }
    
    const updatedContract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client').populate('contractor').populate('project');
    
    res.json(updatedContract);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update contract', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // عزل البيانات: التحقق من أن العقد يخص المستخدم
    const contract = await Contract.findById(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    if (req.user) {
      const isOwner = 
        (req.userRole === 'contractor' && contract.contractor?.toString() === req.userId.toString()) ||
        (req.userRole === 'client' && contract.client?.toString() === req.userId.toString());
      
      if (!isOwner) {
        return res.status(403).json({ error: 'You do not have permission to delete this contract' });
      }
    }
    
    await Contract.findByIdAndDelete(req.params.id);
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contract', message: error.message });
  }
});

module.exports = router;



