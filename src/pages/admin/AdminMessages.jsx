import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  User, 
  Calendar, 
  MessageSquare, 
  Reply, 
  CheckCircle,
  Clock,
  Loader,
  Send,
  Phone,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContexts';
import { db } from '../../firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

const AdminMessages = () => {
  const { isAdmin } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const messagesData = [];
        querySnapshot.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() });
        });
        setMessages(messagesData);
        setError('');
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError('Failed to load messages.');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchMessages();
  }, [isAdmin]);

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "messages", id), { status: 'read' });
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, status: 'read' } : msg
      ));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  // Send reply
  const handleReply = async (id) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await updateDoc(doc(db, "messages", id), {
        adminReply: replyText.trim(),
        adminReplyAt: serverTimestamp(),
        status: 'read'
      });
      setMessages(messages.map(msg => 
        msg.id === id ? { ...msg, adminReply: replyText.trim(), status: 'read' } : msg
      ));
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error("Error sending reply:", err);
      alert('Failed to send reply.');
    }
    setSending(false);
  };

  // Delete message
  const deleteMessage = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await deleteDoc(doc(db, "messages", id));
      setMessages(messages.filter(msg => msg.id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert('Failed to delete message.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-6">
        <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg text-center">
          <p className="font-semibold">⚠️ {error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Mail className="w-8 h-8 text-blue-400" /> Messages
            </h1>
            <p className="text-gray-400 mt-1">
              {messages.length} messages {messages.filter(m => m.status === 'unread').length > 0 && 
                `· ${messages.filter(m => m.status === 'unread').length} unread`
              }
            </p>
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-16 bg-[#131b2e] rounded-2xl border border-white/10">
            <Mail className="w-16 h-16 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg">No messages yet</p>
            <p className="text-gray-500 text-sm">Messages from users will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`bg-[#131b2e] rounded-2xl border p-6 transition ${
                msg.status === 'unread' 
                  ? 'border-blue-400/50 shadow-lg shadow-blue-500/10' 
                  : 'border-white/10'
              }`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-white">{msg.name || 'Anonymous'}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" /> {msg.email || 'No email'}
                      </span>
                      {msg.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {msg.phone}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> 
                        {msg.createdAt?.toDate?.()?.toLocaleString() || 'Recently'}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        msg.status === 'unread' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {msg.status === 'unread' ? 'Unread' : 'Read'}
                      </span>
                    </div>
                    <p className="text-gray-300 mt-2 leading-relaxed">{msg.message}</p>
                    
                    {/* Admin Reply */}
                    {msg.adminReply && (
                      <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                          <Reply className="w-4 h-4" /> Admin Reply
                        </div>
                        <p className="text-gray-300">{msg.adminReply}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    {msg.status === 'unread' && (
                      <button 
                        onClick={() => markAsRead(msg.id)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                        title="Mark as read"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => setReplyingTo(replyingTo === msg.id ? null : msg.id)}
                      className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition"
                      title="Reply"
                    >
                      <Reply className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === msg.id && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="flex-1 px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                      />
                      <button
                        onClick={() => handleReply(msg.id)}
                        disabled={!replyText.trim() || sending}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;