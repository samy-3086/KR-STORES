import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, Clock, Phone } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const { orderId, orderNumber } = location.state || {};
  const displayOrderId = orderNumber || orderId || 'KR' + Date.now();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-20 h-20 text-green-500" />
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll deliver fresh groceries to your doorstep.
          </p>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Order ID:</span>
              <span className="font-semibold text-gray-800">{displayOrderId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                Confirmed
              </span>
            </div>
          </div>

          {/* What's Next */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Order Processing</p>
                  <p className="text-xs text-gray-600">We're preparing your items for delivery</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Delivery Scheduled</p>
                  <p className="text-xs text-gray-600">Your order will be delivered on the selected date</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Stay Updated</p>
                  <p className="text-xs text-gray-600">We'll call you before delivery</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              to="/products"
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold block"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium block"
            >
              Back to Home
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Need help with your order?</p>
            <div className="flex justify-center space-x-4 text-sm">
              <a href="tel:+919876543210" className="text-red-600 hover:text-red-700">
                📞 +91 98765 43210
              </a>
              <a href="mailto:support@krstores.com" className="text-red-600 hover:text-red-700">
                ✉️ Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;