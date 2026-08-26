import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  MessageSquare, 
  Reply, 
  Clock, 
  User, 
  CheckCircle, 
  Loader,
  AlertCircle,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContexts';
import { db } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc 
} from 'firebase/firestore';

const MyMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError('');

        // Get messages where userId matches current user
        const q = query(
          collection(db, "messages"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const messagesData = [];
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() });
        });
        setMessages(messagesData);

        // Mark any messages with adminReply and userReadReply == false as read
        const unreadReplies = messagesData.filter(m => m.adminReply && m.userReadReply === false);
        if (unreadReplies.length > 0) {
          // Update each message to set userReadReply = true
          await Promise.all(
            unreadReplies.map(async (msg) => {
              await updateDoc(doc(db, "messages", msg.id), {
                userReadReply: true
              });
            })
          );
          // Refresh to reflect updates
          const updatedMessages = messagesData.map(msg => 
            unreadReplies.some(m => m.id === msg.id) 
              ? { ...msg, userReadReply: true } 
              : msg
          );
          setMessages(updatedMessages);
        }

        setError('');
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError('Failed to load your messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date.toDate?.() || date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading your messages...</p>
      </div>
    );
  }

  // If not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl text-white mb-2">Login Required</h2>
          <p className="text-gray-400 mb-6">Please login to view your messages.</p>
          <Link to="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition inline-block">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-400" /> My Messages
            </h1>
            <p className="text-gray-400 mt-1">
              {messages.length} messages {messages.filter(m => m.adminReply && !m.userReadReply).length > 0 && 
                `· ${messages.filter(m => m.adminReply && !m.userReadReply).length} new replies`
              }
            </p>
          </div>
          <Link to="/contact" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> New Message
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={() => window.location.reload()} className="text-sm text-blue-400 hover:text-blue-300 transition">
              Retry
            </button>
          </div>
        )}

        {/* Messages List */}
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-[#131b2e] rounded-2xl border border-white/10">
            <Mail className="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">No messages sent yet</p>
            <p className="text-gray-500 text-sm">Send a message via the contact page</p>
            <Link to="/contact" className="inline-block mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition">
              Send First Message
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`bg-[#131b2e] rounded-2xl border p-6 transition ${
                  msg.adminReply && !msg.userReadReply 
                    ? 'border-blue-400/50 shadow-lg shadow-blue-500/10' 
                    : 'border-white/10'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="text-sm font-medium text-white">To: ElectroSolar Support</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {formatDate(msg.createdAt)}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        msg.status === 'unread' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {msg.status === 'unread' ? 'Unread' : 'Read'}
                      </span>
                      {msg.adminReply && !msg.userReadReply && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 flex items-center gap-1 animate-pulse">
                          <Reply className="w-3 h-3" /> New Reply
                        </span>
                      )}
                    </div>
                    
                    <div className="bg-[#0a0f1e] rounded-xl p-4 mb-3">
                      <p className="text-gray-300 leading-relaxed">{msg.message}</p>
                    </div>

                    {/* Admin Reply */}
                    {msg.adminReply && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                          <Reply className="w-4 h-4" /> Admin Reply
                        </div>
                        <p className="text-gray-300">{msg.adminReply}</p>
                        {msg.adminReplyAt && (
                          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(msg.adminReplyAt)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* No reply yet */}
                    {!msg.adminReply && (
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                        <Clock className="w-3 h-3" /> Awaiting admin response
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
  );
};

export default MyMessages;