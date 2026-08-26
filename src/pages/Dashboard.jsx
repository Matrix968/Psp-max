import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  BookOpen, 
  Image, 
  Users, 
  MessageSquare, 
  Loader,
  Clock,
  Zap,
  ChevronRight,
  Mail,
  Phone,
  Sun,
  Crown,
  MessageCircle,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Video,
  FolderOpen
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContexts';
import { db } from '../../firebase/config';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc,
  deleteDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    topics: 0,
    projects: 0,
    users: 0,
    messages: 0,
    comments: 0,
    solarProjects: 0,
    electricalProjects: 0,
    premiumUsers: 0,
  });
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  
  // CRUD states
  const [allTopics, setAllTopics] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Edit modal states
  const [editingItem, setEditingItem] = useState(null);
  const [editType, setEditType] = useState(''); // 'topic' or 'project'
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // View all toggle
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch all collections in parallel
        const [
          topicsSnap,
          projectsSnap,
          usersSnap,
          solarProjectsSnap,
          electricalProjectsSnap,
          premiumUsersSnap,
        ] = await Promise.all([
          getDocs(collection(db, "topics")),
          getDocs(collection(db, "projects")),
          getDocs(collection(db, "users")),
          getDocs(query(collection(db, "projects"), where("category", "==", "Solar"))),
          getDocs(query(collection(db, "projects"), where("category", "==", "Electrical"))),
          getDocs(query(collection(db, "users"), where("isPremium", "==", true))),
        ]);

        // Fetch all topics for CRUD
        const topicsData = [];
        topicsSnap.forEach((doc) => {
          topicsData.push({ id: doc.id, ...doc.data() });
        });
        topicsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        // Fetch all projects for CRUD
        const projectsData = [];
        projectsSnap.forEach((doc) => {
          projectsData.push({ id: doc.id, ...doc.data() });
        });
        projectsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });

        // Fetch messages
        const messagesAllSnap = await getDocs(collection(db, "messages"));
        const messagesData = [];
        messagesAllSnap.forEach((doc) => {
          messagesData.push({ id: doc.id, ...doc.data() });
        });
        messagesData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        const unreadMessages = messagesData.filter(m => m.status === 'unread');
        const recentMessagesData = messagesData.slice(0, 5);

        // Fetch comments
        const commentsSnap = await getDocs(collection(db, "comments"));
        const commentsData = [];
        commentsSnap.forEach((doc) => {
          commentsData.push({ id: doc.id, ...doc.data() });
        });
        commentsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB - dateA;
        });
        const recentCommentsData = commentsData.slice(0, 5);

        setAllTopics(topicsData);
        setAllProjects(projectsData);
        setStats({
          topics: topicsSnap.size,
          projects: projectsSnap.size,
          users: usersSnap.size,
          messages: unreadMessages.length,
          comments: commentsSnap.size,
          solarProjects: solarProjectsSnap.size,
          electricalProjects: electricalProjectsSnap.size,
          premiumUsers: premiumUsersSnap.size,
        });
        setRecentMessages(recentMessagesData);
        setRecentComments(recentCommentsData);
        setLastUpdated(new Date().toLocaleString());
        setError('');
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchDashboardData();
  }, [isAdmin]);

  // --- CRUD Functions ---

  // Delete topic
  const handleDeleteTopic = async (id) => {
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, "topics", id));
      setAllTopics(allTopics.filter(t => t.id !== id));
      setStats(prev => ({ ...prev, topics: prev.topics - 1 }));
      alert('✅ Topic deleted successfully!');
    } catch (err) {
      console.error("Error deleting topic:", err);
      alert('Failed to delete topic.');
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, "projects", id));
      setAllProjects(allProjects.filter(p => p.id !== id));
      setStats(prev => ({ ...prev, projects: prev.projects - 1 }));
      alert('✅ Project deleted successfully!');
    } catch (err) {
      console.error("Error deleting project:", err);
      alert('Failed to delete project.');
    }
  };

  // Open edit modal
  const handleEdit = (item, type) => {
    setEditType(type);
    setEditingItem(item);
    setEditForm(item);
    setShowEditModal(true);
  };

  // Save edit
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const collectionName = editType === 'topic' ? 'topics' : 'projects';
      const docRef = doc(db, collectionName, editingItem.id);
      await updateDoc(docRef, {
        ...editForm,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      if (editType === 'topic') {
        setAllTopics(allTopics.map(t => 
          t.id === editingItem.id ? { ...t, ...editForm } : t
        ));
      } else {
        setAllProjects(allProjects.map(p => 
          p.id === editingItem.id ? { ...p, ...editForm } : p
        ));
      }

      setShowEditModal(false);
      setEditingItem(null);
      setEditForm({});
      alert('✅ Updated successfully!');
    } catch (err) {
      console.error("Error updating:", err);
      alert('Failed to update.');
    }
    setSaving(false);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date.toDate?.() || date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Truncate text
  const truncate = (text, max = 50) => {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '...' : text;
  };

  // Get first image
  const getFirstImage = (item) => {
    if (item.images && item.images.length > 0) return item.images[0];
    return item.thumbnail || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&q=80';
  };

  // --- Loading, Error, Auth Checks ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center px-6">
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-lg">⚠️ {error}</p>
          <p className="text-sm text-gray-400 mt-2">This could be a permissions issue. Make sure you're an admin.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition transform hover:scale-105"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-6">You do not have permission to view this page.</p>
          <Link to="/" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition inline-block">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-[#0a0f1e] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <span className="text-sm font-normal text-gray-400 bg-[#131b2e] px-3 py-1 rounded-full border border-white/5">
                v3.0
              </span>
            </div>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span>Manage your content and monitor your platform</span>
              <span className="text-xs text-gray-500">• Updated: {lastUpdated}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/admin/topics/new" 
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium transition transform hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-5 h-5" /> Add Topic
            </Link>
            <Link 
              to="/admin/projects/new" 
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-lg font-medium transition transform hover:scale-105 shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-5 h-5" /> Add Project
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-[#131b2e] rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.topics}</span>
            </div>
            <div className="text-sm font-medium text-white">Total Topics</div>
            <div className="text-xs text-gray-400">{stats.topics} lessons</div>
          </div>
          <div className="bg-[#131b2e] rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                <Image className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.projects}</span>
            </div>
            <div className="text-sm font-medium text-white">Total Projects</div>
            <div className="text-xs text-gray-400">{stats.solarProjects} Solar · {stats.electricalProjects} Electrical</div>
          </div>
          <div className="bg-[#131b2e] rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.users}</span>
            </div>
            <div className="text-sm font-medium text-white">Total Users</div>
            <div className="text-xs text-gray-400">{stats.premiumUsers} premium subscribers</div>
          </div>
          <div className="bg-[#131b2e] rounded-2xl p-6 border border-white/10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">{stats.messages}</span>
            </div>
            <div className="text-sm font-medium text-white">Messages</div>
            <div className="text-xs text-gray-400">{stats.messages} unread · {stats.comments} comments</div>
          </div>
        </div>

        {/* === TOPICS MANAGEMENT === */}
        <div className="bg-[#131b2e] rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6 text-blue-400" />
              <h2 className="text-xl font-bold text-white">Topics / Videos</h2>
              <span className="text-xs text-gray-500 bg-[#0a0f1e] px-2 py-1 rounded-full">{allTopics.length}</span>
            </div>
            <button 
              onClick={() => setShowAllTopics(!showAllTopics)}
              className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
            >
              {showAllTopics ? 'Show Less' : 'View All'} <ChevronRight className={`w-4 h-4 transition ${showAllTopics ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0f1e] border-b border-white/5">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Premium</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(showAllTopics ? allTopics : allTopics.slice(0, 5)).map((topic) => (
                  <tr key={topic.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={topic.thumbnail || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=50&q=80'} 
                          alt={topic.title}
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=50&q=80'}
                        />
                        <span className="text-sm text-white truncate max-w-[150px]">{topic.title || 'Untitled'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        topic.category === 'Solar' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {topic.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        topic.isPremium ? 'bg-purple-500/20 text-purple-300' : 'bg-green-500/20 text-green-300'
                      }`}>
                        {topic.isPremium ? '🔒 Premium' : '🔓 Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDate(topic.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/learn/${topic.id}`} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleEdit(topic, 'topic')} className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteTopic(topic.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allTopics.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                      No topics yet. <Link to="/admin/topics/new" className="text-blue-400 hover:underline">Add your first topic</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === PROJECTS MANAGEMENT === */}
        <div className="bg-[#131b2e] rounded-2xl border border-white/10 overflow-hidden mb-6">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Projects</h2>
              <span className="text-xs text-gray-500 bg-[#0a0f1e] px-2 py-1 rounded-full">{allProjects.length}</span>
            </div>
            <button 
              onClick={() => setShowAllProjects(!showAllProjects)}
              className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1"
            >
              {showAllProjects ? 'Show Less' : 'View All'} <ChevronRight className={`w-4 h-4 transition ${showAllProjects ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0a0f1e] border-b border-white/5">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Image</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Location</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(showAllProjects ? allProjects : allProjects.slice(0, 5)).map((project) => (
                  <tr key={project.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <img 
                        src={getFirstImage(project)} 
                        alt={project.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&q=80'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white truncate max-w-[150px]">{project.title || 'Untitled'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        project.category === 'Solar' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {project.category || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{project.location || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/project/${project.id}`} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleEdit(project, 'project')} className="p-1.5 text-amber-400 hover:bg-amber-500/20 rounded-lg transition" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteProject(project.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {allProjects.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                      No projects yet. <Link to="/admin/projects/new" className="text-blue-400 hover:underline">Add your first project</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* === QUICK ACTIONS & RECENT ACTIVITY === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-[#131b2e] rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" /> Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/admin/topics/new" className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-500/10 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a0f1e] flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-gray-300 group-hover:text-white transition text-sm font-medium">Add New Topic</span>
                    <p className="text-xs text-gray-500">Create a new lesson</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition" />
              </Link>
              <Link to="/admin/projects/new" className="flex items-center justify-between p-3 rounded-xl hover:bg-amber-500/10 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a0f1e] flex items-center justify-center">
                    <Plus className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <span className="text-gray-300 group-hover:text-white transition text-sm font-medium">Add New Project</span>
                    <p className="text-xs text-gray-500">Showcase your work</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition" />
              </Link>
              <Link to="/admin/messages" className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-500/10 transition group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0a0f1e] flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-gray-300 group-hover:text-white transition text-sm font-medium">View Messages</span>
                    <p className="text-xs text-gray-500">Respond to users</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition" />
              </Link>
            </div>

            {/* Platform Stats */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Platform Overview
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-amber-500/10 rounded-lg p-3 transition hover:scale-105 duration-200">
                  <div className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-gray-400">Solar</span>
                  </div>
                  <div className="text-lg font-bold text-amber-400 mt-1">{stats.solarProjects}</div>
                </div>
                <div className="bg-blue-500/10 rounded-lg p-3 transition hover:scale-105 duration-200">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Electrical</span>
                  </div>
                  <div className="text-lg font-bold text-blue-400 mt-1">{stats.electricalProjects}</div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3 transition hover:scale-105 duration-200">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400">Premium</span>
                  </div>
                  <div className="text-lg font-bold text-purple-400 mt-1">{stats.premiumUsers}</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 transition hover:scale-105 duration-200">
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-gray-400">Comments</span>
                  </div>
                  <div className="text-lg font-bold text-green-400 mt-1">{stats.comments}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-[#131b2e] rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" /> Recent Activity
              </h2>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>Messages</span>
                <span>•</span>
                <span>Comments</span>
              </div>
            </div>

            {recentMessages.length === 0 && recentComments.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p>No recent activity</p>
                <p className="text-sm text-gray-500">Messages and comments will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-4 p-3 bg-[#0a0f1e] rounded-xl border border-white/5 hover:border-white/10 transition group">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white truncate">{msg.name || 'Anonymous'}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            msg.status === 'unread' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {msg.status || 'unread'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {msg.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{msg.message || 'No message'}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {msg.email || 'No email'}
                        </span>
                        {msg.phone && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {msg.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 border-t border-white/5 pt-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span>Dashboard v3.0</span>
            <span>•</span>
            <span>Last updated: {lastUpdated}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-400" /> All systems go
            </span>
            <span>•</span>
            <span className="text-gray-600">{allTopics.length} Topics · {allProjects.length} Projects</span>
          </div>
        </div>
      </div>

      {/* === EDIT MODAL === */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#131b2e] rounded-2xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" /> Edit {editType === 'topic' ? 'Topic' : 'Project'}
              </h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  value={editForm.category || 'Solar'}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="Solar">☀️ Solar</option>
                  <option value="Electrical">⚡ Electrical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 resize-none"
                />
              </div>

              {editType === 'topic' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Thumbnail URL</label>
                    <input
                      type="url"
                      value={editForm.thumbnail || ''}
                      onChange={(e) => setEditForm({ ...editForm, thumbnail: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Intro Video URL</label>
                    <input
                      type="url"
                      value={editForm.introVideo || ''}
                      onChange={(e) => setEditForm({ ...editForm, introVideo: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Video URL</label>
                    <input
                      type="url"
                      value={editForm.fullVideo || ''}
                      onChange={(e) => setEditForm({ ...editForm, fullVideo: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Lesson Notes</label>
                    <textarea
                      rows="3"
                      value={editForm.writeUp || ''}
                      onChange={(e) => setEditForm({ ...editForm, writeUp: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400 resize-none"
                      placeholder="Lesson notes..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPremium"
                      checked={editForm.isPremium || false}
                      onChange={(e) => setEditForm({ ...editForm, isPremium: e.target.checked })}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <label htmlFor="isPremium" className="text-gray-300">Premium Content</label>
                  </div>
                </>
              )}

              {editType === 'project' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      placeholder="Lagos, Nigeria"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Client Type</label>
                    <select
                      value={editForm.clientType || 'Residential'}
                      onChange={(e) => setEditForm({ ...editForm, clientType: e.target.value })}
                      className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Images (comma separated URLs)</label>
                    <input
                      type="text"
                      value={editForm.images ? editForm.images.join(', ') : ''}
                      onChange={(e) => setEditForm({ 
                        ...editForm, 
                        images: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      placeholder="https://..., https://..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
