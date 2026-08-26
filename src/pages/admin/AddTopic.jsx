import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Link as LinkIcon, X, Image, Video, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContexts';
import { db } from '../../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddTopic = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [form, setForm] = useState({
    title: '',
    category: 'Solar',
    description: '',
    writeUp: '',
    isPremium: false,
    introVideoType: 'link', // 'link' or 'upload'
    introVideoLink: '',
    introVideoFile: null,
    introVideoPreview: '',
    fullVideoType: 'link', // 'link' or 'upload'
    fullVideoLink: '',
    fullVideoFile: null,
    fullVideoPreview: '',
    thumbnailType: 'link', // 'link' or 'upload'
    thumbnailLink: '',
    thumbnailFile: null,
    thumbnailPreview: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Cloudinary upload function
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    formData.append('cloud_name', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`,
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

  const handleFileChange = (e, field, type) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setForm({
        ...form,
        [field]: file,
        [`${field}Preview`]: previewUrl,
        [`${field}Type`]: 'upload',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      if (!isAdmin) {
        setError('You do not have permission to add topics');
        setLoading(false);
        return;
      }

      let introVideoUrl = form.introVideoLink;
      let fullVideoUrl = form.fullVideoLink;
      let thumbnailUrl = form.thumbnailLink;

      // Upload intro video if file selected
      if (form.introVideoFile) {
        setUploadProgress(20);
        introVideoUrl = await uploadToCloudinary(form.introVideoFile);
        setUploadProgress(40);
      }

      // Upload full video if file selected
      if (form.fullVideoFile) {
        setUploadProgress(60);
        fullVideoUrl = await uploadToCloudinary(form.fullVideoFile);
        setUploadProgress(80);
      }

      // Upload thumbnail if file selected
      if (form.thumbnailFile) {
        thumbnailUrl = await uploadToCloudinary(form.thumbnailFile);
        setUploadProgress(90);
      }

      const topicData = {
        title: form.title,
        category: form.category,
        description: form.description,
        writeUp: form.writeUp,
        isPremium: form.isPremium,
        introVideo: introVideoUrl,
        fullVideo: fullVideoUrl,
        thumbnail: thumbnailUrl,
        introVideoType: form.introVideoType === 'upload' ? 'upload' : 'link',
        fullVideoType: form.fullVideoType === 'upload' ? 'upload' : 'link',
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "topics"), topicData);
      setUploadProgress(100);
      alert('✅ Topic added successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error("Error adding topic:", err);
      setError(err.message || 'Failed to add topic. Please try again.');
    }
    setLoading(false);
  };

  // Render media upload field
  const renderMediaField = (label, field, type, previewField, linkField, fileField) => {
    const isUpload = form[`${field}Type`] === 'upload';
    const hasFile = form[fileField] !== null;
    const preview = form[previewField];

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        
        {/* Toggle */}
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, [`${field}Type`]: 'link', [fileField]: null, [previewField]: '' })}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              !isUpload ? 'bg-blue-500 text-white' : 'bg-[#0a0f1e] text-gray-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-4 h-4 inline mr-1" /> Link
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, [`${field}Type`]: 'upload', [linkField]: '' })}
            className={`px-3 py-1 rounded-lg text-sm transition ${
              isUpload ? 'bg-blue-500 text-white' : 'bg-[#0a0f1e] text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-1" /> Upload
          </button>
        </div>

        {/* Link Input */}
        {!isUpload ? (
          <input
            type="url"
            value={form[linkField]}
            onChange={(e) => setForm({ ...form, [linkField]: e.target.value })}
            className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
            placeholder={`Enter ${type} URL (YouTube, Vimeo, etc.)`}
          />
        ) : (
          <div>
            <div 
              className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {hasFile ? (
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">File selected</span>
                  {preview && (
                    <span className="text-xs text-gray-400 block mt-1">
                      {form[fileField]?.name || 'File uploaded'}
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Click to upload {type}</p>
                  <p className="text-gray-600 text-xs">MP4, MOV, PNG, JPG up to 100MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={type === 'video' ? 'video/*' : 'image/*'}
                className="hidden"
                onChange={(e) => handleFileChange(e, fileField, type)}
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="mt-2 relative">
                {type === 'video' ? (
                  <video src={preview} className="w-full max-h-48 rounded-lg object-cover" controls />
                ) : (
                  <img src={preview} alt="Preview" className="w-full max-h-48 rounded-lg object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, [fileField]: null, [previewField]: '' })}
                  className="absolute top-2 right-2 bg-red-500 rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-12">
      <div className="max-w-3xl mx-auto px-6">
        <Link to="/admin/dashboard" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>

        <div className="bg-[#131b2e] rounded-2xl border border-white/10 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Add New Topic</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <span>Uploading... {uploadProgress}%</span>
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Topic Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="e.g., Solar Panel Installation Basics"
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
              <label className="block text-sm font-medium text-gray-300 mb-1">Short Description *</label>
              <input
                type="text"
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Brief description for card"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Write-up (Lesson Notes)</label>
              <textarea
                rows="4"
                value={form.writeUp}
                onChange={(e) => setForm({ ...form, writeUp: e.target.value })}
                className="w-full px-4 py-2 bg-[#0a0f1e] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 resize-none"
                placeholder="Full lesson notes..."
              />
            </div>

            {/* Intro Video */}
            {renderMediaField('Intro Video (Preview)', 'introVideo', 'video', 'introVideoPreview', 'introVideoLink', 'introVideoFile')}

            {/* Full Video */}
            {renderMediaField('Full Video (10 min lesson)', 'fullVideo', 'video', 'fullVideoPreview', 'fullVideoLink', 'fullVideoFile')}

            {/* Thumbnail */}
            {renderMediaField('Thumbnail Image', 'thumbnail', 'image', 'thumbnailPreview', 'thumbnailLink', 'thumbnailFile')}

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPremium"
                checked={form.isPremium}
                onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                className="w-4 h-4 accent-blue-500"
              />
              <label htmlFor="isPremium" className="text-gray-300">Premium Content (locked for non-subscribers)</label>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Adding Topic...' : 'Add Topic'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTopic;