const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

router.get('/', async (req, res) => {
  try {
    const { supplier, project, status, paymentMethod } = req.query;
    const query = {};
    
    if (supplier) query.supplier = supplier;
    if (project) query.project = project;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    
    const payments = await Payment.find(query)
      .populate('supplier', 'name companyName')
      .populate('project', 'name')
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
    const payment = new Payment(req.body);
    await payment.save();
    
    const populatedPayment = await Payment.findById(payment._id)
      .populate('supplier')
      .populate('project');
    
    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create payment', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier').populate('project');
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update payment', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment', message: error.message });
  }
});

module.exports = router;

