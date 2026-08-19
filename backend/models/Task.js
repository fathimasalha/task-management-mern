const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'DONE'],
      default: 'PENDING',
      index: true,
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true,
    },
    dueDate: {
      type: Date,
      index: true,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    weatherSnapshot: {
      temp: { type: Number },
      description: { type: String },
      icon: { type: String },
      cityName: { type: String },
      fetchedAt: { type: Date },
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-set completedAt when marked DONE
taskSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'DONE' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'DONE') {
      this.completedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model('Task', taskSchema);
