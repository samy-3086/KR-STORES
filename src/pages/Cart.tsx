import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            to="/products"
            className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = total >= 500 ? 0 : 50;
  const finalTotal = total + deliveryFee;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md">
              {items.map((item, index) => (
                <div
                  key={item.product.id}
                  className={`p-4 sm:p-6 ${index !== items.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    {/* Product Image */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg"
                    />

                    {/* Product Details */}
                    <div className="flex-1 w-full">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="text-base sm:text-lg font-semibold text-gray-800 hover:text-red-600 block"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-gray-600 text-sm mt-1 hidden sm:block">
                        {item.product.description.substring(0, 100)}...
                      </p>
                      <div className="flex items-center space-x-2 mt-2 mb-4 sm:mb-0">
                        <span className="text-lg font-bold text-red-600">
                          ₹{item.product.price}
                        </span>
                        <span className="text-gray-500">/{item.product.unit}</span>
                      </div>
                      
                      {/* Mobile: Quantity and Remove Controls */}
                      <div className="flex items-center justify-between sm:hidden">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-3 hover:bg-gray-100 touch-manipulation"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="px-4 py-3 font-medium text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-3 hover:bg-gray-100 touch-manipulation"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-3 text-red-600 hover:bg-red-50 rounded-lg touch-manipulation"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                        
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-800">
                            ₹{item.product.price * item.quantity}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Quantity Controls */}
                    <div className="hidden sm:flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Desktop: Item Total */}
                    <div className="hidden sm:block text-right">
                      <div className="text-lg font-bold text-gray-800">
                        ₹{item.product.price * item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:sticky lg:top-24">
              <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-medium">₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                {total < 500 && (
                  <p className="text-sm text-gray-500">
                    Add ₹{500 - total} more for free delivery
                  </p>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal}</span>
                  </div>
                </div>
              </div>

              {user ? (
                <Link
                  to="/checkout"
                  className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold text-center block"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/auth"
                    className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-semibold text-center block"
                  >
                    Login to Checkout
                  </Link>
                  <p className="text-sm text-gray-600 text-center">
                    New customer? <Link to="/auth" className="text-red-600 hover:text-red-700">Create an account</Link>
                  </p>
                </div>
              )}

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="w-full mt-4 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;