const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    required: false // Will be generated in pre-save hook
    // unique index is defined below using schema.index()
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  expectedDate: {
    type: Date
  },
  budget: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  response: {
    type: String,
    trim: true
  },
  responseDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Pre-validate hook to assign temporary requestNumber
requestSchema.pre('validate', function(next) {
  if (!this.requestNumber) {
    this.requestNumber = `TEMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

// Pre-save hook to generate unique requestNumber
requestSchema.pre('save', async function(next) {
  if (this.requestNumber && this.requestNumber.startsWith('TEMP')) {
    // Generate unique request number
    let requestNumber;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      const timestamp = Date.now();
      const count = await mongoose.model('Request').countDocuments({}) + 1;
      requestNumber = `REQ-${timestamp}-${count}`;

      const exists = await mongoose.model('Request').findOne({ requestNumber });
      if (!exists) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return next(new Error('Failed to generate unique request number'));
    }

    this.requestNumber = requestNumber;
  }
  next();
});

requestSchema.index({ requestNumber: 1 }, { unique: true });
requestSchema.index({ client: 1 });
requestSchema.index({ contractor: 1 });
requestSchema.index({ status: 1 });

module.exports = mongoose.model('Request', requestSchema);
