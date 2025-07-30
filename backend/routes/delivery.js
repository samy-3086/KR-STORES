const express = require('express');
const { body } = require('express-validator');
const deliveryService = require('../services/deliveryService');
const { validationResult } = require('express-validator');

const router = express.Router();

// Calculate delivery fee
router.post('/calculate-fee', [
  body('address').notEmpty().withMessage('Address is required'),
  body('orderTotal').isFloat({ min: 0 }).withMessage('Order total must be a positive number')
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

    const { address, orderTotal } = req.body;

    const result = await deliveryService.calculateDeliveryFee(address, orderTotal);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Delivery fee calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to calculate delivery fee'
    });
  }
});

// Validate delivery area
router.post('/validate-area', [
  body('address').notEmpty().withMessage('Address is required')
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

    const { address } = req.body;

    const isDeliverable = await deliveryService.validateDeliveryArea(address);

    res.json({
      success: true,
      deliverable: isDeliverable,
      message: isDeliverable ? 'Delivery available' : 'Delivery not available in this area'
    });

  } catch (error) {
    console.error('Delivery validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to validate delivery area'
    });
  }
});

// Get available delivery slots
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    const slots = deliveryService.getAvailableDeliverySlots(date);

    res.json({
      success: true,
      data: slots
    });

  } catch (error) {
    console.error('Delivery slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch delivery slots'
    });
  }
});

// Estimate delivery time
router.post('/estimate-time', [
  body('address').notEmpty().withMessage('Address is required')
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

    const { address } = req.body;

    const deliveryInfo = await deliveryService.calculateDeliveryFee(address, 0);
    
    if (!deliveryInfo.deliverable) {
      return res.status(400).json({
        success: false,
        message: 'Delivery not available in this area'
      });
    }

    const timeEstimate = deliveryService.estimateDeliveryTime(deliveryInfo.distance);

    res.json({
      success: true,
      data: {
        ...deliveryInfo,
        ...timeEstimate
      }
    });

  } catch (error) {
    console.error('Delivery time estimation error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to estimate delivery time'
    });
  }
});

module.exports = router;