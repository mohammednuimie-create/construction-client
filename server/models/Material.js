const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    default: 'وحدة'
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  minStock: {
    type: Number,
    default: 0,
    min: 0
  },
  pricePerUnit: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: String,
    default: 'المخزن الرئيسي'
  },
  category: {
    type: String,
    enum: ['بناء', 'كهرباء', 'سباكة', 'دهان', 'أخرى'],
    default: 'أخرى'
  },
  status: {
    type: String,
    enum: ['available', 'low-stock', 'out-of-stock'],
    default: 'available'
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for remaining stock
MaterialSchema.virtual('remainingStock').get(function() {
  return Math.max(0, this.quantity - this.minStock);
});

// Pre-save hook to update status based on quantity
MaterialSchema.pre('save', function(next) {
  if (this.quantity <= 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity <= this.minStock) {
    this.status = 'low-stock';
  } else {
    this.status = 'available';
  }
  next();
});

module.exports = mongoose.model('Material', MaterialSchema);



