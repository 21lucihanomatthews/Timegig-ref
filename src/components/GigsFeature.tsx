import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, MapPin, Coins, Upload, X, Plus, Search, Calendar, UserCheck2, AlertCircle, Maximize2, ArrowLeft, Share2, Edit2, Trash2 } from 'lucide-react';
import { Gig, UserProfile } from '../types';
import FullscreenViewer from './FullscreenViewer';

interface GigsFeatureProps {
  gigs: Gig[];
  onAddGig: (gig: Partial<Gig>) => void;
  onUpdateGig: (gig: Gig) => void;
  onDeleteGig: (id: string) => void;
  userProfile: UserProfile;
  isVerified: boolean;
  onVerifyClick: () => void;
  onFormOpenChange?: (open: boolean) => void;
  onContactAuthor: (name: string, avatar: string, message?: string) => void;
}

export default function GigsFeature({ gigs, onAddGig, onUpdateGig, onDeleteGig, userProfile, isVerified, onVerifyClick, onFormOpenChange, onContactAuthor }: GigsFeatureProps) {
  const [provinceFilter, setProvinceFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGig, setEditingGig] = useState<Gig | null>(null);
  const [viewerState, setViewerState] = useState<{images: string[], title: string} | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Handyman');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when editingGig changes
  useEffect(() => {
    if (editingGig) {
      setTitle(editingGig.title);
      setDescription(editingGig.description);
      setLocation(editingGig.location);
      setPrice(editingGig.price.toString());
      setCategory(editingGig.category);
      setImages(editingGig.images);
      setIsFormOpen(true);
    } else {
      setTitle('');
      setDescription('');
      setLocation('');
      setPrice('');
      setCategory('Handyman');
      setImages([]);
    }
  }, [editingGig]);

  useEffect(() => {
    onFormOpenChange?.(isFormOpen);
    if (!isFormOpen && !editingGig) {
      // Reset if closed and not editing
    } else if (!isFormOpen) {
      setEditingGig(null);
    }
  }, [isFormOpen, onFormOpenChange]);

  // ...
  // Filtered gigs list
  const filteredGigs = (gigs || []).filter(g => 
    g && (provinceFilter === 'All' || (g.location || '').includes(provinceFilter)) &&
    (categoryFilter === 'All' || g.category === categoryFilter) &&
    (g.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     g.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     g.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // File handling helpers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const fileArray = Array.from(fileList);
    const validImages = fileArray.filter(file => file.type.startsWith('image/'));
    
    if (validImages.length === 0) {
      setError('Please select valid image files.');
      return;
    }
    
    setError('');
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !location.trim() || !price.trim()) {
      setError('All fields are required.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    if (editingGig) {
      onUpdateGig({
        ...editingGig,
        title,
        description,
        location,
        price: priceNum,
        category,
        images: images.length > 0 ? images : [],
      });
    } else {
      onAddGig({
        title,
        description,
        location,
        price: priceNum,
        category,
        images: images.length > 0 ? images : [],
        status: 'active'
      });
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setLocation('');
    setPrice('');
    setCategory('Handyman');
    setImages([]);
    setIsFormOpen(false);
    setEditingGig(null);
    setError('');
  };

  const handleEditClick = (gig: Gig) => {
    setEditingGig(gig);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this gig?')) {
      onDeleteGig(id);
    }
  };

  const handleShare = (title: string, text: string) => {
    const shareUrl = window.location.href;
    const shareText = `${title}\n${text}\nCheck it out on Gigstr: ${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url: shareUrl,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard or show a simple social menu
      const encodedText = encodeURIComponent(shareText);
      const whatsappUrl = `https://wa.me/?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6" id="gigs-feature-container">
      {/* Action / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-2xl flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search gigs, skills, or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
          >
            <option value="All">All Categories</option>
            <option value="Handyman">Handyman & Repairs</option>
            <option value="Cleaning">Cleaning & Housework</option>
            <option value="Gardening">Gardening & Outdoor</option>
            <option value="Pet Care">Pet Sitting & Walking</option>
            <option value="Delivery">Delivery & Errands</option>
            <option value="Childcare">Childcare & Nanny</option>
            <option value="Tutoring">Tutor & Lessons</option>
            <option value="Professional">Professional Services</option>
          </select>
          <select 
            value={provinceFilter} 
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
          >
            <option value="All">All Provinces</option>
            <option value="Gauteng">Gauteng</option>
            <option value="Western Cape">Western Cape</option>
            <option value="KwaZulu-Natal">KwaZulu-Natal</option>
            <option value="Eastern Cape">Eastern Cape</option>
            <option value="Free State">Free State</option>
            <option value="Limpopo">Limpopo</option>
            <option value="Mpumalanga">Mpumalanga</option>
            <option value="North West">North West</option>
            <option value="Northern Cape">Northern Cape</option>
          </select>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Post a New GiG
        </button>
      </div>

      {/* Gigs Grid */}
      {filteredGigs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-10 md:p-14 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700/50">
            <Briefcase className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display mb-1">
            {searchTerm ? 'No search results found' : 'No active gigs'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed text-xs">
            {searchTerm 
              ? `We couldn't find any gig matches for "${searchTerm}". Try checking your spelling or adjusting filters.` 
              : 'Be the first to post a custom gig contract or verify your profile to unlock premium bids.'}
          </p>
          {!isVerified && !searchTerm && (
            <button 
              onClick={onVerifyClick}
              className="mt-6 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck2 className="w-3.5 h-3.5" />
              Verify Profile to Unlock All
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGigs.map((gig) => (
            <motion.div 
              key={gig.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm hover:shadow-md transition duration-200 flex flex-col overflow-hidden"
            >
              {/* Image Container (Square like Marketplace) */}
              <div 
                className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/40 overflow-hidden group cursor-pointer"
                onClick={() => setViewerState({images: gig.images, title: gig.title})}
              >
                <img 
                  src={gig.images[0]} 
                  alt={gig.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-8 h-8 text-white" />
                </div>
                
                {gig.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold rounded">
                    +{gig.images.length - 1} photos
                  </div>
                )}
                
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold rounded font-mono uppercase tracking-wider shadow-sm border border-slate-100 dark:border-slate-800">
                  {gig.category || 'Gig'}
                </span>
              </div>

              {/* Card Body (Compact & clean) */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  {/* Price first, highly visible like FB Marketplace */}
                  <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    R{(gig.price ?? 0).toLocaleString()}
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-indigo-600 transition-colors">
                    {gig.title}
                  </h3>
                  
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {gig.description}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{gig.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate text-[10px] text-slate-400 dark:text-slate-500">
                      <img 
                        src={gig.authorAvatar} 
                        alt={gig.authorName} 
                        className="w-3.5 h-3.5 rounded-full object-cover border border-slate-100 dark:border-slate-800 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="truncate">By {gig.authorName}</span>
                    </div>
                    <button 
                      onClick={() => onContactAuthor(gig.authorName, gig.authorAvatar, `Hi, I am interested in applying for your gig: "${gig.title}".`)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[10px] transition cursor-pointer"
                    >
                      Apply
                    </button>
                    <button 
                      onClick={() => handleShare(gig.title, `I found this gig on Gigstr: ${gig.description}`)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition cursor-pointer"
                      title="Share Gig"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {gig.authorName === userProfile.name && (
                      <div className="flex gap-1 ml-auto">
                        <button 
                          onClick={() => handleEditClick(gig)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg transition cursor-pointer"
                          title="Edit Gig"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(gig.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition cursor-pointer"
                          title="Delete Gig"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Slide-over Panel for Posting Gig */}
      {viewerState && (
        <FullscreenViewer 
          isOpen={!!viewerState}
          images={viewerState.images}
          title={viewerState.title}
          onClose={() => setViewerState(null)}
        />
      )}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="gig-form-overlay">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Form Content */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
            >
              {/* Form Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">
                    {editingGig ? 'Edit Your Gig Listing' : 'Post a Custom Contract'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingGig ? 'Update the details of your professional listing.' : 'Define your specifications and receive custom offers from top specialists.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Gig Title</label>
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Fix Kitchen Lights or Senior Product Designer"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                  >
                    <option value="Handyman">Handyman & Repairs</option>
                    <option value="Cleaning">Cleaning & Housework</option>
                    <option value="Gardening">Gardening & Outdoor</option>
                    <option value="Pet Care">Pet Sitting & Walking</option>
                    <option value="Delivery">Delivery & Errands</option>
                    <option value="Childcare">Childcare & Nanny</option>
                    <option value="Tutoring">Tutor & Lessons</option>
                    <option value="Professional">Professional Services</option>
                  </select>
                </div>

                {/* Price & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Est. Budget (R)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</div>
                      <input 
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 2400"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Location / Workspace</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Cape Town, WC or Remote"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Scope of Work</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe the job in detail. For casual jobs, include if tools are provided or needed. For professional work, specify the stack and deliverables..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100 leading-relaxed resize-none"
                  />
                </div>

                {/* Multiple Images Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Reference Images / Work samples</label>
                  
                  {/* File Drag Drop Zone */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                      dragActive 
                        ? 'border-indigo-500 bg-indigo-50/10' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-950/20'
                    }`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-slate-400" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Drag and drop samples, or <span className="text-indigo-600 dark:text-indigo-400">browse file explorer</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP formats.</p>
                    </div>
                  </div>

                  {/* Thumbnail Previews */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2.5 pt-1.5">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-850 group">
                          <img src={img} alt="preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Footer */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none"
                  >
                    {editingGig ? 'Save Changes' : 'Publish Listing'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
