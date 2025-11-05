const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportNumber: {
    type: String,
    unique: true,
    required: true
  },
  reportType: {
    type: String,
    enum: ['financial', 'inventory', 'project', 'supplier', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  period: {
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

reportSchema.index({ reportType: 1 });
reportSchema.index({ generatedAt: -1 });

reportSchema.pre('save', async function(next) {
  if (!this.reportNumber) {
    const count = await mongoose.model('Report').countDocuments();
    this.reportNumber = `RPT-${Date.now()}-${count + 1}`;
  }
  next();
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;





