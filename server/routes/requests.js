const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

router.get('/', async (req, res) => {
  try {
    const { client, contractor, status, priority } = req.query;
    const query = {};
    
    if (client) query.client = client;
    if (contractor) query.contractor = contractor;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const requests = await Request.find(query)
      .populate('project', 'name client')
      .populate('client', 'name email')
      .populate('contractor', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch requests', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('project')
      .populate('client')
      .populate('contractor');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch request', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const request = new Request(req.body);
    await request.save();
    
    const populatedRequest = await Request.findById(request._id)
      .populate('project')
      .populate('client')
      .populate('contractor');
    
    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create request', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { ...req.body };
    
    if (status && ['approved', 'rejected'].includes(status)) {
      updateData.responseDate = new Date();
    }
    
    const request = await Request.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('project').populate('client').populate('contractor');
    
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update request', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete request', message: error.message });
  }
});

module.exports = router;







