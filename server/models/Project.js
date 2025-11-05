const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  contractor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  startDate: {
    type: Date
  },
  expectedEndDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  budget: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCost: {
    type: Number,
    default: 0,
    min: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  duration: {
    type: Number, // مدة التنفيذ بالأيام
    min: 0
  },
  materials: [{
    name: String,
    quantity: Number,
    unit: String,
    cost: Number
  }],
  engineers: [{
    name: {
      type: String,
      trim: true
    },
    specialty: {
      type: String,
      enum: ['مدني', 'عمارة', 'كهرباء'],
      default: 'مدني'
    },
    salary: {
      type: Number,
      default: 0,
      min: 0
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  crews: [{
    type: String
  }],
  images: [{
    type: String
  }],
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

projectSchema.index({ name: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ contractor: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;

