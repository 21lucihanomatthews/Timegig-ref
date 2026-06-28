import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, MapPin, Globe, Plus, Search, X, Upload, AlertCircle, User, Star, Award, Maximize2, ArrowLeft, Briefcase, Share2, Edit2, Trash2 } from 'lucide-react';
import { SeekerProfile, UserProfile } from '../types';
import FullscreenViewer from './FullscreenViewer';

interface SeekersFeatureProps {
  seekers: SeekerProfile[];
  onAddSeeker: (seeker: Partial<SeekerProfile>) => void;
  onUpdateSeeker: (seeker: SeekerProfile) => void;
  onDeleteSeeker: (id: string) => void;
  userProfile: UserProfile;
  isVerified: boolean;
  onFormOpenChange?: (open: boolean) => void;
  onContactSeeker: (name: string, logo: string, message?: string) => void;
}

export default function SeekersFeature({ seekers, onAddSeeker, onUpdateSeeker, onDeleteSeeker, userProfile, isVerified, onFormOpenChange, onContactSeeker }: SeekersFeatureProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSeeker, setEditingSeeker] = useState<SeekerProfile | null>(null);
  const [viewerState, setViewerState] = useState<{images: string[], title: string} | null>(null);

  useEffect(() => {
    onFormOpenChange?.(isFormOpen);
    if (!isFormOpen && !editingSeeker) {
      // Reset
    } else if (!isFormOpen) {
      setEditingSeeker(null);
    }
  }, [isFormOpen, onFormOpenChange]);

  // Form states
  const [name, setName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('Casual Worker');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [error, setError] = useState('');

  // Sync form state when editingSeeker changes
  useEffect(() => {
    if (editingSeeker) {
      setName(editingSeeker.name);
      setProfessionalTitle(editingSeeker.professionalTitle);
      setLocation(editingSeeker.location);
      setWebsite(editingSeeker.website || '');
      setBio(editingSeeker.bio);
      setAvatar(editingSeeker.avatar);
      setHourlyRate(editingSeeker.hourlyRate.toString());
      setIsFormOpen(true);
    } else {
      setName('');
      setProfessionalTitle('Casual Worker');
      setLocation('');
      setWebsite('');
      setBio('');
      setAvatar('');
      setHourlyRate('');
    }
  }, [editingSeeker]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredSeekers = (seekers || []);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file for your profile photo.');
        return;
      }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !location.trim() || !bio.trim() || !hourlyRate.trim()) {
      setError('Name, Location, Bio, and Hourly Rate are required.');
      return;
    }

    const rateNum = parseFloat(hourlyRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      setError('Please enter a valid hourly rate.');
      return;
    }

    if (editingSeeker) {
      onUpdateSeeker({
        ...editingSeeker,
        name,
        professionalTitle,
        location,
        website: website.trim() || undefined,
        bio,
        avatar: avatar || '',
        hourlyRate: rateNum,
      });
    } else {
      onAddSeeker({
        name,
        professionalTitle,
        location,
        website: website.trim() || undefined,
        bio,
        avatar: avatar || '',
        rating: 5.0,
        hourlyRate: rateNum,
        activeJobsCount: 0,
      });
    }

    // Reset Form
    setName('');
    setProfessionalTitle('Casual Worker');
    setLocation('');
    setWebsite('');
    setBio('');
    setAvatar('');
    setHourlyRate('');
    setIsFormOpen(false);
    setEditingSeeker(null);
    setError('');
  };

  const handleEditClick = (seeker: SeekerProfile) => {
    setEditingSeeker(seeker);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete your professional profile?')) {
      onDeleteSeeker(id);
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
      const encodedText = encodeURIComponent(shareText);
      const whatsappUrl = `https://wa.me/?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6" id="seekers-feature-container">
      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-end">
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white font-semibold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-slate-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Create Seeker Profile
        </button>
      </div>

      {/* Directory Grid */}
      {filteredSeekers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-10 md:p-14 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700/50">
            <Users className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display mb-1">
            No Professionals Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed text-xs">
            Be the first to list your services as a verified professional or seeker of custom work opportunities.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredSeekers.map((seeker) => (
            <motion.div
              key={seeker.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm hover:shadow-md transition duration-200 flex flex-col overflow-hidden"
            >
              {/* Profile Image (Square like Marketplace) */}
              <div 
                className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/40 overflow-hidden group cursor-pointer border-b border-slate-100 dark:border-slate-800/50"
                onClick={() => setViewerState({images: [seeker.avatar], title: seeker.name})}
              >
                <img
                  src={seeker.avatar}
                  alt={seeker.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-8 h-8 text-white" />
                </div>
                
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 text-[9px] font-bold rounded font-mono uppercase tracking-wider shadow-sm border border-slate-100 dark:border-slate-800">
                  {seeker.professionalTitle}
                </span>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold rounded flex items-center gap-0.5">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  {seeker.rating.toFixed(1)}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  {/* Hourly Rate displayed prominently */}
                  <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    R{(seeker.hourlyRate ?? 0).toLocaleString()} / hr
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-snug truncate">
                    {seeker.name}
                  </h3>
                  
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {seeker.bio}
                  </p>
                </div>

                {/* Footer details */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{seeker.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {seeker.website ? (
                      <a
                        href={seeker.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 hover:underline dark:text-slate-100 flex items-center gap-0.5 font-semibold"
                      >
                        <Globe className="w-3 h-3 text-slate-900 dark:text-slate-100" />
                        <span className="truncate">Website</span>
                      </a>
                    ) : (
                      <div className="flex items-center gap-0.5 text-slate-400">
                        <Award className="w-3 h-3" />
                        <span>Verified</span>
                      </div>
                    )}
                    <button 
                      onClick={() => onContactSeeker(seeker.name, seeker.avatar, `Hi, I am interested in hiring your services: "${seeker.name}".`)}
                      className="px-3 py-1 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 font-bold rounded-lg text-[10px] transition cursor-pointer"
                    >
                      Hire
                    </button>
                    <button 
                      onClick={() => handleShare(seeker.name, `Check out this professional on Gigstr: ${seeker.professionalTitle} in ${seeker.location}`)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition cursor-pointer"
                      title="Share Professional"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {seeker.name === userProfile.name && (
                      <div className="flex gap-1 ml-auto">
                        <button 
                          onClick={() => handleEditClick(seeker)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(seeker.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition cursor-pointer"
                          title="Delete Profile"
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

      {/* Form Overlay Side-sheet */}
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
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="seeker-form-overlay">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Form */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white font-display">
                    {editingSeeker ? 'Edit Your Professional Profile' : 'Create Professional Profile'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingSeeker ? 'Keep your services and skills up to date for better reach.' : 'List your skills and services to receive direct hire requests from clients.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name / Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-9.5 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Professional Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Professional Title</label>
                  <select
                    value={professionalTitle}
                    onChange={(e) => setProfessionalTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                  >
                    <option value="Casual Worker">Casual Worker</option>
                    <option value="Handyman">Handyman</option>
                    <option value="Cleaner">Professional Cleaner</option>
                    <option value="Gardener">Gardener</option>
                    <option value="Driver">Delivery Driver</option>
                    <option value="Security">Security Specialist</option>
                    <option value="Tutor">Private Tutor</option>
                    <option value="Designer">Graphic Designer</option>
                    <option value="Developer">Web Developer</option>
                  </select>
                </div>

                {/* Location & Hourly Rate */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Cape Town, WC"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Rate (R/hr)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</div>
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="e.g. 150"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Profile Image */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                      {avatar ? (
                        <img src={avatar} alt="profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-400" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Professional Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder="Tell potential clients about your experience, skills, and why they should hire you..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100 leading-relaxed resize-none"
                  />
                </div>

                {/* Action Buttons */}
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
                    className="flex-1 py-3 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white font-semibold rounded-xl text-xs transition cursor-pointer shadow-md shadow-slate-200 dark:shadow-none"
                  >
                    {editingSeeker ? 'Save Profile' : 'Register Seeker Profile'}
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
