import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#0a0f1e] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Zap className="w-8 h-8 text-blue-400" />
              <span className="text-xl font-bold text-white">Electro<span className="text-blue-400">Solar</span></span>
            </Link>
            <p className="text-gray-400 text-sm">Your premier destination for solar and electrical engineering solutions.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/solar" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Solar Projects</Link></li>
              <li><Link to="/electrical" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Electrical Work</Link></li>
              <li><Link to="/learn" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">Learning Hub</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors text-sm">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-gray-400 text-sm"><Mail className="w-4 h-4" /> info@electrosolar.com</li>
              <li className="flex items-center gap-2 text-gray-400 text-sm"><Phone className="w-4 h-4" /> +234 800 000 0000</li>
              <li className="flex items-center gap-2 text-gray-400 text-sm"><MapPin className="w-4 h-4" /> Port Harcourt, Nigeria</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-500/20 transition-colors">
                <FaFacebook className="w-5 h-5 text-gray-400 hover:text-blue-400" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-500/20 transition-colors">
                <FaTwitter className="w-5 h-5 text-gray-400 hover:text-blue-400" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-500/20 transition-colors">
                <FaInstagram className="w-5 h-5 text-gray-400 hover:text-blue-400" />
              </a>
              <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-blue-500/20 transition-colors">
                <FaYoutube className="w-5 h-5 text-gray-400 hover:text-blue-400" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-6 text-center text-gray-400 text-sm">&copy; 2026 ElectroSolar Hub. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;