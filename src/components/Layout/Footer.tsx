import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-red-600 text-white p-2 rounded-lg">
                <span className="text-lg font-bold">KR</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">KR Stores</h3>
                <p className="text-sm text-gray-400">Online Grocery & Essentials</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted partner for fresh groceries and daily essentials. 
              Quality products delivered to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-400 hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=vegetables" className="text-gray-400 hover:text-white">
                  Vegetables
                </Link>
              </li>
              <li>
                <Link to="/products?category=fruits" className="text-gray-400 hover:text-white">
                  Fruits
                </Link>
              </li>
              <li>
                <Link to="/products?category=spices" className="text-gray-400 hover:text-white">
                  Spices
                </Link>
              </li>
              <li>
                <Link to="/products?category=groceries" className="text-gray-400 hover:text-white">
                  Groceries
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <a href="tel:+919876543210" className="text-gray-400 hover:text-white">
                    +91 98765 43210
                  </a>
                  <p className="text-sm text-gray-500">Mon-Sun 8AM-10PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <a href="mailto:support@krstores.com" className="text-gray-400 hover:text-white">
                    support@krstores.com
                  </a>
                  <p className="text-sm text-gray-500">24/7 Support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <p className="text-gray-400">
                    123 Market Street<br />
                    Mumbai, Maharashtra 400001
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-red-500 mt-1" />
                <div>
                  <p className="text-gray-400">
                    Delivery Hours<br />
                    <span className="text-sm text-gray-500">8:00 AM - 10:00 PM</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 KR Stores. All rights reserved. | Made with ❤️ for fresh groceries
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;