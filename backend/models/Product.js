const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    required: true
  },
  price: { 
    type: Number, 
    required: true,
    min: 0 
  },
  mrp: { 
    type: Number, 
    required: true,
    min: 0
  },
  discount: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 100
  },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category',
    required: true 
  },
  subCategory: { 
    type: String,
    default: '' 
  },
  stock: { 
    type: Number, 
    required: true,
    min: 0
  },
  sku: { 
    type: String,
    unique: true,
    sparse: true
  },
  imageUrl: { 
    type: String,
    default: ''
  },
  additionalImages: [{
    type: String,
    default: []
  }],
  manufacturer: { 
    type: String,
    default: '' 
  },
  requiresPrescription: { 
    type: Boolean, 
    default: false
  },
  dosage: {
    type: String,
    default: ''
  },
  // New fields for enhanced product details
  dosageForm: {
    type: String,
    default: ''
  },
  packageSize: {
    type: String,
    default: ''
  },
  storage: {
    type: String,
    default: 'Store in a cool, dry place'
  },
  countryOfOrigin: {
    type: String,
    default: 'India'
  },
  uses: [{
    type: String
  }],
  symptoms: [{
    type: String
  }],
  sideEffects: [{
    type: String
  }],
  precautions: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    anonymous: {
      type: Boolean,
      default: false
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  featured: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a compound index for better review queries
productSchema.index({ 'reviews.user': 1, 'reviews.product': 1 });

// When a product is deleted, clean up references in orders
productSchema.pre('findOneAndDelete', async function(next) {
  // Get the document that is about to be deleted
  const productToDelete = await this.model.findOne(this.getQuery());
  
  if (productToDelete) {
    try {
      // Find any orders with this product and update them
      const Order = mongoose.model('Order');
      await Order.updateMany(
        { 'items.product': productToDelete._id },
        { $set: { 'items.$[elem].productDeleted': true } },
        { arrayFilters: [{ 'elem.product': productToDelete._id }] }
      );
      
      console.log(`Updated orders for deleted product: ${productToDelete._id}`);
    } catch (err) {
      console.error('Error updating orders for deleted product:', err);
    }
  }
  
  next();
});

module.exports = mongoose.model('Product', productSchema);
