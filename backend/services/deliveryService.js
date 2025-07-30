const axios = require('axios');

class DeliveryService {
  constructor() {
    this.storeLocation = {
      lat: 28.6139, // Delhi coordinates
      lng: 77.2090,
      address: "123 Market Street, Delhi"
    };
    
    this.deliveryAreas = [
      { name: "Central Delhi", maxDistance: 15, active: true },
      { name: "South Delhi", maxDistance: 20, active: true },
      { name: "North Delhi", maxDistance: 12, active: true },
      { name: "East Delhi", maxDistance: 18, active: true },
      { name: "West Delhi", maxDistance: 16, active: true }
    ];
    
    this.ratePerKm = 5; // ₹5 per km
    this.minimumFee = 20; // Minimum ₹20
    this.maximumFee = 100; // Maximum ₹100
    this.freeDeliveryThreshold = 500; // Free delivery above ₹500
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get coordinates from address using geocoding API
  async getCoordinatesFromAddress(address) {
    try {
      // Using a free geocoding service (replace with your preferred service)
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          q: address,
          key: process.env.GEOCODING_API_KEY, // You'll need to get this
          limit: 1,
          countrycode: 'in'
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const result = response.data.results[0];
        return {
          lat: result.geometry.lat,
          lng: result.geometry.lng,
          formatted_address: result.formatted
        };
      }
      
      throw new Error('Address not found');
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Unable to process address');
    }
  }

  // Calculate delivery fee
  async calculateDeliveryFee(customerAddress, orderTotal) {
    try {
      // If order total is above threshold, delivery is free
      if (orderTotal >= this.freeDeliveryThreshold) {
        return {
          fee: 0,
          distance: 0,
          message: 'Free delivery on orders above ₹500',
          deliverable: true
        };
      }

      // Get customer coordinates
      const customerCoords = await this.getCoordinatesFromAddress(customerAddress);
      
      // Calculate distance
      const distance = this.calculateDistance(
        this.storeLocation.lat,
        this.storeLocation.lng,
        customerCoords.lat,
        customerCoords.lng
      );

      // Check if address is in deliverable area
      const deliverableArea = this.deliveryAreas.find(area => 
        area.active && distance <= area.maxDistance
      );

      if (!deliverableArea) {
        return {
          fee: 0,
          distance: Math.round(distance * 100) / 100,
          message: 'Sorry, we do not deliver to this area',
          deliverable: false
        };
      }

      // Calculate fee
      let fee = Math.ceil(distance) * this.ratePerKm;
      fee = Math.max(fee, this.minimumFee);
      fee = Math.min(fee, this.maximumFee);

      return {
        fee,
        distance: Math.round(distance * 100) / 100,
        message: `Delivery fee: ₹${fee} (${Math.ceil(distance)} km)`,
        deliverable: true,
        area: deliverableArea.name
      };

    } catch (error) {
      console.error('Delivery calculation error:', error);
      return {
        fee: this.minimumFee,
        distance: 0,
        message: 'Unable to calculate exact distance. Standard delivery fee applied.',
        deliverable: true
      };
    }
  }

  // Validate delivery area
  async validateDeliveryArea(address) {
    try {
      const result = await this.calculateDeliveryFee(address, 0);
      return result.deliverable;
    } catch (error) {
      return false;
    }
  }

  // Get available delivery slots
  getAvailableDeliverySlots(date) {
    const slots = [
      { id: '9-12', time: '9:00 AM - 12:00 PM', available: true },
      { id: '12-15', time: '12:00 PM - 3:00 PM', available: true },
      { id: '15-18', time: '3:00 PM - 6:00 PM', available: true },
      { id: '18-21', time: '6:00 PM - 9:00 PM', available: true }
    ];

    // Add logic to check slot availability based on existing orders
    // This is a simplified version
    return slots;
  }

  // Estimate delivery time
  estimateDeliveryTime(distance) {
    // Base preparation time: 30 minutes
    // Travel time: 3 minutes per km (considering traffic)
    const preparationTime = 30;
    const travelTime = Math.ceil(distance * 3);
    const totalTime = preparationTime + travelTime;

    return {
      preparationTime,
      travelTime,
      totalTime,
      estimatedDelivery: `${totalTime} minutes`
    };
  }
}

module.exports = new DeliveryService();