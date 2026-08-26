import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, User, Loader, Image as ImageIcon } from 'lucide-react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          setProject(null);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex flex-col items-center justify-center">
        <Loader className="w-12 h-12 text-blue-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl text-white mb-2">Project not found</h2>
          <p className="text-gray-400 mb-4">The project you're looking for doesn't exist.</p>
          <Link to="/solar" className="text-blue-400 hover:text-blue-300">Back to projects</Link>
        </div>
      </div>
    );
  }

  const images = project.images || [];
  const mainImage = images[selectedImage] || 
    (project.category === 'Solar' 
      ? 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80' 
      : 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80');

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-12">
      <div className="max-w-5xl mx-auto px-6">
        <Link 
          to={project.category === 'Solar' ? '/solar' : '/electrical'} 
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back to {project.category} Projects
        </Link>

        <div className="bg-[#131b2e] rounded-2xl overflow-hidden border border-white/10">
          {/* Main Image */}
          <div className="relative bg-[#0a0f1e]">
            <img 
              src={mainImage} 
              alt={project.title} 
              className="w-full h-64 md:h-[500px] object-contain bg-[#0a0f1e]"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1200&q=80';
              }}
            />
            {/* Category Badge */}
            <div className={`absolute top-4 left-4 text-white text-sm font-semibold px-4 py-2 rounded-full backdrop-blur-sm ${
              project.category === 'Solar' ? 'bg-amber-500/80' : 'bg-blue-500/80'
            }`}>
              {project.category === 'Solar' ? '☀️ Solar' : '⚡ Electrical'}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 bg-[#0a0f1e]/50 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    i === selectedImage ? 'border-blue-400' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${project.title} - ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{project.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">
              {project.location && (
                <span className="flex items-center gap-1 bg-[#0a0f1e] px-3 py-1 rounded-full">
                  <MapPin className="w-4 h-4" /> {project.location}
                </span>
              )}
              {project.date && (
                <span className="flex items-center gap-1 bg-[#0a0f1e] px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" /> {new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {project.clientType && (
                <span className="flex items-center gap-1 bg-[#0a0f1e] px-3 py-1 rounded-full">
                  <User className="w-4 h-4" /> {project.clientType}
                </span>
              )}
              {images.length > 0 && (
                <span className="flex items-center gap-1 bg-[#0a0f1e] px-3 py-1 rounded-full">
                  <ImageIcon className="w-4 h-4" /> {images.length} images
                </span>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed text-lg">{project.description}</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link 
                to="/contact" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
              >
                Request a Quote
              </Link>
              <Link 
                to="/learn" 
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;