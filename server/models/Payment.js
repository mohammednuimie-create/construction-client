const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    unique: true,
    required: false // Will be generated in pre-save hook
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  purchase: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Purchase'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank-transfer', 'check', 'credit-card'],
    default: 'cash'
  },
  checkNumber: {
    type: String,
    trim: true
  },
  bankName: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

paymentSchema.index({ supplier: 1 });
paymentSchema.index({ paymentDate: -1 });

paymentSchema.pre('save', async function(next) {
  // Generate paymentNumber if not provided or if it's a temporary value
  if (!this.paymentNumber || this.paymentNumber.startsWith('TEMP-')) {
    try {
      const count = await mongoose.model('Payment').countDocuments();
      this.paymentNumber = `PAY-${Date.now()}-${count + 1}`;
    } catch (error) {
      // If count fails, use timestamp with random string
      this.paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  next();
});

// Ensure paymentNumber is set before validation
paymentSchema.pre('validate', function(next) {
  if (!this.paymentNumber) {
    // Temporary unique value - will be replaced in pre-save
    this.paymentNumber = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;






