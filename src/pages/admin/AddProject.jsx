import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Link as LinkIcon, X, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContexts';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddProject = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Solar',
    description: '',
    location: '',
    date: '',
    clientType: 'Residential',
    images: [], // Array of image URLs
    imageFiles: [], // Array of File objects
    imagePreviews: [], // Array of preview URLs
    imageType: 'link', // 'link' or 'upload'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleImageFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const previewUrl = URL.createObjectURL(file);
        setUploadProgress((index + 1) / files.length * 50);
        const uploadedUrl = await uploadToCloudinary(file);
        setUploadProgress((index + 1) / files.length * 100);
        return { url: uploadedUrl, preview: previewUrl, file };
      });

      const results = await Promise.all(uploadPromises);
      
      setForm({
        ...form,
        images: [...form.images, ...results.map(r => r.url)],
        imagePreviews: [...form.imagePreviews, ...results.map(r => r.preview)],
        imageFiles: [...form.imageFiles, ...results.map(r => r.file)],
        imageType: 'upload',
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload images. Please try again.');
    }
    setLoading(false);
    setUploadProgress(0);
    e.target.value = '';
  };

  const handleAddLinkImage = () => {
    if (currentImageUrl.trim()) {
      setForm({
        ...form,
        images: [...form.images, currentImageUrl.trim()],
        imageType: 'link',
      });
      setCurrentImageUrl('');
    }
  };

  const handleRemoveImage = (index) => {
    setForm({
      ...form,
      images: form.images.filter((_, i) => i !== index),
      imagePreviews: form.imagePreviews.filter((_, i) => i !== index),
      imageFiles: form.imageFiles.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!isAdmin) {
        setError('You do not have permission to add projects');
        setLoading(false);
        return;
      }

      const projectData = {
        title: form.title,
        category: form.category,
        description: form.description,
        location: form.location,
        date: form.date,
        clientType: form.clientType,
        images: form.images,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "projects"), projectData);
      alert('✅ Project added successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Error adding project:", err);
      setError(err.message || 'Failed to add project. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-12">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>

        <div className="bg-[#131b2e] rounded-2xl border border-white/10 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Add New Project</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span>Uploading images... {Math.round(uploadProgress)}%</span>
                <div className="w-32 h-2 bg-[#0a0f1e] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Project Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="e.g., 2kW Solar System – Lagos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                <option value="Solar">☀️ Solar</option>
                <option value="Electrical">⚡ Electrical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
              <textarea
                required
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Project details..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Lagos, Nigeria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Client Type</label>
              <select
                value={form.clientType}
                onChange={(e) => setForm({ ...form, clientType: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Images</label>
              
              {/* Toggle */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageType: 'link' })}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    form.imageType === 'link' ? 'bg-blue-500 text-white' : 'bg-[#0a0f1e] text-gray-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" /> Link
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageType: 'upload' })}
                  className={`px-3 py-1 rounded-lg text-sm transition ${
                    form.imageType === 'upload' ? 'bg-blue-500 text-white' : 'bg-[#0a0f1e] text-gray-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-4 h-4 inline mr-1" /> Upload
                </button>
              </div>

              {form.imageType === 'link' ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={currentImageUrl}
                    onChange={(e) => setCurrentImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <button
                    type="button"
                    onClick={handleAddLinkImage}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <div>
                  <div 
                    className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition"
                    onClick={() => document.getElementById('imageUpload').click()}
                  >
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Click to upload images</p>
                    <p className="text-gray-600 text-xs">PNG, JPG, WEBP up to 10MB each</p>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageFileSelect}
                    />
                  </div>
                </div>
              )}

              {/* Image Previews */}
              {form.imagePreviews.length > 0 || form.images.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.imagePreviews.map((preview, i) => (
                    <div key={i} className="relative group">
                      <img src={preview} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {form.images.map((url, i) => {
                    // Skip if we already have a preview for this index
                    if (i < form.imagePreviews.length) return null;
                    return (
                      <div key={i} className="relative group">
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-white/10" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <p className="text-xs text-gray-500 mt-1">Add up to 10 images</p>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Adding Project...' : 'Add Project'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProject;