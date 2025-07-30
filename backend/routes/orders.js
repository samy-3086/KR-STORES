const express = require('express');
const { body, param, query } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { verifyToken, adminOnly } = require('../controllers/authController');
const { validationResult } = require('express-validator');
const deliveryService = require('../services/deliveryService');

const router = express.Router();

// Create new order
router.post('/', verifyToken, [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('paymentMethod').isIn(['cod', 'online']).withMessage('Invalid payment method'),
  body('deliveryDate').isISO8601().toDate(),
  body('deliveryTimeSlot').isIn(['9:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00']),
  body('deliveryAddress.street').notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').notEmpty().withMessage('City is required'),
  body('deliveryAddress.pincode').isPostalCode('IN').withMessage('Invalid pincode')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, paymentMethod, deliveryDate, deliveryTimeSlot, deliveryAddress, specialInstructions } = req.body;
    const userId = req.user._id;

    // Validate delivery date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(deliveryDate) < today) {
      return res.status(400).json({
        success: false,
        message: 'Delivery date cannot be in the past'
      });
    }

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Calculate delivery fee
    const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.pincode}`;
    const deliveryInfo = await deliveryService.calculateDeliveryFee(fullAddress, subtotal);
    
    if (!deliveryInfo.deliverable) {
      return res.status(400).json({
        success: false,
        message: 'Delivery not available to this address'
      });
    }

    const deliveryFee = deliveryInfo.fee;
    const total = subtotal + deliveryFee;

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      subtotal,
      deliveryFee,
      total,
      paymentMethod,
      deliveryDate,
      deliveryTimeSlot,
      deliveryAddress,
      specialInstructions
    });

    await order.save();

    // Clear user's cart
    await Cart.findOneAndDelete({ user: userId });

    // Populate order details for response
    await order.populate('items.product', 'name image price unit');
    await order.populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to place order'
    });
  }
});

// Get user's orders
router.get('/my-orders', verifyToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user._id;

    const filter = { user: userId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name image price unit')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch orders'
    });
  }
});

// Get single order
router.get('/:id', verifyToken, [
  param('id').isMongoId().withMessage('Invalid order ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const orderId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const filter = { _id: orderId };
    if (!isAdmin) {
      filter.user = userId;
    }

    const order = await Order.findOne(filter)
      .populate('items.product', 'name image price unit')
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch order'
    });
  }
});

// Admin: Get all orders
router.get('/', verifyToken, adminOnly, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  query('search').optional().isLength({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name image price unit')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    // Calculate statistics
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        orders,
        statistics: stats[0] || {},
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch orders'
    });
  }
});

// Admin: Update order status
router.patch('/:id/status', verifyToken, adminOnly, [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('trackingNumber').optional().isLength({ min: 5, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, trackingNumber } = req.body;
    const orderId = req.params.id;

    const updateData = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('items.product', 'name image price unit')
     .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to update order status'
    });
  }
});

module.exports = router;