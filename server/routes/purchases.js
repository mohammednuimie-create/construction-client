const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

router.get('/', async (req, res) => {
  try {
    const { supplier, project, status } = req.query;
    const query = {};
    
    if (supplier) query.supplier = supplier;
    if (project) query.project = project;
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
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('supplier').populate('project');
    
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    res.json(purchase);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update purchase', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase not found' });
    }
    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete purchase', message: error.message });
  }
});

module.exports = router;



