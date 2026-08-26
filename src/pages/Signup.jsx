import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContexts';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const SignUp = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signup(form.email, form.password, form.name);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-[#131b2e] rounded-2xl border border-white/10 p-8">
        <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
        <p className="text-gray-400 text-center mt-2">Join ElectroSolar Hub today</p>
        {error && <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg mt-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="john@example.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Confirm password"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50">
            {loading ? 'Creating...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-4 text-sm">
          Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;