/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  MoreVertical, 
  Briefcase, 
  Users, 
  MessageSquare, 
  ShoppingBag, 
  Wallet as WalletIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  User, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Menu,
  Clock,
  ExternalLink,
  Bell,
  Trash2,
  Gift,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TabId, MenuFeatureId, UserProfile, IdentityVerification, Wallet, AppSettings, Gig, SeekerProfile, ChatThread, ChatMessage, MarketItem, NotificationMsg } from './types';
import EmptyState from './components/EmptyState';
import MenuOverlays from './components/MenuOverlays';
import GigsFeature from './components/GigsFeature';
import SeekersFeature from './components/SeekersFeature';
import ChatFeature from './components/ChatFeature';
import MarketFeature from './components/MarketFeature';


export default function App() {
  // --- Persistent States ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('gs_logged_in');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const saved = localStorage.getItem('gs_active_tab');
    return (saved as TabId) || 'gigs';
  });

  const [activeOverlay, setActiveOverlay] = useState<MenuFeatureId | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // --- Core Model States ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gs_user_profile');
    if (saved) return JSON.parse(saved);
    return {
      name: "",
      email: "",
      title: "",
      bio: "",
      skills: [],
      avatar: "",
      completedGigs: 0,
      rating: 0,
      privacy: 'public'
    };
  });

  const [verification, setVerification] = useState<IdentityVerification>(() => {
    const saved = localStorage.getItem('gs_verification');
    if (saved) return JSON.parse(saved);
    return {
      status: 'not_started',
      fullName: '',
      documentType: 'passport',
      documentNumber: ''
    };
  });

  const [wallet, setWallet] = useState<Wallet>(() => {
    const saved = localStorage.getItem('gs_wallet');
    if (saved) return JSON.parse(saved);
    return {
      balance: 0,
      currency: 'COINS',
      transactions: [],
      referredUsers: []
    };
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('gs_settings');
    if (saved) return JSON.parse(saved);
    return {
      notificationsEnabled: true,
      emailAlerts: true,
      twoFactorAuth: false,
      profilePublic: true,
      theme: 'light'
    };
  });

  // --- Pre-seeded Gigs, Seekers, Chats & Market States ---
  const initialGigs: Gig[] = [];

  const initialSeekers: SeekerProfile[] = [];

  const initialChats: ChatThread[] = [];

  const initialMarketItems: MarketItem[] = [];

  const [gigs, setGigs] = useState<Gig[]>(() => {
    const saved = localStorage.getItem('gs_gigs');
    return saved ? JSON.parse(saved) : initialGigs;
  });

  const [seekers, setSeekers] = useState<SeekerProfile[]>(() => {
    const saved = localStorage.getItem('gs_seekers');
    return saved ? JSON.parse(saved) : initialSeekers;
  });

  const [chats, setChats] = useState<ChatThread[]>(() => {
    const saved = localStorage.getItem('gs_chats');
    return saved ? JSON.parse(saved) : initialChats;
  });

  const [marketItems, setMarketItems] = useState<MarketItem[]>(() => {
    const saved = localStorage.getItem('gs_market_items');
    return saved ? JSON.parse(saved) : initialMarketItems;
  });

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [forceMobileChatOpen, setForceMobileChatOpen] = useState(0);
  const [gigsFormOpen, setGigsFormOpen] = useState(false);
  const [seekersFormOpen, setSeekersFormOpen] = useState(false);
  const [marketFormOpen, setMarketFormOpen] = useState(false);

  const initialNotifications: NotificationMsg[] = [];

  const [notifications, setNotifications] = useState<NotificationMsg[]>(() => {
    const saved = localStorage.getItem('gs_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const hideBottomMenu = activeTab === 'chat' || gigsFormOpen || seekersFormOpen || marketFormOpen;

  // --- UTC Clock State ---
  const [utcTime, setUtcTime] = useState<string>('');

  const addNotification = (title: string, message: string, type: NotificationMsg['type']) => {
    const newNotif: NotificationMsg = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      isRead: false,
      createdAt: 'Just now'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // --- Local Storage Synchronization & Theme Engine ---
  useEffect(() => {
    localStorage.setItem('gs_logged_in', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('gs_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('gs_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('gs_verification', JSON.stringify(verification));
  }, [verification]);

  useEffect(() => {
    localStorage.setItem('gs_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('gs_gigs', JSON.stringify(gigs));
  }, [gigs]);

  useEffect(() => {
    localStorage.setItem('gs_seekers', JSON.stringify(seekers));
  }, [seekers]);

  useEffect(() => {
    localStorage.setItem('gs_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('gs_market_items', JSON.stringify(marketItems));
  }, [marketItems]);

  useEffect(() => {
    localStorage.setItem('gs_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('gs_settings', JSON.stringify(settings));
    
    // Class name dark list toggle
    const root = window.document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings]);

  // Clock ticks
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsDropdownOpen(false);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // --- Handlers ---
  const handleDropdownToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(prev => !prev);
  };

  const handleHardReset = () => {
    // Clear all localStorage keys starting with gs_
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('gs_')) {
        localStorage.removeItem(key);
      }
    });

    // Reset all states
    setIsLoggedIn(false);
    setUserProfile({
      name: "",
      email: "",
      title: "",
      bio: "",
      skills: [],
      avatar: "",
      completedGigs: 0,
      rating: 0,
      privacy: 'public'
    });
    setVerification({
      status: 'not_started',
      fullName: '',
      documentType: 'passport',
      documentNumber: ''
    });
    setWallet({
      balance: 0,
      currency: 'COINS',
      transactions: [],
      referredUsers: []
    });
    setGigs([]);
    setSeekers([]);
    setChats([]);
    setMarketItems([]);
    setNotifications([]);
    setSettings({
      notificationsEnabled: true,
      emailAlerts: true,
      twoFactorAuth: false,
      profilePublic: true,
      theme: 'light'
    });
    setActiveTab('home');
    setActiveOverlay(null);
    
    // Optional: add a notification that reset happened
    addNotification('System Reset', 'All application data has been wiped and reset to zero.', 'promotion');
  };

  const handleOpenOverlay = (id: MenuFeatureId) => {
    setActiveOverlay(id);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('gigs');
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleAddGig = (newGig: Partial<Gig>) => {
    const gig: Gig = {
      id: `gig-${Date.now()}`,
      title: newGig.title || '',
      description: newGig.description || '',
      location: newGig.location || 'Remote',
      price: newGig.price || 0,
      images: newGig.images || [],
      authorName: userProfile.name,
      authorAvatar: userProfile.avatar,
      createdAt: 'Just now',
      category: newGig.category || 'Development',
      status: 'active'
    };
    setGigs(prev => [gig, ...prev]);
    addNotification('Gig Published', `Your gig "${gig.title}" is now live and visible to others.`, 'gig');
  };

  const handleUpdateGig = (updatedGig: Gig) => {
    setGigs(prev => prev.map(g => g.id === updatedGig.id ? updatedGig : g));
  };

  const handleDeleteGig = (id: string) => {
    setGigs(prev => prev.filter(g => g.id !== id));
  };

  const handleAddSeeker = (newSeeker: Partial<SeekerProfile>) => {
    const seeker: SeekerProfile = {
      id: `seeker-${Date.now()}`,
      name: newSeeker.name || '',
      professionalTitle: newSeeker.professionalTitle || '',
      location: newSeeker.location || '',
      website: newSeeker.website || '',
      bio: newSeeker.bio || '',
      avatar: newSeeker.avatar || '',
      rating: newSeeker.rating || 5.0,
      hourlyRate: newSeeker.hourlyRate || 0,
      activeJobsCount: newSeeker.activeJobsCount || 0,
      createdAt: new Date().toLocaleDateString()
    };
    setSeekers(prev => [seeker, ...prev]);
    addNotification('Profile Registered', `Your professional profile as "${seeker.professionalTitle}" has been created.`, 'seeker');
  };

  const handleUpdateSeeker = (updatedSeeker: SeekerProfile) => {
    setSeekers(prev => prev.map(s => s.id === updatedSeeker.id ? updatedSeeker : s));
  };

  const handleDeleteSeeker = (id: string) => {
    setSeekers(prev => prev.filter(s => s.id !== id));
  };

  const handleSendMessage = (threadId: string, messageText: string, sender: 'me' | 'other', mediaType?: 'image' | 'video', mediaUrl?: string) => {
    setChats(prev => prev.map(t => {
      if (t.id === threadId) {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sender,
          text: messageText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mediaType,
          mediaUrl
        };
        return {
          ...t,
          lastMessage: mediaType ? `[Sent ${mediaType}] ${messageText}` : messageText,
          lastActive: 'Just now',
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));
  };

  const handleDeleteMessage = (threadId: string, messageId: string) => {
    setChats(prev => prev.map(t => {
      if (t.id === threadId) {
        const updatedMessages = t.messages.filter(msg => msg.id !== messageId);
        return {
          ...t,
          lastMessage: updatedMessages.length > 0 ? updatedMessages[updatedMessages.length - 1].text : 'No messages',
          messages: updatedMessages
        };
      }
      return t;
    }));
  };

  const handleToggleLikeMessage = (threadId: string, messageId: string) => {
    setChats(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          messages: t.messages.map(msg => {
            if (msg.id === messageId) {
              return { ...msg, liked: !msg.liked };
            }
            return msg;
          })
        };
      }
      return t;
    }));
  };

  const handleReactMessage = (threadId: string, messageId: string, reaction: string | undefined) => {
    setChats(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          messages: t.messages.map(msg => {
            if (msg.id === messageId) {
              return { ...msg, reaction };
            }
            return msg;
          })
        };
      }
      return t;
    }));
  };

  const handleEditMessage = (threadId: string, messageId: string, newText: string) => {
    setChats(prev => prev.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          messages: t.messages.map(msg => {
            if (msg.id === messageId) {
              return { ...msg, text: newText, edited: true };
            }
            return msg;
          })
        };
      }
      return t;
    }));
  };

  const handleAddMarketItem = (newItem: Partial<MarketItem>) => {
    const item: MarketItem = {
      id: `item-${Date.now()}`,
      title: newItem.title || '',
      description: newItem.description || '',
      price: newItem.price || 0,
      category: newItem.category as any || 'UI Kit',
      images: newItem.images || [],
      sellerName: userProfile.name,
      sellerAvatar: userProfile.avatar,
      createdAt: 'Just now'
    };
    setMarketItems(prev => [item, ...prev]);
    addNotification('Item Listed', `Your asset "${item.title}" is now available in the market.`, 'market');
  };

  const handleUpdateMarketItem = (updatedItem: MarketItem) => {
    setMarketItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const handleDeleteMarketItem = (id: string) => {
    setMarketItems(prev => prev.filter(i => i.id !== id));
  };

  const handleContactSeller = (sellerName: string, sellerAvatar: string, defaultMessage?: string) => {
    const existingThread = (chats || []).find(t => t && t.participantName === sellerName);
    
    if (existingThread) {
      if (defaultMessage) {
        setChats(prev => prev.map(t => t.id === existingThread.id ? {
          ...t,
          lastMessage: defaultMessage,
          messages: [...t.messages, {
            id: `msg-${Date.now()}`,
            sender: 'me',
            text: defaultMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        } : t));
      }
      setActiveThreadId(existingThread.id);
    } else {
      const newThreadId = `chat-${Date.now()}`;
      const firstMessageText = defaultMessage || "Hi, I noticed you were interested in my listing. Let me know if you have any questions!";
      const newThread: ChatThread = {
        id: newThreadId,
        participantName: sellerName,
        participantAvatar: sellerAvatar,
        participantRole: 'Platform Member',
        lastMessage: firstMessageText,
        lastActive: "Just now",
        online: true,
        messages: [
          {
            id: `msg-${Date.now()}`,
            sender: defaultMessage ? 'me' : 'other',
            text: firstMessageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setChats(prev => [newThread, ...prev]);
      setActiveThreadId(newThreadId);
    }
    setActiveTab('chat');
    setForceMobileChatOpen(Date.now());

    // Simulate a reply notification after a short delay
    setTimeout(() => {
      addNotification('New Message', `${sellerName} replied to your inquiry.`, 'message');
    }, 5000);
  };

  const handleClearContacts = (threadIds?: string[]) => {
    if (threadIds && threadIds.length > 0) {
      setChats(prev => prev.filter(t => !threadIds.includes(t.id)));
      if (activeThreadId && threadIds.includes(activeThreadId)) {
        setActiveThreadId(null);
      }
    } else {
      setChats([]);
      setActiveThreadId(null);
    }
  };

  const getTabLabel = (id: TabId) => {
    switch (id) {
      case 'gigs': return 'GiGs';
      case 'seekers': return 'Seekers';
      case 'chat': return 'Chat';
      case 'market': return 'Market';
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans flex flex-col bg-slate-100 text-slate-900`} id="app-root">
      
      <AnimatePresence mode="wait">
        {showSplash ? (
          <motion.div
            key="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white"
            id="splash-screen"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <motion.h1 
                initial={{ opacity: 0, tracking: "0.2em" }}
                animate={{ opacity: 1, tracking: "0.05em" }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="text-5xl font-black tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-slate-400"
              >
                TimeGiG
              </motion.h1>
            </motion.div>
          </motion.div>
        ) : !isLoggedIn ? (
          /* --- LOGGED OUT WELCOME STATE --- */
          <motion.div 
            key="login-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 flex flex-col items-center justify-center p-6 max-w-lg mx-auto w-full text-center space-y-8"
            id="login-view"
          >
            <div className="space-y-4 flex flex-col items-center">
              <div className="space-y-2">
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-md mx-auto font-sans">
                  The sleek and secure digital escrow network bridging top-tier talent and active enterprise recruiters.
                </p>
              </div>
            </div>

            {/* Quick stats board */}
            <div className="grid grid-cols-3 gap-3 w-full bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">ACTIVE</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">842 Gigs</p>
              </div>
              <div className="border-x border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">SEEKERS</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">190 Corps</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">ESCROWED</p>
                <p className="text-lg font-bold text-emerald-500 mt-0.5">R5.4M</p>
              </div>
            </div>

            <div className="w-full space-y-3">
              <button 
                onClick={handleLogin}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center justify-center gap-2 cursor-pointer"
              >
                Authenticate Session
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                SYSTEM TIME: {utcTime || '2026-06-28 UTC'}
              </div>
            </div>
          </motion.div>
        ) : (
          /* --- LOGGED IN APPLICATION STATE --- */
          <motion.div 
            key="dashboard-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`flex-1 flex flex-col ${hideBottomMenu ? 'pb-0' : 'pb-28'}`}
            id="dashboard-view"
          >
            {/* --- TOP BAR HEADER --- */}
            <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                
                {/* Left: 3-Dot Dropdown Anchor */}
                <div className="relative">
                  <button 
                    onClick={handleDropdownToggle}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-black dark:text-white transition cursor-pointer"
                    id="dropdown-menu-button"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {/* DROPDOWN MENU */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden py-1.5 z-50"
                        id="dropdown-menu-list"
                      >
                        {/* Menu Item: userpro */}
                        <button 
                          onClick={() => handleOpenOverlay('userpro')}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-3 transition cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                          <div className="flex-1">
                            <span>User Profile</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-normal">Manage skills & portfolio</span>
                          </div>
                        </button>

                        {/* Menu Item: identity verification */}
                        <button 
                          onClick={() => handleOpenOverlay('identity_verification')}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-3 transition cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-slate-400" />
                          <div className="flex-1">
                            <span>Identity Verification</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-normal">Unlock secure gigs</span>
                          </div>
                        </button>

                        {/* Menu Item: wallet */}
                        <button 
                          onClick={() => handleOpenOverlay('wallet')}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-3 transition cursor-pointer"
                        >
                          <WalletIcon className="w-4 h-4 text-slate-400" />
                          <div className="flex-1">
                            <span>Wallet payouts</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-normal">Manage balances</span>
                          </div>
                        </button>

                        {/* Menu Item: settings */}
                        <button 
                          onClick={() => handleOpenOverlay('settings')}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center gap-3 transition cursor-pointer"
                        >
                          <SettingsIcon className="w-4 h-4 text-slate-400" />
                          <div className="flex-1">
                            <span>Settings</span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-normal">Toggles & configurations</span>
                          </div>
                        </button>

                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                        {/* Menu Item: logout */}
                        <button 
                          onClick={() => handleOpenOverlay('logout')}
                          className="w-full px-4 py-2.5 text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-3 transition cursor-pointer font-medium"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out Session</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Right: Quick states */}
                <div className="flex items-center gap-3">
                  {/* Admin Dashboard */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveOverlay('admin')}
                      className="p-2 relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-black dark:text-white transition cursor-pointer"
                      aria-label="Admin Dashboard"
                    >
                      <Activity className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Referral Program */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveOverlay('referral')}
                      className="p-2 relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-black dark:text-white transition cursor-pointer"
                      aria-label="Referral Program"
                    >
                      <Gift className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Notifications Overlay Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveOverlay('notifications')}
                      className="p-2 relative hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-black dark:text-white transition cursor-pointer"
                      aria-label="Notifications"
                    >
                      <Bell className="w-5 h-5" />
                      {notifications.filter(n => !n.isRead).length > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                      )}
                    </button>
                  </div>

                  {/* Verification Quick status */}
                  {verification.status === 'verified' ? (
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full font-mono uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                      Verified
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleOpenOverlay('identity_verification')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full font-mono uppercase tracking-wider border border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <ShieldAlert className="w-3 h-3" />
                      Unverified
                    </button>
                  )}
                </div>

              </div>
            </header>

            {/* --- MAIN NAVIGATION VIEW --- */}
            <main className="flex-1 max-w-4xl mx-auto px-4 py-6 w-full">
              {/* Header section explaining active tab purpose */}
              <div className="mb-8 flex flex-col gap-1 border-b border-slate-200 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-500 dark:text-indigo-400 font-mono uppercase tracking-[0.2em]">
                  <span>Platform Directory</span>
                  <span className="w-1 h-1 rounded-full bg-indigo-400" />
                  <span>{getTabLabel(activeTab)} Hub</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white font-sans mt-1">
                  {activeTab === 'gigs' && 'Explore Available Gigs'}
                  {activeTab === 'seekers' && 'Connect with Seekers'}
                  {activeTab === 'chat' && 'Inbox & Discussions'}
                  {activeTab === 'market' && 'Creative Assets Store'}
                </h1>
              </div>

              {/* Render Beautiful Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'gigs' && (
                    <GigsFeature 
                      gigs={gigs} 
                      onAddGig={handleAddGig}
                      onUpdateGig={handleUpdateGig}
                      onDeleteGig={handleDeleteGig}
                      userProfile={userProfile}
                      isVerified={verification.status === 'verified'} 
                      onVerifyClick={() => handleOpenOverlay('identity_verification')} 
                      onFormOpenChange={setGigsFormOpen}
                      onContactAuthor={handleContactSeller}
                    />
                  )}
                  {activeTab === 'seekers' && (
                    <SeekersFeature 
                      seekers={seekers} 
                      onAddSeeker={handleAddSeeker}
                      onUpdateSeeker={handleUpdateSeeker}
                      onDeleteSeeker={handleDeleteSeeker}
                      userProfile={userProfile}
                      isVerified={verification.status === 'verified'} 
                      onFormOpenChange={setSeekersFormOpen}
                      onContactSeeker={handleContactSeller}
                    />
                  )}
                  {activeTab === 'chat' && (
                    <ChatFeature 
                      threads={chats} 
                      onSendMessage={handleSendMessage} 
                      onDeleteMessage={handleDeleteMessage}
                      onToggleLikeMessage={handleToggleLikeMessage}
                      onReactMessage={handleReactMessage}
                      onEditMessage={handleEditMessage}
                      activeThreadId={activeThreadId} 
                      setActiveThreadId={setActiveThreadId} 
                      onExitChat={() => setActiveTab('gigs')}
                      forceMobileChatOpen={forceMobileChatOpen}
                      onClearContacts={handleClearContacts}
                    />
                  )}
                  {activeTab === 'market' && (
                    <MarketFeature 
                      items={marketItems} 
                      onAddItem={handleAddMarketItem}
                      onUpdateItem={handleUpdateMarketItem}
                      onDeleteItem={handleDeleteMarketItem}
                      userProfile={userProfile}
                      onContactSeller={handleContactSeller} 
                      onFormOpenChange={setMarketFormOpen}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* --- BOTTOM NAVIGATION BAR --- */}
            {!hideBottomMenu && (
              <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-3.5 z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] dark:shadow-none">
                <div className="max-w-lg mx-auto px-6 flex justify-between items-center">
                  
                  {/* Bottom Tab: Gigs */}
                  <button 
                    onClick={() => setActiveTab('gigs')}
                    className={`flex flex-col items-center gap-1.5 transition-all relative px-4 py-1 cursor-pointer group ${
                      activeTab === 'gigs' 
                        ? 'text-black dark:text-white font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    id="tab-gigs"
                  >
                    <div className={`p-2 rounded-2xl transition-colors ${
                      activeTab === 'gigs' 
                        ? 'bg-slate-100 dark:bg-slate-800' 
                        : 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'
                    }`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">GiGs</span>
                  </button>

                  {/* Bottom Tab: Seekers */}
                  <button 
                    onClick={() => setActiveTab('seekers')}
                    className={`flex flex-col items-center gap-1.5 transition-all relative px-4 py-1 cursor-pointer group ${
                      activeTab === 'seekers' 
                        ? 'text-black dark:text-white font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    id="tab-seekers"
                  >
                    <div className={`p-2 rounded-2xl transition-colors ${
                      activeTab === 'seekers' 
                        ? 'bg-slate-100 dark:bg-slate-800' 
                        : 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Seekers</span>
                  </button>

                  {/* Bottom Tab: Chat */}
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex flex-col items-center gap-1.5 transition-all relative px-4 py-1 cursor-pointer group ${
                      activeTab === 'chat' 
                        ? 'text-black dark:text-white font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    id="tab-chat"
                  >
                    <div className={`p-2 rounded-2xl transition-colors ${
                      activeTab === 'chat' 
                        ? 'bg-slate-100 dark:bg-slate-800' 
                        : 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'
                    }`}>
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
                  </button>

                  {/* Bottom Tab: Market */}
                  <button 
                    onClick={() => setActiveTab('market')}
                    className={`flex flex-col items-center gap-1.5 transition-all relative px-4 py-1 cursor-pointer group ${
                      activeTab === 'market' 
                        ? 'text-black dark:text-white font-bold' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                    id="tab-market"
                  >
                    <div className={`p-2 rounded-2xl transition-colors ${
                      activeTab === 'market' 
                        ? 'bg-slate-100 dark:bg-slate-800' 
                        : 'group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50'
                    }`}>
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Market</span>
                  </button>

                </div>
              </nav>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MENU MODALS / OVERLAYS CONTAINER --- */}
      <AnimatePresence>
        {activeOverlay && (
          <MenuOverlays 
            activeOverlay={activeOverlay}
            onClose={() => setActiveOverlay(null)}
            userProfile={userProfile}
            onUpdateProfile={(updated) => setUserProfile(updated)}
            verification={verification}
            onUpdateVerification={(updated) => setVerification(updated)}
            wallet={wallet}
            onUpdateWallet={(updated) => setWallet(updated)}
            settings={settings}
            onUpdateSettings={(updated) => setSettings(updated)}
            onLogoutConfirm={handleLogout}
            notifications={notifications}
            setNotifications={setNotifications}
            setActiveTab={setActiveTab}
            addNotification={addNotification}
            onHardReset={handleHardReset}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
