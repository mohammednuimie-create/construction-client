const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');

router.get('/', async (req, res) => {
  try {
    const { client, contractor, project, status } = req.query;
    const query = {};
    
    if (client) query.client = client;
    if (contractor) query.contractor = contractor;
    if (project) query.project = project;
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
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('client').populate('contractor').populate('project');
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update contract', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contract', message: error.message });
  }
});

module.exports = router;



