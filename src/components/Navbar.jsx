import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Zap, 
  Mail,
  Users,
  MessageSquare,
  Home,
  Sun,
  BookOpen,
  Info,
  Phone,
  LayoutDashboard
} from 'lucide-react';

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsOpen(false);
    setDropdownOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Solar', path: '/solar', icon: Sun },
    { name: 'Electrical', path: '/electrical', icon: Zap },
    { name: 'Learn', path: '/learn', icon: BookOpen },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ];

  return (
    <nav className="bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
            <Zap className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">
              Psp<span className="text-blue-400">Max</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium flex items-center gap-1.5"
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}

            {/* Admin Links (Desktop) */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200 text-sm font-medium flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link
                  to="/admin/messages"
                  className="text-purple-400 hover:text-purple-300 transition-colors duration-200 text-sm font-medium flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> Messages
                </Link>
                <Link
                  to="/admin/users"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors duration-200 text-sm font-medium flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" /> Users
                </Link>
              </>
            )}

            {/* Auth Buttons (Desktop) */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  <User className="w-5 h-5 text-white" />
                  <span className="text-white text-sm max-w-[100px] truncate">
                    {user.displayName || user.email}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#131b2e] border border-white/10 rounded-lg shadow-xl py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                      to="/my-messages"
                      className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-200"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Mail className="w-4 h-4" /> My Messages
                    </Link>
                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-blue-400 hover:bg-white/5 transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                          to="/admin/messages"
                          className="flex items-center gap-2 px-4 py-2 text-purple-400 hover:bg-white/5 transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <MessageSquare className="w-4 h-4" /> Messages
                        </Link>
                        <Link
                          to="/admin/users"
                          className="flex items-center gap-2 px-4 py-2 text-emerald-400 hover:bg-white/5 transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Users className="w-4 h-4" /> Users
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-red-400 hover:bg-white/5 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                onClick={() => setIsOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}

            {/* Admin Links (Mobile) */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-blue-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </Link>
                <Link
                  to="/admin/messages"
                  className="flex items-center gap-2 px-3 py-2 text-purple-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <MessageSquare className="w-5 h-5" /> Messages
                </Link>
                <Link
                  to="/admin/users"
                  className="flex items-center gap-2 px-3 py-2 text-emerald-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Users className="w-5 h-5" /> Users
                </Link>
              </>
            )}

            {/* Auth (Mobile) */}
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" /> Profile
                </Link>
                <Link
                  to="/my-messages"
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Mail className="w-5 h-5" /> My Messages
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-red-400 hover:bg-white/5 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-600 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;