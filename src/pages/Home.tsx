import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, Clock, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getFeaturedProducts } from '../data/products';

const Home: React.FC = () => {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh Groceries
              <span className="block text-yellow-300">Delivered Daily</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Get the freshest vegetables, fruits, spices, and groceries delivered to your doorstep
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Free Delivery</h3>
              <p className="text-gray-600">Free delivery on orders above ₹500. Fast and reliable service.</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality Assured</h3>
              <p className="text-gray-600">Fresh products with quality guarantee. 100% satisfaction or money back.</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Same Day Delivery</h3>
              <p className="text-gray-600">Order before 6 PM and get same-day delivery to your location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link
              to="/products?category=vegetables"
              className="group bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">🥦</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-red-600">Vegetables</h3>
              <p className="text-sm text-gray-600 mt-2">Fresh & Organic</p>
            </Link>
            <Link
              to="/products?category=fruits"
              className="group bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">🍎</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-red-600">Fruits</h3>
              <p className="text-sm text-gray-600 mt-2">Sweet & Juicy</p>
            </Link>
            <Link
              to="/products?category=spices"
              className="group bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">🌶️</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-red-600">Spices</h3>
              <p className="text-sm text-gray-600 mt-2">Aromatic & Pure</p>
            </Link>
            <Link
              to="/products?category=groceries"
              className="group bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">🍚</div>
              <h3 className="font-semibold text-gray-800 group-hover:text-red-600">Groceries</h3>
              <p className="text-sm text-gray-600 mt-2">Daily Essentials</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked fresh products just for you</p>
            </div>
            <Link
              to="/products"
              className="text-red-600 hover:text-red-700 font-semibold flex items-center"
            >
              View All
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Excellent quality products and super fast delivery. The vegetables are always fresh and the prices are very reasonable."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Priya Sharma</h4>
                  <p className="text-sm text-gray-500">Mumbai</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "KR Stores has made grocery shopping so convenient. I love their wide variety of spices and the quality is top-notch."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Rajesh Kumar</h4>
                  <p className="text-sm text-gray-500">Delhi</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "Amazing service! Same-day delivery works perfectly and the customer support is very helpful. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                <div>
                  <h4 className="font-semibold">Anita Patel</h4>
                  <p className="text-sm text-gray-500">Bangalore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-red-100">
            Join thousands of satisfied customers and get fresh groceries delivered today!
          </p>
          <Link
            to="/products"
            className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Start Shopping Now
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;