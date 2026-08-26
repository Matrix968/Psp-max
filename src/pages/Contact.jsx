import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader, CheckCircle, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContexts';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Contact = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const messageData = {
        name: form.name,
        email: form.email,
        phone: form.phone || '',
        message: form.message,
        userId: user?.uid || null,
        userEmail: user?.email || null,
        status: 'unread',
        createdAt: serverTimestamp(),
        source: 'contact_form',
      };

      await addDoc(collection(db, "messages"), messageData);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error("Error sending message:", err);
      setError('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Have a project in mind? Get a free quote or send us a message. 
            We'll get back to you within 24 hours.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Form */}
          <div className="md:col-span-2 bg-[#131b2e] rounded-2xl p-6 md:p-8 border border-white/10">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">Message Sent! 🎉</h3>
                <p className="text-gray-400 mt-2">Thank you for reaching out. We'll get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)} 
                  className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition transform hover:scale-105"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                        placeholder="John Doe"
                        disabled={!!user?.displayName}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                        placeholder="john@example.com"
                        disabled={!!user?.email}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Message *</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <textarea
                      required
                      rows="5"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition resize-none"
                      placeholder="Tell us about your project, requirements, or any questions..."
                    />
                  </div>
                </div>

                {user && (
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span>You are logged in as <span className="text-white">{user.email}</span></span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 w-full shadow-lg shadow-blue-500/20"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="bg-[#131b2e] rounded-2xl p-6 md:p-8 border border-white/10 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" /> Get in Touch
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 bg-[#0a0f1e] rounded-xl border border-white/5 hover:border-white/10 transition group">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-white font-medium">info@electrosolar.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 bg-[#0a0f1e] rounded-xl border border-white/5 hover:border-white/10 transition group">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-white font-medium">+234 800 000 0000</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 bg-[#0a0f1e] rounded-xl border border-white/5 hover:border-white/10 transition group">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-white font-medium">Lagos, Nigeria</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                We typically respond within 24 hours
              </p>
            </div>

            {/* Quick Stats */}
            <div className="pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0a0f1e] rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Response Time</p>
                  <p className="text-white font-bold">~24 hrs</p>
                </div>
                <div className="bg-[#0a0f1e] rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Support</p>
                  <p className="text-white font-bold">100%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;