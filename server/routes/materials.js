const express = require('express');
const router = express.Router();
const Material = require('../models/Material');
const { optionalAuth } = require('../middleware/auth');

router.use(optionalAuth);

router.get('/', async (req, res) => {
  try {
    const { category, status, lowStock } = req.query;
    const query = {};
    
    // عزل البيانات: المواد مشتركة بين جميع المقاولين (يمكن تعديلها لاحقاً)
    // حالياً، جميع المقاولين يرون جميع المواد
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    let materials = await Material.find(query).populate('supplier', 'name companyName');
    
    if (lowStock === 'true') {
      materials = materials.filter(m => m.quantity <= m.minStock);
    }
    
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials', message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id).populate('supplier');
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch material', message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const material = new Material(req.body);
    
    if (material.quantity <= 0) {
      material.status = 'out-of-stock';
    } else if (material.quantity <= material.minStock) {
      material.status = 'low-stock';
    } else {
      material.status = 'available';
    }
    
    await material.save();
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create material', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    
    if (material.quantity <= 0) {
      material.status = 'out-of-stock';
    } else if (material.quantity <= material.minStock) {
      material.status = 'low-stock';
    } else {
      material.status = 'available';
    }
    
    await material.save();
    res.json(material);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update material', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete material', message: error.message });
  }
});

module.exports = router;













