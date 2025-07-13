const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { uploadCategory, deleteFromCloudinary, extractPublicId } = require('../config/cloudinary');
const slugify = require('slugify');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const { 
      parent, 
      featured,
      sort = 'order' 
    } = req.query;

    const query = {};
    
    // Apply filters if provided
    if (parent === 'null' || parent === 'root') {
      query.parentCategory = null; // Get root categories
    } else if (parent) {
      query.parentCategory = parent; // Get subcategories of specified parent
    }
    
    if (featured === 'true') {
      query.featured = true;
    }

    // Determine sort order
    let sortOption = {};
    switch(sort) {
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { displayOrder: 1, name: 1 }; // Default to display order
    }

    // Get categories with populated parent
    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .sort(sortOption);

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get category by ID or slug (public)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let category;

    // Check if identifier is ObjectId or slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId, find by ID
      category = await Category.findById(identifier)
        .populate('parentCategory', 'name slug');
    } else {
      // It's a slug, find by slug
      category = await Category.findOne({ slug: identifier })
        .populate('parentCategory', 'name slug');
    }

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get products by category ID or slug (public)
router.get('/:identifier/products', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { 
      sort = 'newest',
      limit = 20,
      page = 1
    } = req.query;

    let categoryId;

    // Check if identifier is ObjectId or slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId, use directly
      const category = await Category.findById(identifier);
      if (!category) return res.status(404).json({ message: 'Category not found' });
      categoryId = category._id;
    } else {
      // It's a slug, find category first
      const category = await Category.findOne({ slug: identifier });
      if (!category) return res.status(404).json({ message: 'Category not found' });
      categoryId = category._id;
    }

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
      default:
        sortOption = { createdAt: -1 }; // newest by default
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitVal = parseInt(limit);

    // Get products for this category
    const products = await Product.find({ category: categoryId })
      .sort(sortOption)
      .skip(skip)
      .limit(limitVal);

    // Get total count for pagination
    const total = await Product.countDocuments({ category: categoryId });

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

// Create new category (admin only)
router.post('/', [auth, adminAuth, uploadCategory.single('image')], async (req, res) => {
  try {
    const {
      name,
      description,
      parentCategory,
      featured,
      displayOrder
    } = req.body;

    // Generate slug from name
    const slug = slugify(name, {
      lower: true,
      strict: true
    });

    // Check if category with this slug already exists
    const categoryExists = await Category.findOne({ slug });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    // Check if parent category exists if provided
    if (parentCategory && parentCategory !== 'null') {
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    // Create category object
    const category = new Category({
      name,
      description,
      slug,
      parentCategory: parentCategory && parentCategory !== 'null' ? parentCategory : null,
      featured: featured === 'true',
      displayOrder: displayOrder ? parseInt(displayOrder) : 0
    });

    // Add image if uploaded (Cloudinary URL)
    if (req.file) {
      category.imageUrl = req.file.path; // Cloudinary provides the full URL in req.file.path
    }

    // Save category
    const savedCategory = await category.save();
    
    res.status(201).json(savedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category (admin only)
router.put('/:id', [auth, adminAuth, uploadCategory.single('image')], async (req, res) => {
  try {
    const {
      name,
      description,
      parentCategory,
      featured,
      displayOrder
    } = req.body;

    // Find category
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if name is changed, if so, update slug
    if (name && name !== category.name) {
      const newSlug = slugify(name, {
        lower: true,
        strict: true
      });
      
      // Check if new slug already exists for another category
      const slugExists = await Category.findOne({ 
        slug: newSlug, 
        _id: { $ne: category._id } 
      });
      
      if (slugExists) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      
      category.slug = newSlug;
      category.name = name;
    }

    // Check parent category
    if (parentCategory !== undefined) {
      if (parentCategory === 'null' || parentCategory === '') {
        category.parentCategory = null;
      } else if (parentCategory) {
        // Check for circular reference
        if (parentCategory === req.params.id) {
          return res.status(400).json({ message: 'Category cannot be its own parent' });
        }
        
        const parentExists = await Category.findById(parentCategory);
        if (!parentExists) {
          return res.status(400).json({ message: 'Parent category not found' });
        }
        
        category.parentCategory = parentCategory;
      }
    }

    // Update other fields
    if (description !== undefined) category.description = description;
    if (featured !== undefined) category.featured = featured === 'true';
    if (displayOrder !== undefined) category.displayOrder = parseInt(displayOrder);

    // If new image is uploaded, delete old image from Cloudinary
    if (req.file && category.imageUrl) {
      try {
        const publicId = extractPublicId(category.imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting old image from Cloudinary:', error);
        // Continue with update even if old image deletion fails
      }
    }

    // Add/update image if uploaded (Cloudinary URL)
    if (req.file) {
      category.imageUrl = req.file.path; // Cloudinary provides the full URL in req.file.path
    }

    // Save updated category
    const updatedCategory = await category.save();
    
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if products use this category
    const productsCount = await Product.countDocuments({ category: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category: ${productsCount} products are using this category` 
      });
    }

    // Check if any subcategories use this as parent
    const childrenCount = await Category.countDocuments({ parentCategory: req.params.id });
    if (childrenCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category: ${childrenCount} subcategories are using this as parent` 
      });
    }

    // Delete image from Cloudinary if exists
    if (category.imageUrl) {
      try {
        const publicId = extractPublicId(category.imageUrl);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue with category deletion even if image deletion fails
      }
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
