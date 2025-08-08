const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// POST - Add a review to a product
router.post('/products/:id', auth, async (req, res) => {
  try {
    const { rating, comment, text, anonymous = false } = req.body;
    const productId = req.params.id;
    const userId = req.user._id; // Use _id instead of id for MongoDB
    
    // Use either text or comment field from the request
    const reviewText = text || comment;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate comment/text
    if (!reviewText || reviewText.trim() === '') {
      return res.status(400).json({ message: 'Review text is required' });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const hasReviewed = product.reviews.some(review => review.user && review.user.toString() === userId.toString());
    if (hasReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Add the review
    const newReview = {
      user: userId,
      text: reviewText, // use the reviewText variable we defined earlier
      rating,
      anonymous,
      createdAt: new Date(), // use createdAt instead of date to match schema
      updatedAt: new Date() // add updatedAt to match schema
    };

    product.reviews.push(newReview);

    // Recalculate product rating average
    if (product.reviews.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.rating = Number((totalRating / product.reviews.length).toFixed(1));
    }

    try {
      await product.save();
    } catch (saveErr) {
      console.error('Error saving product with review:', saveErr);
      return res.status(500).json({ 
        message: 'Error saving product with review',
        error: saveErr.message
      });
    }

    // Populate user info in the new review
    try {
      await Product.populate(product, {
        path: 'reviews.user',
        select: 'name'
      });
    } catch (populateErr) {
      console.error('Error populating user data:', populateErr);
      // Continue even if population fails - we'll use fallbacks
    }

    // Get the newly added review (last item in the array)
    const savedReview = product.reviews[product.reviews.length - 1];
    
    // Prepare the response with safe fallbacks for all fields
    const responseData = { 
      success: true, 
      message: 'Review added successfully',
      reviewId: savedReview._id.toString(),
      review: {
        _id: savedReview._id.toString(),
        rating: savedReview.rating,
        text: savedReview.text,
        anonymous: savedReview.anonymous || false,
        createdAt: savedReview.createdAt,
        user: savedReview.anonymous 
          ? { name: "Anonymous" } 
          : (savedReview.user && typeof savedReview.user === 'object' && savedReview.user.name 
             ? { name: savedReview.user.name, _id: savedReview.user._id?.toString() } 
             : { name: "User" })
      },
      verifiedPurchase: false,
      userName: savedReview.anonymous ? null : (
        savedReview.user && typeof savedReview.user === 'object' && savedReview.user.name 
          ? savedReview.user.name 
          : "User"
      ),
      newRating: product.rating
    };
    
    res.status(201).json(responseData);

  } catch (err) {
    console.error('Error adding review:', err);
    // Log the full error stack for debugging
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error when adding review',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
});

// GET - Fetch product reviews
router.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    const product = await Product.findById(productId)
      .populate({
        path: 'reviews.user',
        select: 'name'
      });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const reviews = product.reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error when fetching reviews' });
  }
});

module.exports = router;
