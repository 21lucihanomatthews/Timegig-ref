import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Search, X, Upload, AlertCircle, ShoppingCart, MessageSquare, Tag, Image, Sparkles, Maximize2, ArrowLeft, Share2, Edit2, Trash2 } from 'lucide-react';
import { MarketItem, UserProfile } from '../types';
import FullscreenViewer from './FullscreenViewer';

interface MarketFeatureProps {
  items: MarketItem[];
  onAddItem: (item: Partial<MarketItem>) => void;
  onUpdateItem: (item: MarketItem) => void;
  onDeleteItem: (id: string) => void;
  userProfile: UserProfile;
  onContactSeller: (sellerName: string, sellerAvatar: string, message?: string) => void;
  onFormOpenChange?: (open: boolean) => void;
}

export default function MarketFeature({ items, onAddItem, onUpdateItem, onDeleteItem, userProfile, onContactSeller, onFormOpenChange }: MarketFeatureProps) {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MarketItem | null>(null);
  const [viewerState, setViewerState] = useState<{images: string[], title: string} | null>(null);

  useEffect(() => {
    onFormOpenChange?.(isFormOpen);
    if (!isFormOpen && !editingItem) {
      // Reset
    } else if (!isFormOpen) {
      setEditingItem(null);
    }
  }, [isFormOpen, onFormOpenChange]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<'UI Kit' | 'Code Template' | 'Design Asset' | 'Contract template' | 'Other'>('UI Kit');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Sync form state when editingItem changes
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setDescription(editingItem.description);
      setPrice(editingItem.price.toString());
      setCategory(editingItem.category as any);
      setImages(editingItem.images);
      setIsFormOpen(true);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('UI Kit');
      setImages([]);
    }
  }, [editingItem]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredItems = (items || []).filter(item => {
    if (!item) return false;
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleMultipleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files) as File[];
      const validImages = fileList.filter(file => file.type.startsWith('image/'));
      
      if (validImages.length === 0) {
        setError('Please upload valid image files.');
        return;
      }

      setError('');
      validImages.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImages(prev => [...prev, reader.result]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !price.trim()) {
      setError('Title, Description, and Price are required fields.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        title,
        description,
        price: priceNum,
        category,
        images: images.length > 0 ? images : [],
      });
    } else {
      onAddItem({
        title,
        description,
        price: priceNum,
        category,
        images: images.length > 0 ? images : [],
        sellerName: userProfile.name,
        sellerAvatar: userProfile.avatar,
      });
    }

    // Reset Form
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('UI Kit');
    setImages([]);
    setIsFormOpen(false);
    setEditingItem(null);
    setError('');
  };

  const handleEditClick = (item: MarketItem) => {
    setEditingItem(item);
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDeleteItem(id);
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
    <div className="space-y-6" id="market-feature-container">
      {/* Search & Actions bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search products, assets, or templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-semibold"
            />
          </div>
          {/* Category filter pills */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:outline-none focus:border-indigo-500 text-slate-700 dark:text-slate-300 font-semibold"
          >
            <option value="All">All Categories</option>
            <option value="UI Kit">UI Kits</option>
            <option value="Code Template">Code Templates</option>
            <option value="Design Asset">Design Assets</option>
            <option value="Contract template">Contract Models</option>
            <option value="Other">Other Items</option>
          </select>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-100 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          List Item for Sale
        </button>
      </div>

      {/* Catalog items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-10 md:p-14 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700/50">
            <ShoppingBag className="w-10 h-10 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-display mb-1">
            No marketplace listings
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed text-xs">
            We couldn't find any premium template listings or design assets matching your requirements.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition duration-200"
            >
              {/* Product preview image display */}
              <div 
                className="relative aspect-square w-full bg-slate-50 dark:bg-slate-800/40 overflow-hidden group cursor-pointer"
                onClick={() => setViewerState({images: item.images, title: item.title})}
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="w-8 h-8 text-white" />
                </div>
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600/95 text-white text-[9px] font-bold rounded font-mono uppercase tracking-wider shadow-sm">
                  {item.category}
                </span>
                {item.images.length > 1 && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold rounded">
                    +{item.images.length - 1} photos
                  </div>
                )}
              </div>

              {/* Product Details info body */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  {/* Price display - highly prominent like FB Marketplace */}
                  <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                    R{(item.price ?? 0).toLocaleString()}
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Footer and Buying Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2">
                  {/* Seller avatar info */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    <img
                      src={item.sellerAvatar}
                      alt={item.sellerName}
                      className="w-3.5 h-3.5 rounded-full object-cover border border-slate-100 dark:border-slate-850 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="truncate">Seller: {item.sellerName}</span>
                  </div>

                  {/* Buy / Chat buttons */}
                  <div className="flex items-center gap-1">
                    {item.sellerName !== userProfile.name && (
                      <button
                        onClick={() => onContactSeller(item.sellerName, item.sellerAvatar, `Hi, I am interested in your listing for "${item.title}". Can we discuss the details?`)}
                        className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[10px] transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Interested</span>
                      </button>
                    )}
                    <button 
                      onClick={() => handleShare(item.title, `Check out this item on the Gigstr Market: ${item.description}`)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition cursor-pointer"
                      title="Share Item"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {item.sellerName === userProfile.name && (
                      <div className="flex gap-1 ml-auto">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg transition cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(item.id)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg transition cursor-pointer"
                          title="Delete Item"
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

      {/* Selling Form Sheet overlay */}
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
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="sell-form-overlay">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Form sheet panel */}
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
                    {editingItem ? 'Edit Marketplace Listing' : 'List an Asset for Sale'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingItem ? 'Update your product details and showcase.' : 'Sell UI designs, software boilerplates, or legally vetted custom templates.'}
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

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Asset Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Next.js SaaS Boilerplate with Stripe Escrow"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Asset Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                    >
                      <option value="UI Kit">UI Kit Designs</option>
                      <option value="Code Template">Code Templates</option>
                      <option value="Design Asset">Design Assets</option>
                      <option value="Contract template">Contract Models</option>
                      <option value="Other">Other Assets</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Price (R)</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</div>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="e.g. 49"
                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Asset Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Provide a description of your template, including its core benefits, tech specs, what's included in the package, and setup steps..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100 leading-relaxed resize-none"
                  />
                </div>

                {/* Multiple Images Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Product Showcase Images</label>
                  
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-xl p-5 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1 bg-slate-50/30 dark:bg-slate-950/20"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultipleFiles}
                      className="hidden"
                    />
                    <Upload className="w-7 h-7 text-slate-400 mb-1" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-250">
                      Upload product screenshots
                    </p>
                    <p className="text-[10px] text-slate-400">Supports PNG, JPG, and SVG.</p>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
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

                {/* Footer Buttons */}
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
                    {editingItem ? 'Save Changes' : 'Publish Listing'}
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
