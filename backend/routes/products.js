const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { uploadProduct, deleteFromCloudinary, extractPublicId } = require('../config/cloudinary');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      subCategory, 
      search, 
      minPrice, 
      maxPrice,
      featured,
      sort = 'newest',
      limit = 20,
      page = 1,
      requiresPrescription
    } = req.query;

    const query = {};
    
    // Apply filters if provided
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    if (featured === 'true') query.featured = true;
    if (requiresPrescription === 'true') query.requiresPrescription = true;
    if (requiresPrescription === 'false') query.requiresPrescription = false;

    // Determine sort order
    let sortOption = {};
    switch(sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'name-asc':
        sortOption = { name: 1 };
        break;
      case 'name-desc':
        sortOption = { name: -1 };
        break;
      case 'rating':
        sortOption = { rating: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 }; // newest by default
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    // Execute query
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitVal);

    // Get total count for pagination
    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limitVal)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single product by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new product (admin only)
router.post('/', [auth, adminAuth, uploadProduct.single('image')], async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      mrp,
      category,
      subCategory,
      stock,
      sku,
      manufacturer,
      requiresPrescription,
      dosage,
      featured
    } = req.body;

    // Validate category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Create product object
    const product = new Product({
      name,
      description,
      price: parseFloat(price),
      mrp: parseFloat(mrp),
      discount: mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0,
      category,
      subCategory,
      stock: parseInt(stock),
      sku,
      manufacturer,
      requiresPrescription: requiresPrescription === 'true',
      dosage,
      featured: featured === 'true'
    });

    // Add image if uploaded (Cloudinary URL)
    if (req.file) {
      product.imageUrl = req.file.path; // Cloudinary provides the full URL in req.file.path
    }

    // Save product
    const savedProduct = await product.save();
    
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a product (admin only)
router.put('/:id', [auth, adminAuth, uploadProduct.single('image')], async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      mrp,
      category,
      subCategory,
      stock,
      sku,
      manufacturer,
      requiresPrescription,
      dosage,
      featured
    } = req.body;

    // Check if product exists
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate category if provided
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    // If new image is uploaded, delete old image from Cloudinary
    if (req.file && product.imageUrl) {
      try {
        const publicId = extractPublicId(product.imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
        // Continue with update even if old image deletion fails
      }
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    if (price) product.price = parseFloat(price);
    if (mrp) product.mrp = parseFloat(mrp);
    if (price && mrp) {
      product.discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
    }
    if (category) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (stock !== undefined) product.stock = parseInt(stock);
    if (sku !== undefined) product.sku = sku;
    if (manufacturer !== undefined) product.manufacturer = manufacturer;
    if (requiresPrescription !== undefined) product.requiresPrescription = requiresPrescription === 'true';
    if (dosage !== undefined) product.dosage = dosage;
    if (featured !== undefined) product.featured = featured === 'true';

    // Add/update image if uploaded (Cloudinary URL)
    if (req.file) {
      product.imageUrl = req.file.path; // Cloudinary provides the full URL in req.file.path
    }

    // Save updated product
    const updatedProduct = await product.save();
    
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image from Cloudinary if exists
    if (product.imageUrl) {
      try {
        const publicId = extractPublicId(product.imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue with product deletion even if image deletion fails
      }
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product review (authenticated users)
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    // Add review
    const review = {
      user: req.user.id,
      rating: Number(rating),
      text
    };

    product.reviews.push(review);
    
    // Update product rating
    const totalRatings = product.reviews.reduce((acc, item) => acc + item.rating, 0);
    product.rating = totalRatings / product.reviews.length;

    await product.save();

    res.status(201).json({ message: 'Review added' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
