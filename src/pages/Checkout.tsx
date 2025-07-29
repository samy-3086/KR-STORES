import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, Calendar, Clock, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState({
    deliveryDate: '',
    deliveryTime: '9:00-12:00',
    paymentMethod: 'cod',
    specialInstructions: ''
  });

  const [loading, setLoading] = useState(false);

  const deliveryFee = total >= 500 ? 0 : 50;
  const finalTotal = total + deliveryFee;

  // Generate available delivery dates (next 7 days)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      });
    }
    
    return dates;
  };

  const timeSlots = [
    { value: '9:00-12:00', label: '9:00 AM - 12:00 PM' },
    { value: '12:00-15:00', label: '12:00 PM - 3:00 PM' },
    { value: '15:00-18:00', label: '3:00 PM - 6:00 PM' },
    { value: '18:00-21:00', label: '6:00 PM - 9:00 PM' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setOrderData({
      ...orderData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderData.deliveryDate) {
      alert('Please select a delivery date');
      return;
    }

    setLoading(true);

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order object
      const order = {
        id: Date.now().toString(),
        userId: user?.id || '',
        items: items,
        total: finalTotal,
        status: 'confirmed' as const,
        deliveryDate: orderData.deliveryDate,
        deliveryTime: orderData.deliveryTime,
        specialInstructions: orderData.specialInstructions,
        paymentMethod: orderData.paymentMethod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store order in localStorage (in real app, this would be sent to backend)
      const existingOrders = JSON.parse(localStorage.getItem('kr_stores_orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('kr_stores_orders', JSON.stringify(existingOrders));

      // Clear cart
      clearCart();

      // Navigate to success page
      navigate('/order-success', { state: { orderId: order.id } });
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                Delivery Address
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{user.name}</p>
                <p className="text-gray-600">{user.address}</p>
                <p className="text-gray-600">{user.phone}</p>
              </div>
            </div>

            {/* Delivery Schedule */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-red-600" />
                Delivery Schedule
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Delivery Date
                  </label>
                  <select
                    name="deliveryDate"
                    value={orderData.deliveryDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Date</option>
                    {getAvailableDates().map(date => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Time Slot
                  </label>
                  <select
                    name="deliveryTime"
                    value={orderData.deliveryTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  name="specialInstructions"
                  value={orderData.specialInstructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                Payment Method
              </h3>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={orderData.paymentMethod === 'cod'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={orderData.paymentMethod === 'online'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>Online Payment (UPI/Card)</span>
                </label>
              </div>

              {orderData.paymentMethod === 'online' && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    You will be redirected to payment gateway after placing the order.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-gray-600">
                        ₹{item.product.price} × {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-6 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : `Place Order - ₹${finalTotal}`}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                By placing this order, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;