/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Users, 
  MessageSquare, 
  ShoppingBag, 
  Filter, 
  AlertCircle, 
  Sparkles, 
  UserCheck2,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { motion } from 'motion/react';
import { TabId } from '../types';

interface EmptyStateProps {
  tab: TabId;
  onVerifyClick?: () => void;
  isVerified?: boolean;
}

export default function EmptyState({ tab, onVerifyClick, isVerified = false }: EmptyStateProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const renderGigsTab = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
      id="empty-gigs-container"
    >
      {/* Search & Filter Bar Mockup */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/80 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search active gigs (e.g. React Developer, UI Designer)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
          >
            <option value="all">All Categories</option>
            <option value="tech">Tech & Software</option>
            <option value="design">Design & Creative</option>
            <option value="marketing">Marketing & Writing</option>
          </select>
          <button className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Styled Empty State Display */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-10 md:p-14 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-slate-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-slate-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700/50">
            <Briefcase className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-display mb-2">
            {searchTerm ? `No results for "${searchTerm}"` : 'No Active GiGs'}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md leading-relaxed text-sm">
            {searchTerm 
              ? 'We couldn\'t find any active gig contracts matching your search keywords. Please try adjusting your filters.' 
              : 'You haven\'t posted or applied for any gigs yet. Your active projects will appear here once you start exploring the market.'}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {!isVerified && (
              <button 
                onClick={onVerifyClick}
                className="px-6 py-3 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-slate-200 dark:shadow-none cursor-pointer flex items-center gap-2"
              >
                <UserCheck2 className="w-4 h-4" />
                Verify Identity to Unlock GiGs
              </button>
            )}
            <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all">
              Find Your First GiG
            </button>
          </div>
        </div>
      </motion.div>

      {/* Recommended Category Pills Mockup */}
      <motion.div variants={itemVariants} className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-mono">
          <TrendingUp className="w-3.5 h-3.5" />
          Trending Market Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {['AI Integrations', 'Smart Contract Auditing', '3D Motion Graphics', 'SEO Copywriting', 'Web3 Architecture', 'Product Strategy'].map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-full transition cursor-pointer border border-slate-200/50 dark:border-slate-700/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const renderSeekersTab = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
      id="empty-seekers-container"
    >
      {/* Filters bar mockup */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-900 dark:text-slate-100" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Active Talent Seekers</span>
          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-xs font-mono">0 online</span>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-medium transition">
            All Seekers
          </button>
          <button className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-705 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-medium transition">
            Verified Businesses Only
          </button>
        </div>
      </motion.div>

      {/* Styled Empty State Display */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-10 md:p-14 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700/50">
            <Users className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-display mb-2">
            No Active Seekers
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md leading-relaxed text-sm">
            There are currently no active recruiters or hiring managers online in your sector. Fill out your professional user profile from the dropdown menu to receive custom direct contract requests.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-100 dark:shadow-none cursor-pointer">
              Optimize Profile Visibility
            </button>
            <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all">
              Setup Match Alerts
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tips Banner */}
      <motion.div variants={itemVariants} className="bg-slate-50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-slate-900 dark:text-slate-100 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">How to attract high-paying Seekers</h5>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Recruiters filter profiles by 'Verified' badges first. Completing your <strong>Identity Verification</strong> process in the top menu increases your profile visibility on matching dashboards by up to 300%.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderChatTab = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm overflow-hidden flex flex-col h-[520px]"
      id="empty-chat-container"
    >
      <div className="border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 font-display">Instant Messenger</span>
        </div>
        <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded text-xs font-mono border border-slate-200/50 dark:border-slate-700">
          secure end-to-end
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700/50">
            <MessageSquare className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-display mb-2">
            Inbox is Clear
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed text-sm">
            No active discussions or candidate negotiations are currently open. Initiating a chat requires submitting interest in a gig post or receiving a seeker invitation.
          </p>

          <button className="mt-8 px-6 py-3 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-slate-200 dark:shadow-none cursor-pointer">
            Browse Seekers Directory
          </button>
        </div>
      </div>

      {/* Mocked sidebar status list */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-around gap-2">
          {['Support Bot', 'AI Copilot', 'Platform Notifications'].map((agent, i) => (
            <div key={agent} className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-amber-400' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{agent}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderMarketTab = () => (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
      id="empty-market-container"
    >
      {/* Search mockup */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <ShoppingBag className="w-5 h-5 text-slate-900 dark:text-slate-100" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Digital Assets & Templates Marketplace</span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          beta v1.0
        </div>
      </motion.div>

      {/* Styled Empty State Display */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-850 p-10 md:p-14 text-center shadow-sm relative overflow-hidden flex flex-col items-center justify-center">
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/80 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-700/50">
            <ShoppingBag className="w-12 h-12 text-slate-400 dark:text-slate-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-display mb-2">
            Marketplace Coming Soon
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm leading-relaxed text-sm">
            The Digital Template & Design Assets shop is currently offline. Verified sellers will soon be able to list premium assets, templates, and boilerplates.
          </p>

          <button className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-indigo-100 dark:shadow-none cursor-pointer">
            Apply as a Creator / Seller
          </button>
        </div>
      </motion.div>

      {/* Market Features list */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'UI Kits & Boilerplates', desc: 'Pre-vetted premium web templates and component libraries.' },
          { title: 'Custom AI Prompts', desc: 'High-performance prompt pipelines tailored for modern development.' },
          { title: 'Contract Templates', desc: 'Legally vetted service agreements and gig contracts.' }
        ].map((item, index) => (
          <div key={index} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
            <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-display">{item.title}</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex items-center justify-center min-h-[50vh]">
      <h1 className="text-4xl font-black tracking-tight font-display text-black">
        TimeGiG
      </h1>
    </div>
  );
}
