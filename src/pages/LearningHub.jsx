import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Lock, Play, BookOpen, Loader, Crown, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContexts';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';

const LearningHub = () => {
  const { user, isPremium, setUserPremium } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Payment states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load Paystack script ONCE
  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('#paystack-script')) return;
    
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => console.log('Paystack script loaded');
    script.onerror = () => console.error('Failed to load Paystack script');
    document.body.appendChild(script);
  }, []);

  // Fetch topics
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "topics"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const topicsData = [];
        querySnapshot.forEach((doc) => {
          topicsData.push({ id: doc.id, ...doc.data() });
        });
        setTopics(topicsData);
        setError('');
      } catch (err) {
        console.error("Error fetching topics:", err);
        setError('Failed to load topics. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  // Handle payment for a specific topic
  const handleUnlock = async (topic) => {
    // Check if user is logged in
    if (!user) {
      alert('Please sign up or login to unlock premium content');
      return;
    }

    // Check if user already has premium
    if (isPremium) {
      alert('You already have premium access! 🎉');
      return;
    }

    setProcessingPayment(true);
    setPaymentError('');
    setPaymentSuccess(false);

    try {
      // Check if Paystack is available
      if (!window.PaystackPop) {
        // Try loading the script again
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
        // Wait a moment for it to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!window.PaystackPop) {
        throw new Error('Payment system not available. Please refresh and try again.');
      }

      const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error('Payment system not configured. Please contact support.');
      }

      const paystack = window.PaystackPop;
      const reference = `topic-${topic.id}-${user.uid}-${Date.now()}`;

      const handler = paystack.setup({
        key: publicKey,
        email: user.email,
        amount: 5000 * 100, // NGN 5,000 in kobo
        currency: 'NGN',
        ref: reference,
        metadata: {
          custom_fields: [
            {
              display_name: "User ID",
              variable_name: "user_id",
              value: user.uid
            },
            {
              display_name: "User Email",
              variable_name: "user_email",
              value: user.email
            },
            {
              display_name: "Topic",
              variable_name: "topic",
              value: topic.title
            },
            {
              display_name: "Topic ID",
              variable_name: "topic_id",
              value: topic.id
            }
          ]
        },
        label: `Unlock "${topic.title}" - NGN 5,000`,
        // IMPORTANT: Synchronous callback
        callback: function(response) {
          console.log('Payment success:', response);
          // Call async handler
          handlePaymentSuccess(response, topic);
        },
        onClose: function() {
          setProcessingPayment(false);
          setPaymentError('Payment cancelled. You can try again anytime.');
        },
      });

      handler.openIframe();
      
    } catch (err) {
      console.error("Payment error:", err);
      setPaymentError(err.message || 'Failed to initialize payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = async (response, topic) => {
    try {
      setPaymentSuccess(true);
      
      // Update user's premium status in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        isPremium: true,
        premiumSince: new Date().toISOString(),
        premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastPaymentRef: response.reference,
        purchasedTopics: [
          ...(user.purchasedTopics || []),
          topic.id
        ]
      });
      
      // Update local auth context
      if (setUserPremium) {
        await setUserPremium(true);
      }
      
      setProcessingPayment(false);
      
      // Show success message
      alert(`🎉 Payment successful! You now have premium access to "${topic.title}"!`);
      
      // Redirect to the unlocked topic
      window.location.href = `/learn/${topic.id}`;
      
    } catch (err) {
      console.error("Error updating premium status:", err);
      setPaymentError('Payment successful but failed to update premium status. Please contact support.');
      setProcessingPayment(false);
    }
  };

  // Filter topics
  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchesFilter = filter === 'all' || 
      (filter === 'solar' && topic.category === 'Solar') ||
      (filter === 'electrical' && topic.category === 'Electrical') ||
      (filter === 'free' && !topic.isPremium) ||
      (filter === 'premium' && topic.isPremium);
    return matchesSearch && matchesFilter;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading lessons...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-6">
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg max-w-md text-center">
          <p className="font-semibold">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Learning Hub</h1>
          </div>
          {user && (
            <div className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              isPremium ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-gray-500/20 text-gray-300'
            }`}>
              {isPremium ? (
                <>
                  <Crown className="w-5 h-5 text-purple-400" /> Premium Active
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-gray-400" /> Free User
                </>
              )}
            </div>
          )}
        </div>
        <p className="text-gray-400 mb-8">
          Master solar and electrical engineering with our curated video lessons (10 min each)
          <span className="text-blue-400 ml-2">({topics.length} topics)</span>
        </p>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#131b2e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-[#131b2e] text-gray-300 hover:bg-white/5'}`}>All</button>
            <button onClick={() => setFilter('solar')} className={`px-4 py-2 rounded-lg transition ${filter === 'solar' ? 'bg-amber-500 text-white' : 'bg-[#131b2e] text-gray-300 hover:bg-white/5'}`}>☀️ Solar</button>
            <button onClick={() => setFilter('electrical')} className={`px-4 py-2 rounded-lg transition ${filter === 'electrical' ? 'bg-blue-500 text-white' : 'bg-[#131b2e] text-gray-300 hover:bg-white/5'}`}>⚡ Electrical</button>
            <button onClick={() => setFilter('free')} className={`px-4 py-2 rounded-lg transition ${filter === 'free' ? 'bg-green-500 text-white' : 'bg-[#131b2e] text-gray-300 hover:bg-white/5'}`}>🔓 Free</button>
            <button onClick={() => setFilter('premium')} className={`px-4 py-2 rounded-lg transition ${filter === 'premium' ? 'bg-purple-500 text-white' : 'bg-[#131b2e] text-gray-300 hover:bg-white/5'}`}>🔒 Premium</button>
          </div>
        </div>

        {/* Payment Error */}
        {paymentError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
            <span>⚠️ {paymentError}</span>
            <button onClick={() => setPaymentError('')} className="text-sm text-red-400 hover:text-red-300">Dismiss</button>
          </div>
        )}

        {/* Payment Processing */}
        {processingPayment && (
          <div className="bg-blue-500/10 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-lg mb-4 flex items-center gap-3">
            <Loader className="w-5 h-5 animate-spin" />
            <span>Opening payment gateway... Please complete the payment in the popup.</span>
          </div>
        )}

        {/* Payment Success */}
        {paymentSuccess && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span>Payment successful! 🎉 Redirecting to your lesson...</span>
          </div>
        )}

        {/* Topics Grid */}
        {filteredTopics.length === 0 ? (
          <div className="text-center py-16 bg-[#131b2e] rounded-2xl border border-white/10">
            {topics.length === 0 ? (
              <>
                <p className="text-gray-400 text-lg mb-2">No topics available yet</p>
                <p className="text-gray-500 text-sm">Check back later for new lessons</p>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-lg">No topics match your filters</p>
                <button 
                  onClick={() => { setSearch(''); setFilter('all'); }}
                  className="mt-4 text-blue-400 hover:text-blue-300 transition"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => (
              <div key={topic.id} className="bg-[#131b2e] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10 group">
                {/* Thumbnail */}
                <div className="relative h-48 bg-[#0a0f1e] overflow-hidden">
                  <img 
                    src={topic.thumbnail || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80'} 
                    alt={topic.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80';
                    }}
                  />
                  {/* Category Badge */}
                  <div className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm ${
                    topic.category === 'Solar' 
                      ? 'bg-amber-500/80 text-white' 
                      : 'bg-blue-500/80 text-white'
                  }`}>
                    {topic.category === 'Solar' ? '☀️ Solar' : '⚡ Electrical'}
                  </div>
                  {/* Premium Badge */}
                  {topic.isPremium && (
                    <div className="absolute top-3 right-3 bg-purple-500/80 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Premium
                    </div>
                  )}
                  {/* Price Badge */}
                  {topic.isPremium && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                      NGN 5,000
                    </div>
                  )}
                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                    {topic.duration || '10:00'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition line-clamp-1">
                    {topic.title || 'Untitled Topic'}
                  </h3>
                  {topic.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    {topic.isPremium ? (
                      <>
                        <span className="text-xs text-purple-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> NGN 5,000
                        </span>
                        {user && isPremium ? (
                          <Link to={`/learn/${topic.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                            Watch Full <span className="group-hover:translate-x-1 transition">→</span>
                          </Link>
                        ) : (
                          <button 
                            onClick={() => handleUnlock(topic)} 
                            disabled={processingPayment}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            {processingPayment ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : (
                              <>Buy Now <span className="group-hover:translate-x-1 transition">→</span></>
                            )}
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <Play className="w-3 h-3" /> Free
                        </span>
                        <Link to={`/learn/${topic.id}`} className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                          Watch <span className="group-hover:translate-x-1 transition">→</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {filteredTopics.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredTopics.length} of {topics.length} topics
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningHub;