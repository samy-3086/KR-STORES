const express = require('express');
const { body, param, query } = require('express-validator');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const { verifyToken, adminOnly } = require('../controllers/authController');
const { validationResult } = require('express-validator');

const router = express.Router();

// Submit feedback
router.post('/', verifyToken, [
  body('orderId').isMongoId().withMessage('Invalid order ID'),
  body('rating.overall').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('rating.productQuality').optional().isInt({ min: 1, max: 5 }),
  body('rating.deliveryTime').optional().isInt({ min: 1, max: 5 }),
  body('rating.customerService').optional().isInt({ min: 1, max: 5 }),
  body('comment').optional().isLength({ max: 1000 }).withMessage('Comment must be less than 1000 characters'),
  body('category').optional().isIn(['product', 'delivery', 'service', 'general'])
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

    const { orderId, rating, comment, category } = req.body;
    const userId = req.user._id;

    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for delivered orders'
      });
    }

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ user: userId, order: orderId });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this order'
      });
    }

    // Create feedback
    const feedback = new Feedback({
      user: userId,
      order: orderId,
      rating,
      comment,
      category: category || 'general'
    });

    await feedback.save();

    // Populate user and order details for response
    await feedback.populate('user', 'name email');
    await feedback.populate('order', 'orderNumber total');

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to submit feedback'
    });
  }
});

// Get user's feedback
router.get('/my-feedback', verifyToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 20 })
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

    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const feedback = await Feedback.find({ user: userId })
      .populate('order', 'orderNumber total createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments({ user: userId });

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get user feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch feedback'
    });
  }
});

// Get all feedback (Admin only)
router.get('/', verifyToken, adminOnly, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isIn(['pending', 'reviewed', 'resolved']),
  query('category').optional().isIn(['product', 'delivery', 'service', 'general'])
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
    const status = req.query.status;
    const category = req.query.category;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const feedback = await Feedback.find(filter)
      .populate('user', 'name email phone')
      .populate('order', 'orderNumber total createdAt')
      .populate('adminResponse.respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Feedback.countDocuments(filter);

    // Calculate statistics
    const stats = await Feedback.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating.overall' },
          totalFeedback: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          resolvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        feedback,
        statistics: stats[0] || {
          averageRating: 0,
          totalFeedback: 0,
          pendingCount: 0,
          resolvedCount: 0
        },
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch feedback'
    });
  }
});

// Respond to feedback (Admin only)
router.post('/:id/respond', verifyToken, adminOnly, [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('message').notEmpty().withMessage('Response message is required'),
  body('status').optional().isIn(['pending', 'reviewed', 'resolved'])
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

    const { id: feedbackId } = req.params;
    const { message, status } = req.body;
    const adminId = req.user._id;

    const feedback = await Feedback.findById(feedbackId);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Update feedback with admin response
    feedback.adminResponse = {
      message,
      respondedBy: adminId,
      respondedAt: new Date()
    };
    
    if (status) {
      feedback.status = status;
    }

    await feedback.save();

    // Populate for response
    await feedback.populate('user', 'name email');
    await feedback.populate('adminResponse.respondedBy', 'name');

    res.json({
      success: true,
      message: 'Response added successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Respond to feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to respond to feedback'
    });
  }
});

// Update feedback status (Admin only)
router.patch('/:id/status', verifyToken, adminOnly, [
  param('id').isMongoId().withMessage('Invalid feedback ID'),
  body('status').isIn(['pending', 'reviewed', 'resolved']).withMessage('Invalid status')
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

    const { id: feedbackId } = req.params;
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to update feedback status'
    });
  }
});

module.exports = router;