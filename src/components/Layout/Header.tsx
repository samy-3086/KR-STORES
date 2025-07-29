import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Phone, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      {/* Top bar with contact info */}
      <div className="bg-red-600 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <a href="tel:+919876543210" className="flex items-center hover:text-red-200">
              <Phone className="w-4 h-4 mr-1" />
              +91 98765 43210
            </a>
            <a href="mailto:support@krstores.com" className="flex items-center hover:text-red-200">
              <Mail className="w-4 h-4 mr-1" />
              support@krstores.com
            </a>
          </div>
          <div className="hidden md:block">
            Free delivery on orders above ₹500
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-red-600 text-white p-2 rounded-lg">
              <span className="text-xl font-bold">KR</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">KR Stores</h1>
              <p className="text-xs text-gray-600">Online Grocery & Essentials</p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 bg-red-600 text-white rounded-r-lg hover:bg-red-700"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative">
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="hidden md:block text-sm text-gray-700">
                    Hello, {user.name}
                  </span>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="hidden md:block bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/auth" className="flex items-center space-x-1 hover:bg-gray-100 p-2 rounded-lg">
                  <User className="w-6 h-6 text-gray-700" />
                  <span className="hidden md:block text-sm text-gray-700">Login</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="md:hidden mt-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 text-gray-500 hover:text-red-600"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
            <ul className="flex flex-col md:flex-row md:space-x-8 py-4">
              <li>
                <Link
                  to="/"
                  className="block py-2 text-gray-700 hover:text-red-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=vegetables"
                  className="block py-2 text-gray-700 hover:text-red-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🥦 Vegetables
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=fruits"
                  className="block py-2 text-gray-700 hover:text-red-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🍎 Fruits
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=spices"
                  className="block py-2 text-gray-700 hover:text-red-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🌶️ Spices
                </Link>
              </li>
              <li>
                <Link
                  to="/products?category=groceries"
                  className="block py-2 text-gray-700 hover:text-red-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  🍚 Groceries
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="block py-2 text-gray-700 hover:text-red-600 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;