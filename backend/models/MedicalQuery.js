const mongoose = require('mongoose');

const medicalQuerySchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  email: String,
  hasPrescription: Boolean,
  prescriptionFile: String,
  purchaseWithoutPrescription: Boolean,
  productList: String,
  message: String,
  
  // Additional fields for enhanced query management
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subject: {
    type: String,
    default: 'Medical Query'
  },
  symptoms: String,
  currentMedications: String,
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  contactNumber: String,
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },
  queryText: String,
  response: String,
  responseDate: Date,
  
  submittedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index for better query performance
medicalQuerySchema.index({ status: 1, createdAt: -1 });
medicalQuerySchema.index({ user: 1 });

module.exports = mongoose.model('MedicalQuery', medicalQuerySchema);

