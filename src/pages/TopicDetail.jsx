import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  Play, 
  CheckCircle, 
  Loader, 
  Clock, 
  User, 
  Calendar,
  FileText,
  ExternalLink,
  MessageSquare,
  Send,
  Reply,
  Trash2,
  Shield,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContexts';
import { db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  serverTimestamp,
  deleteDoc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';

const TopicDetail = () => {
  const { id } = useParams();
  const { user, isAdmin, isPremium, setUserPremium } = useAuth();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFull, setShowFull] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Payment states
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  // Comment states
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load Paystack script
  useEffect(() => {
    if (document.querySelector('#paystack-script')) return;
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Fetch topic
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        setError('');
        const docRef = doc(db, "topics", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTopic({ 
            id: docSnap.id, 
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt || null
          });
        } else {
          setTopic(null);
          setError('Topic not found');
        }
      } catch (err) {
        console.error("Error fetching topic:", err);
        setError('Failed to load topic. Please try again.');
        setTopic(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTopic();
  }, [id]);

  // Check if user has purchased this topic
  useEffect(() => {
    if (!user || !topic) return;

    const checkPurchase = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const purchasedTopics = data.purchasedTopics || [];
          setHasPurchased(purchasedTopics.includes(topic.id));
        }
      } catch (err) {
        console.error("Error checking purchase:", err);
      }
    };

    checkPurchase();
  }, [user, topic]);

  // Fetch comments for this topic
  useEffect(() => {
    if (!topic) return;

    const fetchComments = async () => {
      try {
        const q = query(
          collection(db, "comments"),
          where("topicId", "==", id),
          orderBy("createdAt", "asc")
        );
        const querySnapshot = await getDocs(q);
        const commentsData = [];
        querySnapshot.forEach((doc) => {
          commentsData.push({ id: doc.id, ...doc.data() });
        });
        setComments(commentsData);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchComments();
  }, [id, topic]);

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) {
      alert('Please login to comment');
      return;
    }

    setSubmitting(true);
    try {
      const commentData = {
        topicId: id,
        parentCommentId: null,
        userId: user.uid,
        userName: user.displayName || 'User',
        userEmail: user.email,
        text: commentText.trim(),
        isAdmin: isAdmin,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "comments"), commentData);
      setComments([...comments, { id: docRef.id, ...commentData, createdAt: new Date() }]);
      setCommentText('');
    } catch (err) {
      console.error("Error adding comment:", err);
      alert('Failed to add comment. Please try again.');
    }
    setSubmitting(false);
  };

  // Add reply
  const handleAddReply = async (parentId) => {
    if (!replyText.trim()) return;
    if (!user) {
      alert('Please login to reply');
      return;
    }

    setSubmitting(true);
    try {
      const replyData = {
        topicId: id,
        parentCommentId: parentId,
        userId: user.uid,
        userName: user.displayName || 'User',
        userEmail: user.email,
        text: replyText.trim(),
        isAdmin: isAdmin,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "comments"), replyData);
      setComments([...comments, { id: docRef.id, ...replyData, createdAt: new Date() }]);
      setReplyText('');
      setReplyToId(null);
    } catch (err) {
      console.error("Error adding reply:", err);
      alert('Failed to add reply. Please try again.');
    }
    setSubmitting(false);
  };

  // Delete comment (admin only)
  const deleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteDoc(doc(db, "comments", commentId));
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert('Failed to delete comment.');
    }
  };

  // --- PAYMENT FUNCTIONS ---

  // Handle payment for this topic
  const handleUnlock = async () => {
    if (!user) {
      alert('Please sign up or login to unlock this content');
      return;
    }

    if (isPremium || hasPurchased) {
      alert('You already have access to this content! 🎉');
      setShowFull(true);
      return;
    }

    setProcessingPayment(true);
    setPaymentError('');
    setPaymentSuccess(false);

    try {
      if (!window.PaystackPop) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.async = true;
          script.onload = resolve;
          document.body.appendChild(script);
        });
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
        amount: 5000 * 100,
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
        callback: function(response) {
          console.log('Payment success:', response);
          handlePaymentSuccess(response);
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
  const handlePaymentSuccess = async (response) => {
    try {
      setPaymentSuccess(true);
      
      // Update user's premium status
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        isPremium: true,
        premiumSince: new Date().toISOString(),
        premiumExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastPaymentRef: response.reference,
        purchasedTopics: arrayUnion(topic.id)
      });
      
      // Update local state
      if (setUserPremium) {
        await setUserPremium(true);
      }
      setHasPurchased(true);
      setShowFull(true);
      
      setProcessingPayment(false);
      alert(`🎉 Payment successful! You now have access to "${topic.title}"!`);
      
    } catch (err) {
      console.error("Error updating premium status:", err);
      setPaymentError('Payment successful but failed to update. Please contact support.');
      setProcessingPayment(false);
    }
  };

  // Helper: Check if video is external
  const isExternalLink = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || 
           url.includes('youtu.be') || 
           url.includes('vimeo.com') ||
           url.includes('dailymotion.com') ||
           url.includes('facebook.com') ||
           url.includes('instagram.com');
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('/')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    if (url.includes('/embed/') || url.includes('player.')) {
      return url;
    }
    return url;
  };

  // Check if user can watch full video
  const canWatchFull = !topic?.isPremium || isPremium || hasPurchased;
  
  const videoUrl = (() => {
    if (!topic) return '';
    const source = showFull ? topic.fullVideo : topic.introVideo;
    if (!source) return '';
    if (isExternalLink(source)) return getEmbedUrl(source);
    return source;
  })();

  const handleVideoLoad = () => setIsVideoLoading(false);
  const handleVideoError = () => setIsVideoLoading(false);

  const formatDate = (date) => {
    if (!date) return 'Date not available';
    try {
      return new Date(date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Date not available';
    }
  };

  // Build comment tree
  const topLevelComments = comments.filter(c => !c.parentCommentId);
  const repliesMap = {};
  comments.forEach(c => {
    if (c.parentCommentId) {
      if (!repliesMap[c.parentCommentId]) repliesMap[c.parentCommentId] = [];
      repliesMap[c.parentCommentId].push(c);
    }
  });
  Object.keys(repliesMap).forEach(key => {
    repliesMap[key].sort((a, b) => (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0));
  });
  topLevelComments.sort((a, b) => (a.createdAt?.toDate?.() || 0) - (b.createdAt?.toDate?.() || 0));

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading lesson...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl text-white mb-2">Topic Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The lesson you\'re looking for doesn\'t exist.'}</p>
          <Link to="/learn" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition">
            <ArrowLeft className="w-5 h-5" /> Back to Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <Link to="/learn" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" /> Back to Learning Hub
        </Link>

        {/* Main Content */}
        <div className="bg-[#131b2e] rounded-2xl overflow-hidden border border-white/10 mb-8">
          {/* Video Player */}
          <div className="relative bg-[#0a0f1e]">
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1e] z-10">
                <Loader className="w-12 h-12 text-blue-400 animate-spin" />
              </div>
            )}
            <div className="aspect-video w-full">
              {videoUrl ? (
                isExternalLink(videoUrl) || videoUrl.includes('/embed/') ? (
                  <iframe
                    src={videoUrl}
                    title={topic.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={handleVideoLoad}
                    onError={handleVideoError}
                  />
                ) : (
                  <video
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    poster={topic.thumbnail}
                    onLoadedData={handleVideoLoad}
                    onError={handleVideoError}
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-[#0a0f1e]">
                  <Play className="w-16 h-16 text-gray-600 mb-3" />
                  <p className="text-gray-500">No video available for this lesson</p>
                </div>
              )}
            </div>
            
            {/* Status Badges */}
            {topic.isPremium && (
              <div className="absolute top-4 right-4 bg-purple-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Premium
              </div>
            )}
            {isPremium || hasPurchased ? (
              <div className="absolute top-4 left-4 bg-green-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Unlocked
              </div>
            ) : topic.isPremium && (
              <div className="absolute top-4 left-4 bg-amber-500/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> NGN 5,000
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">{topic.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400 mb-6">
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                topic.category === 'Solar' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                {topic.category === 'Solar' ? '☀️ Solar' : '⚡ Electrical'}
              </span>
              <span className="flex items-center gap-1.5 bg-[#0a0f1e] px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" /> {topic.duration || '10:00'}
              </span>
              {topic.createdAt && (
                <span className="flex items-center gap-1.5 bg-[#0a0f1e] px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" /> {formatDate(topic.createdAt)}
                </span>
              )}
            </div>

            {topic.description && (
              <div className="mb-6">
                <p className="text-gray-300 leading-relaxed">{topic.description}</p>
              </div>
            )}

            {topic.writeUp && (
              <div className="mb-6 bg-[#0a0f1e] rounded-xl p-4 md:p-6 border border-white/5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Lesson Notes
                </h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {topic.writeUp}
                </div>
              </div>
            )}

            {/* Payment Error */}
            {paymentError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                <span>⚠️ {paymentError}</span>
                <button onClick={() => setPaymentError('')} className="text-sm text-red-400 hover:text-red-300">Dismiss</button>
              </div>
            )}

            {/* Premium Lock Message */}
            {topic.isPremium && !canWatchFull && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Premium Content Locked</h3>
                    <p className="text-gray-400 text-sm">
                      Pay <span className="text-purple-400 font-bold">NGN 5,000</span> to unlock this lesson and get full access to the video and all premium content.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button 
                        onClick={handleUnlock} 
                        disabled={processingPayment}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingPayment ? (
                          <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
                        ) : (
                          <><Crown className="w-5 h-5" /> Buy Now - NGN 5,000</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {topic.isPremium && canWatchFull && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-400 font-semibold">✅ Premium Access Granted</span>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {topic.introVideo && !showFull && (
                <button
                  onClick={() => {
                    if (topic.isPremium && !canWatchFull) {
                      handleUnlock();
                    } else {
                      setShowFull(true);
                    }
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  {topic.isPremium ? (canWatchFull ? <Play className="w-5 h-5" /> : <Lock className="w-5 h-5" />) : <Play className="w-5 h-5" />}
                  {topic.isPremium ? (canWatchFull ? 'Watch Full Lesson' : 'Unlock Full Lesson') : 'Watch Full Lesson'}
                </button>
              )}
              {showFull && (
                <button onClick={() => setShowFull(false)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-lg font-semibold transition flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5" /> Watch Intro (Free)
                </button>
              )}
              <Link to="/learn" className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-lg font-semibold transition">
                Browse More Topics
              </Link>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-[#131b2e] rounded-2xl border border-white/10 p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-400" /> Comments ({topLevelComments.length})
          </h2>

          {/* Add Comment */}
          {user ? (
            <form onSubmit={handleAddComment} className="mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Post
                </button>
              </div>
            </form>
          ) : (
            <p className="text-gray-400 mb-6">Please <Link to="/login" className="text-blue-400 hover:underline">login</Link> to comment.</p>
          )}

          {/* Comments List */}
          {topLevelComments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>
          ) : (
            <div className="space-y-6">
              {topLevelComments.map((comment) => (
                <div key={comment.id} className="border-b border-white/5 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">{comment.userName || 'User'}</span>
                        {comment.isAdmin && (
                          <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {comment.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                        </span>
                      </div>
                      <p className="text-gray-300 mt-1">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {user && (
                          <button
                            onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                            className="text-xs text-gray-400 hover:text-blue-400 transition flex items-center gap-1"
                          >
                            <Reply className="w-3 h-3" /> Reply
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}
                      </div>

                      {/* Reply Form */}
                      {replyToId === comment.id && (
                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 text-sm"
                          />
                          <button
                            onClick={() => handleAddReply(comment.id)}
                            disabled={!replyText.trim() || submitting}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg font-medium transition disabled:opacity-50 text-sm flex items-center gap-1"
                          >
                            {submitting ? <Loader className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Reply
                          </button>
                        </div>
                      )}

                      {/* Replies */}
                      {repliesMap[comment.id] && repliesMap[comment.id].length > 0 && (
                        <div className="ml-8 mt-4 space-y-3 border-l-2 border-white/10 pl-4">
                          {repliesMap[comment.id].map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                <User className="w-3 h-3 text-purple-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-semibold text-white text-sm">{reply.userName || 'User'}</span>
                                  {reply.isAdmin && (
                                    <span className="flex items-center gap-1 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                                      <Shield className="w-3 h-3" /> Admin
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {reply.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm mt-1">{reply.text}</p>
                                {isAdmin && (
                                  <button onClick={() => deleteComment(reply.id)} className="text-xs text-red-400 hover:text-red-300 transition mt-1 flex items-center gap-1">
                                    <Trash2 className="w-3 h-3" /> Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicDetail;