const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Create a new order (authenticated users only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating order for user:', req.user._id);
    console.log('Order data received:', JSON.stringify(req.body, null, 2));
    
    const { items, shippingAddress, paymentMethod } = req.body;
    
    if (!items || !items.length || !shippingAddress) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'Invalid order data. Items and shipping address are required.' });
    }

    // Verify products and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      console.log('Processing item:', item);
      const product = await Product.findById(item.product);
      if (!product) {
        console.log('Product not found:', item.product);
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }

      console.log('Found product:', product.name);

      // Check stock availability
      if (product.stock < item.quantity) {
        console.log('Insufficient stock for product:', product.name);
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }

      // Add item with current price and product details
      orderItems.push({
        product: item.product,
        productName: product.name,
        productImage: product.imageUrl || '',
        quantity: item.quantity,
        price: product.price
      });

      // Add to total
      totalAmount += product.price * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    console.log('Order items prepared:', orderItems);
    console.log('Total amount:', totalAmount);

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod
    });

    console.log('Saving order...');
    await order.save();
    console.log('Order saved successfully with ID:', order._id);

    // Populate the order with product details for the response
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name imageUrl price');

    console.log('Order creation completed successfully');
    res.status(201).json({ 
      message: 'Order created successfully',
      order: populatedOrder
    });
  } catch (err) {
    console.error('Order creation error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
    });
  }
});

// Get all orders for the current user
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('_id orderId totalAmount status createdAt items.quantity')
      .populate('items.product', 'name imageUrl');
    
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order details by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name imageUrl price')
      .populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order belongs to requesting user or if user is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
    
    res.json({ order });
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel an order (user can only cancel their own pending orders)
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order belongs to requesting user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }
    
    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ message: `Cannot cancel order with status: ${order.status}` });
    }
    
    // Update order status
    order.status = 'cancelled';
    order.orderNotes = order.orderNotes 
      ? `${order.orderNotes}\nCancelled by user on ${new Date().toISOString()}`
      : `Cancelled by user on ${new Date().toISOString()}`;
    
    await order.save();
    
    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }
    
    res.json({ 
      message: 'Order cancelled successfully',
      order: {
        _id: order._id,
        orderId: order.orderId,
        status: order.status
      }
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====== ADMIN ROUTES ======

// Get all orders (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const { 
      status, 
      from, 
      to, 
      search,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;
    
    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by date range
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    
    // Search by orderId or customer name/email
    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(user => user._id);
      
      query.$or = [
        { _id: search.match(/^[0-9a-fA-F]{24}$/) ? search : null },
        { user: { $in: userIds } }
      ];
    }
    
    const orders = await Order.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'name email')
      .select('_id orderId user totalAmount status createdAt updatedAt');
    
    const total = await Order.countDocuments(query);
    
    res.json({ 
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching all orders:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (admin only)
router.patch('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status, trackingInfo, paymentStatus, orderNotes } = req.body;
    
    const order = await Order.findById(req.params.id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Store previous status for comparison
    const previousStatus = order.status;
    
    // Update fields if provided
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (orderNotes) {
      order.orderNotes = order.orderNotes 
        ? `${order.orderNotes}\n${new Date().toISOString()}: ${orderNotes}`
        : `${new Date().toISOString()}: ${orderNotes}`;
    }
    
    // Update tracking info if provided
    if (trackingInfo) {
      order.trackingInfo = {
        ...order.trackingInfo,
        ...trackingInfo
      };
      
      // Set dispatch date if not already set and status is shipped
      if (status === 'shipped' && !order.trackingInfo.dispatchDate) {
        order.trackingInfo.dispatchDate = new Date();
      }
    }
    
    // Handle status change to delivered
    if (status === 'delivered' && previousStatus !== 'delivered') {
      // Set delivery date
      order.deliveredAt = new Date();
      
      // Send notification to user about order delivery
      try {
        // Create notification for review reminder
        const Notification = require('../models/Notification');
        await new Notification({
          user: order.user,
          title: 'Order Delivered!',
          message: `Your order #${order.orderId} has been delivered. We'd love to hear your feedback!`,
          type: 'order-delivered',
          data: {
            orderId: order._id
          },
          isRead: false
        }).save();
      } catch (notificationErr) {
        console.error('Failed to create delivery notification:', notificationErr);
        // Don't block the process if notification fails
      }
    }
    
    await order.save();
    
    res.json({ 
      message: 'Order updated successfully',
      order: {
        _id: order._id,
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        trackingInfo: order.trackingInfo
      }
    });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get products available for review by the current user
router.get('/reviewable-products', auth, async (req, res) => {
  try {
    // Get all delivered orders that have items not reviewed yet
    const orders = await Order.find({
      user: req.user._id,
      status: 'delivered',
      'items.reviewed': false
    })
    .populate('items.product', 'name imageUrl price description')
    .sort('-updatedAt');

    if (!orders || orders.length === 0) {
      return res.json({ message: 'No products available for review', products: [] });
    }

    // Extract products available for review
    const reviewableProducts = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!item.reviewed && item.product && !item.productDeleted) {
          reviewableProducts.push({
            productId: item.product._id,
            productName: item.product.name,
            productImage: item.product.imageUrl,
            orderId: order._id,
            orderDate: order.createdAt,
            deliveryDate: order.deliveredAt || order.updatedAt
          });
        }
      });
    });

    res.json({
      count: reviewableProducts.length,
      products: reviewableProducts
    });
  } catch (err) {
    console.error('Error fetching reviewable products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
