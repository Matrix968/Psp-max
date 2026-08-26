import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader, MapPin, Calendar, User } from 'lucide-react';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';

const ElectricalProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Query only Electrical projects
        const q = query(
          collection(db, "projects"),
          where("category", "==", "Electrical"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const projectsData = [];
        querySnapshot.forEach((doc) => {
          projectsData.push({ 
            id: doc.id, 
            ...doc.data(),
            // Ensure we have a valid date string
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt || null
          });
        });
        setProjects(projectsData);
        setError('');
      } catch (err) {
        console.error("Error fetching electrical projects:", err);
        setError('Failed to load projects. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter projects based on search
  const filteredProjects = projects.filter(project => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      project.title?.toLowerCase().includes(searchLower) ||
      project.location?.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower)
    );
  });

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Date not specified';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Date not specified';
    }
  };

  // Get first image or fallback
  const getProjectImage = (project) => {
    if (project.images && project.images.length > 0) {
      return project.images[0];
    }
    // Fallback images based on project type
    return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading electrical projects...</p>
      </div>
    );
  }

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚡ Electrical Projects</h1>
          <p className="text-gray-400">
            Browse our portfolio of electrical engineering work
            <span className="text-blue-400 ml-2">({projects.length} projects)</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search projects by title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#131b2e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-4 py-3 bg-[#131b2e] border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/20 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 bg-[#131b2e] rounded-2xl border border-white/10">
            {projects.length === 0 ? (
              <>
                <p className="text-gray-400 text-lg mb-2">No electrical projects yet</p>
                <p className="text-gray-500 text-sm">Start by adding your first electrical project</p>
                <Link 
                  to="/admin/projects/new" 
                  className="inline-block mt-4 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg transition"
                >
                  Add Project →
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-400 text-lg">No projects match "{search}"</p>
                <button 
                  onClick={() => setSearch('')}
                  className="mt-4 text-blue-400 hover:text-blue-300 transition"
                >
                  Clear search
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link 
                to={`/project/${project.id}`} 
                key={project.id} 
                className="group bg-[#131b2e] rounded-2xl overflow-hidden border border-white/10 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-[#0a0f1e]">
                  <img 
                    src={getProjectImage(project)} 
                    alt={project.title || 'Electrical project'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80';
                    }}
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-blue-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                    ⚡ Electrical
                  </div>
                  {/* Premium Badge - if you add premium to projects later */}
                  {project.isPremium && (
                    <div className="absolute top-3 right-3 bg-purple-500/90 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                      🔒 Premium
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition line-clamp-1">
                    {project.title || 'Untitled Project'}
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                    {project.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {project.location}
                      </span>
                    )}
                    {project.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(project.date)}
                      </span>
                    )}
                    {project.clientType && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {project.clientType}
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Image count */}
                  {project.images && project.images.length > 1 && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                      <span>📸</span>
                      <span>{project.images.length} images</span>
                    </div>
                  )}

                  {/* View button */}
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <span className="text-blue-400 group-hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1">
                      View Project 
                      <span className="group-hover:translate-x-1 transition">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        {filteredProjects.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            Showing {filteredProjects.length} of {projects.length} electrical projects
          </div>
        )}
      </div>
    </div>
  );
};

export default ElectricalProjects;