const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  taxNumber: {
    type: String,
    trim: true
  },
  contactPerson: {
    type: String,
    trim: true
  },
  paymentTerms: {
    type: String,
    trim: true
  },
  totalPurchases: {
    type: Number,
    default: 0,
    min: 0
  },
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  totalRemaining: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

supplierSchema.index({ name: 1 });
supplierSchema.index({ email: 1 });
supplierSchema.index({ phone: 1 });

// Virtual for calculating remaining amount
supplierSchema.virtual('remaining').get(function() {
  return this.totalPurchases - this.totalPaid;
});

// Pre-save middleware to calculate totalRemaining
supplierSchema.pre('save', function(next) {
  this.totalRemaining = this.totalPurchases - this.totalPaid;
  next();
});

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier;



