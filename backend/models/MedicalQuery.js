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
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MedicalQuery', medicalQuerySchema);

