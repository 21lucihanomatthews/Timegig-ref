/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Wallet as WalletIcon, 
  Settings as SettingsIcon, 
  LogOut, 
  Sparkles, 
  Check, 
  Upload, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Bell, 
  Mail, 
  Lock, 
  Globe, 
  Eye, 
  AlertTriangle,
  Loader2,
  DollarSign,
  FileText,
  Gift,
  Coins,
  Activity,
  Users,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  EyeIcon,
  Clock,
  Briefcase,
  ShoppingBag,
  MessageSquare,
  Landmark,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MenuFeatureId, 
  UserProfile, 
  IdentityVerification, 
  Wallet, 
  AppSettings,
  Transaction,
  NotificationMsg,
  TabId
} from '../types';
import FullscreenViewer from './FullscreenViewer';

interface MenuOverlaysProps {
  activeOverlay: MenuFeatureId | null;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  verification: IdentityVerification;
  onUpdateVerification: (updated: IdentityVerification) => void;
  wallet: Wallet;
  onUpdateWallet: (updated: Wallet) => void;
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onLogoutConfirm: () => void;
  notifications?: NotificationMsg[];
  setNotifications?: React.Dispatch<React.SetStateAction<NotificationMsg[]>>;
  setActiveTab?: (tab: TabId) => void;
  addNotification?: (title: string, message: string, type: NotificationMsg['type']) => void;
  onHardReset?: () => void;
}

export default function MenuOverlays({
  activeOverlay,
  onClose,
  userProfile,
  onUpdateProfile,
  verification,
  onUpdateVerification,
  wallet,
  onUpdateWallet,
  settings,
  onUpdateSettings,
  onLogoutConfirm,
  onHardReset,
  notifications = [],
  setNotifications,
  setActiveTab,
  addNotification
}: MenuOverlaysProps) {
  
  // --- Profile state and edits ---
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>({ ...userProfile });
  const [newSkill, setNewSkill] = useState('');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountType: 'Savings'
  });
  const [isBankDetailsSubmitted, setIsBankDetailsSubmitted] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [referralError, setReferralError] = useState('');

  // --- Verification state and process ---
  const [verifyForm, setVerifyForm] = useState({
    fullName: verification.fullName || userProfile.name,
    documentType: verification.documentType || 'passport',
    documentNumber: verification.documentNumber || ''
  });
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; file?: File } | null>(null);
  const [isVerifyingProgress, setIsVerifyingProgress] = useState(false);
  const [verifyStep, setVerifyStep] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Wallet transactions state ---
  const [walletAmount, setWalletAmount] = useState('');
  const [walletActionType, setWalletActionType] = useState<'topup' | 'transfer' | 'receive' | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletError, setWalletError] = useState('');
  const [topupSelectedOption, setTopupSelectedOption] = useState<{coins: number, price: string, ref: string} | null>(null);
  const [isTopupReviewing, setIsTopupReviewing] = useState(false);
  const [topupProofFile, setTopupProofFile] = useState<{ name: string; size: string; file?: File } | null>(null);
  const topupFileInputRef = useRef<HTMLInputElement>(null);

  // --- Admin state ---
  const [adminProofViewerOpen, setAdminProofViewerOpen] = useState(false);
  const [adminProofUrl, setAdminProofUrl] = useState('');

  if (!activeOverlay) return null;

  // --- Profile Helpers ---
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profileForm.skills.includes(newSkill.trim())) {
      setProfileForm({
        ...profileForm,
        skills: [...profileForm.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfileForm({
      ...profileForm,
      skills: profileForm.skills.filter(s => s !== skillToRemove)
    });
  };

  // --- Verification Helpers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKB = Math.round(file.size / 1024);
      setUploadedFile({
        name: file.name,
        size: `${sizeKB} KB`,
        file: file
      });
    }
  };

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyForm.fullName || !verifyForm.documentNumber || !uploadedFile || !uploadedFile.file) {
      alert("Please fill all fields and attach a photocopy of your identity document.");
      return;
    }

    setIsVerifyingProgress(true);
    setVerifyStep("Uploading documents safely...");
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(uploadedFile.file);
      await new Promise<void>((resolve, reject) => {
        reader.onload = () => resolve();
        reader.onerror = error => reject(error);
      });
      const base64Image = reader.result as string;

      setVerifyStep("Running document OCR text match via AI scanner...");
      
      const response = await fetch('/api/verify-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageBase64: base64Image })
      });

      if (!response.ok) {
        throw new Error('Failed to verify document');
      }

      const result = await response.json();
      
      if (!result.isValid) {
        setIsVerifyingProgress(false);
        alert(`Verification Declined: ${result.reason}`);
        return;
      }

      setVerifyStep("Finalizing biometric token verification...");
      await new Promise(r => setTimeout(r, 800));

      onUpdateVerification({
        status: 'verified',
        fullName: verifyForm.fullName,
        documentType: verifyForm.documentType as any,
        documentNumber: verifyForm.documentNumber,
        submittedAt: new Date().toLocaleDateString()
      });
    } catch (err) {
      console.error(err);
      alert('An error occurred during verification.');
    } finally {
      setIsVerifyingProgress(false);
    }
  };

  // --- Wallet Helpers ---
  const handleTopupFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeKB = Math.round(file.size / 1024);
      setTopupProofFile({
        name: file.name,
        size: `${sizeKB} KB`,
        file: file
      });
      setWalletError('');
    }
  };

  const handleTopupSubmit = async () => {
    if (!topupSelectedOption) return;
    if (!topupProofFile) {
      setWalletError('Please upload your proof of payment before submitting.');
      return;
    }
    setWalletError('');
    setIsTopupReviewing(true);
    
    await new Promise(r => setTimeout(r, 2000));
    
    let proofUrl = '';
    if (topupProofFile.file) {
      const reader = new FileReader();
      reader.readAsDataURL(topupProofFile.file);
      await new Promise<void>((resolve) => {
        reader.onload = () => {
          proofUrl = reader.result as string;
          resolve();
        };
      });
    }

    const newTx: Transaction = {
      id: `TX-${Math.floor(Math.random() * 900000 + 100000)}`,
      type: 'credit',
      amount: topupSelectedOption.coins,
      description: `Top Up Coins (${topupSelectedOption.ref})`,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: 'pending' as any,
      proofUrl
    };

    onUpdateWallet({
      ...wallet,
      transactions: [newTx, ...wallet.transactions]
    });

    if (setNotifications) {
      setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        title: 'Top Up Under Review',
        message: `Your proof of payment for ${topupSelectedOption.coins} Coins has been received. Please allow a few minutes for verification.`,
        isRead: false,
        createdAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }, ...prev]);
    }

    setIsTopupReviewing(false);
    setTopupSelectedOption(null);
    setWalletActionType(null);
    setTopupProofFile(null);
  };

  const handleApproveTopup = (txId: string) => {
    const tx = wallet.transactions.find(t => t.id === txId);
    if (!tx || tx.status !== 'pending') return;

    onUpdateWallet({
      ...wallet,
      balance: wallet.balance + tx.amount,
      transactions: wallet.transactions.map(t => 
        t.id === txId ? { ...t, status: 'completed' } : t
      )
    });

    if (setNotifications) {
      setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        title: 'Top Up Approved',
        message: `Your payment was verified. ${tx.amount} Coins have been added to your wallet.`,
        isRead: false,
        type: 'wallet',
        createdAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }, ...prev]);
    }
  };

  const handleRejectTopup = (txId: string) => {
    onUpdateWallet({
      ...wallet,
      transactions: wallet.transactions.map(t => 
        t.id === txId ? { ...t, status: 'rejected' } : t
      )
    });

    if (setNotifications) {
      setNotifications(prev => [{
        id: `notif-${Date.now()}`,
        title: 'Top Up Rejected',
        message: `Your proof of payment for ${txId} was rejected. Please contact support.`,
        isRead: false,
        type: 'wallet',
        createdAt: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }, ...prev]);
    }
  };

  const handleWalletAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (walletActionType === 'receive') {
      setWalletActionType(null);
      return;
    }

    const parsedAmount = parseFloat(walletAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setWalletError('Please enter a valid positive decimal amount.');
      return;
    }

    if (walletActionType === 'transfer' && parsedAmount > wallet.balance) {
      setWalletError('Insufficient coins in your wallet.');
      return;
    }

    if (walletActionType === 'transfer' && !walletAddress) {
      setWalletError('Please enter a recipient address.');
      return;
    }

    const newTx: Transaction = {
      id: `TX-${Math.floor(Math.random() * 900000 + 100000)}`,
      type: walletActionType === 'topup' ? 'credit' : 'debit',
      amount: parsedAmount,
      description: walletActionType === 'topup' ? 'Topped up Coins' : `Transferred to ${walletAddress.substring(0, 8) || 'User'}`,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: 'completed'
    };

    const newBalance = walletActionType === 'topup' 
      ? wallet.balance + parsedAmount 
      : wallet.balance - parsedAmount;

    onUpdateWallet({
      ...wallet,
      balance: newBalance,
      transactions: [newTx, ...wallet.transactions]
    });

    setWalletAmount('');
    setWalletAddress('');
    setWalletActionType(null);
    setWalletError('');
  };

  // Render content depending on active selection
  const renderOverlayHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50 font-display">{title}</h3>
      </div>
      <button 
        onClick={onClose}
        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  const isFullScreen = activeOverlay === 'admin' || activeOverlay === 'referral';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isFullScreen ? 'p-0' : 'p-4'}`}>
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className={`relative bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-y-auto p-6 md:p-8 ${
          isFullScreen 
            ? 'w-full h-full max-w-none max-h-none rounded-none' 
            : 'rounded-3xl w-full max-w-lg max-h-[85vh]'
        }`}
      >
        
        {/* --- USER PROFILE overlay --- */}
        {activeOverlay === 'userpro' && (
          <div>
            {renderOverlayHeader('User Profile Details', <User className="w-5 h-5" />)}

            {!isEditingProfile ? (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <img 
                    src={userProfile.avatar} 
                    alt={userProfile.name} 
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm"
                  />
                  <div className="text-center sm:text-left space-y-1">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">{userProfile.name}</h4>
                      {verification.status === 'verified' && (
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded-full uppercase tracking-wider">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          Verified
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{userProfile.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{userProfile.email}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {userProfile.privacy === 'private' ? 'Private Profile' : 'Public Profile'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">Completed Gigs</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1 font-display">{userProfile.completedGigs}</p>
                  </div>
                  <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800/50 rounded-2xl text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-mono uppercase tracking-wider">Rating</p>
                    <p className="text-2xl font-bold text-amber-500 mt-1 font-display">★ {userProfile.rating.toFixed(1)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Professional Biography</h5>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/20 dark:bg-slate-800/10 p-3.5 rounded-xl border border-slate-100/50 dark:border-slate-800/30">
                    {userProfile.bio}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <h5 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Core Specialties</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {userProfile.skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      setProfileForm({ ...userProfile });
                      setIsEditingProfile(true);
                    }}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-sm transition"
                  >
                    Edit Profile Details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Professional Headline</label>
                  <input 
                    type="text" 
                    required
                    value={profileForm.title}
                    onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Brief Biography</label>
                  <textarea 
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Profile Privacy</label>
                  <select
                    value={profileForm.privacy || 'public'}
                    onChange={(e) => setProfileForm({ ...profileForm, privacy: e.target.value as 'public' | 'private' })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100 appearance-none"
                  >
                    <option value="public">Public (Visible to everyone)</option>
                    <option value="private">Private (Hidden from others)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Manage Specialties</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Next.js, Figma, Copywriting"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                    <button 
                      type="button"
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto p-1 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-850/50 rounded-lg">
                    {profileForm.skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg"
                      >
                        {skill}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-red-500 text-indigo-400"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* --- IDENTITY VERIFICATION overlay --- */}
        {activeOverlay === 'identity_verification' && (
          <div>
            {renderOverlayHeader('Identity Verification', <ShieldCheck className="w-5 h-5" />)}

            {verification.status === 'verified' ? (
              <div className="text-center py-6 space-y-5">
                <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full">
                  <ShieldCheck className="w-12 h-12 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">Account Verified</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Your profile contains a verified black-mark status badge.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl text-left border border-slate-150/50 dark:border-slate-800/60 max-w-sm mx-auto space-y-2 font-mono text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between"><span className="text-slate-400">STATUS:</span> <span className="font-semibold text-emerald-500">SECURE_MATCH_ACTIVE</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">LEGAL NAME:</span> <span className="font-semibold">{verification.fullName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">DOCUMENT ID:</span> <span className="font-semibold">•••• •••• {verification.documentNumber.slice(-4) || '7892'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">DATE APPROVED:</span> <span className="font-semibold">{verification.submittedAt}</span></div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={onClose}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition"
                  >
                    Done & Return
                  </button>
                </div>
              </div>
            ) : isVerifyingProgress ? (
              <div className="text-center py-12 space-y-6">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-950 animate-pulse" />
                  <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin absolute" />
                </div>
                <div className="space-y-2 max-w-xs mx-auto">
                  <h4 className="text-md font-semibold text-slate-800 dark:text-slate-100 font-display">Verifying Documents...</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">{verifyStep}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleStartVerification} className="space-y-5">
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 rounded-2xl p-4 flex gap-3 text-indigo-900 dark:text-indigo-300">
                  <FileText className="w-5 h-5 shrink-0 mt-0.5 text-indigo-500" />
                  <p className="text-xs leading-relaxed">
                    Identity Verification is required to sign service agreements, communicate directly with <strong>Talent Seekers</strong>, and unlock secure payout milestones.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Legal Name (Matches Government ID)</label>
                  <input 
                    type="text" 
                    required
                    value={verifyForm.fullName}
                    onChange={(e) => setVerifyForm({ ...verifyForm, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Document Type</label>
                    <select 
                      value={verifyForm.documentType}
                      onChange={(e) => setVerifyForm({ ...verifyForm, documentType: e.target.value })}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-700 dark:text-slate-300"
                    >
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="national_id">National ID Card</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Document Serial Number</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. F9283742"
                      value={verifyForm.documentNumber}
                      onChange={(e) => setVerifyForm({ ...verifyForm, documentNumber: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Simulated Drag & Drop Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Upload Photocopy</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="hidden" 
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/80 transition rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/20"
                  >
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <div className="inline-flex p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                          <Check className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs mx-auto">
                          {uploadedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {uploadedFile.size}
                        </p>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                          className="text-xs text-red-500 hover:underline font-medium"
                        >
                          Remove and replace
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="inline-flex p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500">
                          <Upload className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Click to browse identity files
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                          PNG, JPG or PDF up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={!uploadedFile}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition shadow-sm"
                  >
                    Submit Verification
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* --- WALLET overlay --- */}
        {activeOverlay === 'wallet' && (
          <div>
            {renderOverlayHeader('Coin Wallet', <Coins className="w-5 h-5" />)}

            <div className="space-y-6">
              {/* Coin Balance Card */}
              <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-500/20 overflow-hidden flex flex-col justify-center items-center text-center border border-amber-300/30">
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute left-0 bottom-0 w-24 h-24 bg-orange-600/20 rounded-full blur-xl pointer-events-none" />
                
                <Coins className="w-8 h-8 text-amber-100 mb-2 opacity-80" />
                <span className="text-sm text-amber-100 font-semibold mb-1 uppercase tracking-wider">Current Coin Balance</span>
                <div className="flex items-center gap-2">
                  <p className="text-5xl font-extrabold font-display">
                    {(wallet.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <span className="text-xl text-amber-100 font-bold self-end mb-1">Coins</span>
                </div>
              </div>

              {/* Quick Actions Form */}
              {walletActionType ? (
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
                      {walletActionType === 'topup' && <ArrowDownLeft className="w-4 h-4 text-emerald-500" />}
                      {walletActionType === 'transfer' && <ArrowUpRight className="w-4 h-4 text-indigo-500" />}
                      {walletActionType === 'receive' && <ArrowDownLeft className="w-4 h-4 text-emerald-500" />}
                      
                      {walletActionType === 'topup' && 'Top Up Coins'}
                      {walletActionType === 'transfer' && 'Transfer Coins'}
                      {walletActionType === 'receive' && 'Receive Coins'}
                    </h5>
                    <button 
                      type="button" 
                      onClick={() => { setWalletActionType(null); setWalletError(''); }}
                      className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  {walletActionType === 'receive' ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="inline-flex items-center justify-center w-40 h-40 bg-white border border-slate-200 rounded-2xl shadow-sm">
                        {/* Placeholder QR code */}
                        <div className="grid grid-cols-5 grid-rows-5 gap-1 w-24 h-24 opacity-20">
                          {Array.from({length: 25}).map((_, i) => (
                            <div key={i} className={`bg-slate-900 ${i % 2 === 0 || i % 3 === 0 ? 'rounded-sm' : 'opacity-0'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Your Receiving Address</p>
                        <p className="text-sm font-mono text-slate-800 dark:text-slate-200 font-bold break-all bg-slate-100 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                          GS-8A9F-2B4C-{userProfile.name.replace(/\s+/g, '').toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ) : walletActionType === 'topup' ? (
                    <div className="space-y-4">
                      {isTopupReviewing ? (
                        <div className="py-8 flex flex-col items-center justify-center space-y-4">
                          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Payment under review...</p>
                        </div>
                      ) : topupSelectedOption ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl text-amber-900 dark:text-amber-200 text-sm">
                            <p className="mb-2">Please transfer <strong className="text-amber-700 dark:text-amber-300">{topupSelectedOption.price}</strong> to the following bank account to receive <strong>{topupSelectedOption.coins} Coins</strong>.</p>
                            <div className="space-y-1 font-mono text-xs bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                              <div className="flex justify-between"><span className="text-slate-500">Bank:</span> <strong>Capitec</strong></div>
                              <div className="flex justify-between"><span className="text-slate-500">Account Name:</span> <strong>Matthews</strong></div>
                              <div className="flex justify-between"><span className="text-slate-500">Account Number:</span> <strong>1334067366</strong></div>
                              <div className="flex justify-between"><span className="text-slate-500">Reference:</span> <strong className="text-amber-600">{topupSelectedOption.ref}</strong></div>
                            </div>
                            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">Important: You must use the exact reference code above.</p>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Proof of Payment</label>
                            <input 
                              type="file" 
                              ref={topupFileInputRef}
                              onChange={handleTopupFileChange}
                              accept="image/*,application/pdf"
                              className="hidden" 
                            />
                            <div 
                              onClick={() => topupFileInputRef.current?.click()}
                              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500/80 transition rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-950/20"
                            >
                              {topupProofFile ? (
                                <div className="space-y-1">
                                  <div className="inline-flex p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate px-2">{topupProofFile.name}</p>
                                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">{topupProofFile.size}</p>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="inline-flex p-1.5 bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-lg">
                                    <ArrowUpRight className="w-5 h-5" />
                                  </div>
                                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Upload Receipt</p>
                                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">PDF or Image</p>
                                </div>
                              )}
                            </div>
                            {walletError && (
                              <p className="text-xs text-red-500 font-medium flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3" />
                                {walletError}
                              </p>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => {setTopupSelectedOption(null); setTopupProofFile(null); setWalletError('');}} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition cursor-pointer">Back</button>
                            <button onClick={handleTopupSubmit} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition shadow-sm cursor-pointer">Submit</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expire after 30 days</p>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                {coins: 50, price: 'R5,00', ref: '50c'},
                                {coins: 100, price: 'R10,00', ref: '100c'},
                                {coins: 200, price: 'R15,00', ref: '200c'},
                              ].map(opt => (
                                <button key={opt.ref} onClick={() => setTopupSelectedOption(opt)} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-amber-500 dark:border-amber-500 transition bg-white dark:bg-slate-900 cursor-pointer text-left">
                                  <span className="font-bold text-slate-800 dark:text-slate-100">{opt.coins} Coins</span>
                                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{opt.price}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expire after 60 days</p>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                                {coins: 500, price: 'R20,00', ref: '500c'},
                                {coins: 1000, price: 'R49,00', ref: '1000c'},
                              ].map(opt => (
                                <button key={opt.ref} onClick={() => setTopupSelectedOption(opt)} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-amber-500 dark:border-amber-500 transition bg-white dark:bg-slate-900 cursor-pointer text-left">
                                  <span className="font-bold text-slate-800 dark:text-slate-100">{opt.coins} Coins</span>
                                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{opt.price}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleWalletAction} className="space-y-4">
                      <div className="space-y-3">
                        <div className="relative">
                          <input 
                            type="text" 
                            required
                            placeholder="Recipient Address (e.g. GS-1234...)"
                            value={walletAddress}
                            onChange={(e) => { setWalletAddress(e.target.value); setWalletError(''); }}
                            className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 dark:text-slate-100 font-mono"
                          />
                        </div>
                        <div className="relative">
                          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500" />
                          <input 
                            type="number" 
                            required
                            step="1"
                            min="1"
                            placeholder="Amount of Coins"
                            value={walletAmount}
                            onChange={(e) => { setWalletAmount(e.target.value); setWalletError(''); }}
                            className="w-full pl-10 pr-4 py-3 text-lg font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-slate-800 dark:text-slate-100 font-mono"
                          />
                        </div>
                        {walletError && (
                          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {walletError}
                          </p>
                        )}
                      </div>

                      <button 
                        type="submit"
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition shadow-sm cursor-pointer"
                      >
                        Confirm Transfer
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setWalletActionType('topup')}
                    className="flex flex-col items-center justify-center gap-2 py-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-semibold rounded-2xl text-xs transition border border-emerald-100 dark:border-emerald-900/30"
                  >
                    <ArrowDownLeft className="w-5 h-5 mb-1" />
                    Top Up Bar
                  </button>
                  <button 
                    onClick={() => setWalletActionType('transfer')}
                    className="flex flex-col items-center justify-center gap-2 py-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold rounded-2xl text-xs transition border border-indigo-100 dark:border-indigo-900/30"
                  >
                    <ArrowUpRight className="w-5 h-5 mb-1" />
                    Transfer
                  </button>
                  <button 
                    onClick={() => setWalletActionType('receive')}
                    className="flex flex-col items-center justify-center gap-2 py-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-semibold rounded-2xl text-xs transition border border-amber-100 dark:border-amber-900/30"
                  >
                    <Coins className="w-5 h-5 mb-1" />
                    Receive
                  </button>
                </div>
              )}

              {/* Transactions list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Recent Transactions</h5>
                  <button
                    onClick={() => {
                      if (confirm('Reset your coin balance and recent transactions to 0?')) {
                        onUpdateWallet({
                          balance: 0,
                          currency: 'COINS',
                          transactions: [],
                          referredUsers: []
                        });
                        addNotification?.('Wallet Reset', 'Your coin balance has been reset to 0.', 'promotion');
                      }
                    }}
                    className="text-[10px] text-red-500 hover:text-red-600 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to R0
                  </button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1" tabIndex={0}>
                  {wallet.transactions.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400 dark:text-slate-500">
                      No transactions recorded.
                    </div>
                  ) : (
                    wallet.transactions.map((tx) => (
                      <div 
                        key={tx.id} 
                        className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800/60 rounded-xl"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${
                            tx.type === 'credit' 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                              : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            {tx.type === 'credit' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{tx.description}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{tx.date}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold font-mono ${
                          tx.type === 'credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}{(tx.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-[10px]">COINS</span>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SETTINGS overlay --- */}
        {activeOverlay === 'settings' && (
          <div>
            {renderOverlayHeader('System Settings', <SettingsIcon className="w-5 h-5" />)}

            <div className="space-y-6">
              {/* Profile Visibility */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-display">Public Search Availability</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Allow Seekers to find your profile publicly.</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdateSettings({ ...settings, profilePublic: !settings.profilePublic })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.profilePublic ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.profilePublic ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Theme Settings (Light / Dark toggle) */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex gap-3">
                  <Eye className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-display">App Dark Mode</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Toggle dark visual canvas contrast settings.</p>
                  </div>
                </div>
                <button 
                  onClick={() => onUpdateSettings({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Notification Toggles */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">Notification Channels</h5>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850/60 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Push Messages</span>
                    </div>
                    <button 
                      onClick={() => onUpdateSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${settings.notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${settings.notificationsEnabled ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-850/60 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Alerts</span>
                    </div>
                    <button 
                      onClick={() => onUpdateSettings({ ...settings, emailAlerts: !settings.emailAlerts })}
                      className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${settings.emailAlerts ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.75 transition-transform ${settings.emailAlerts ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hard Reset Button */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to reset everything? This will wipe all your data, transactions, and settings.')) {
                      onHardReset?.();
                    }
                  }}
                  className="w-full py-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-2xl hover:bg-red-100 dark:hover:bg-red-950/40 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Hard Reset App Data
                </button>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
                  This action is permanent and will reset all counters to zero.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* --- LOGOUT CONFIRMATION overlay --- */}
        {activeOverlay === 'logout' && (
          <div className="text-center py-4 space-y-6">
            <div className="inline-flex p-4 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-full">
              <LogOut className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-display">Confirm Account Sign-Out</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                You will need to re-authenticate with your security key to access your wallet payouts or gig contracts.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={onClose}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                No, Keep Session
              </button>
              <button 
                onClick={() => {
                  onLogoutConfirm();
                  onClose();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        )}

        {/* --- NOTIFICATIONS overlay --- */}
        {activeOverlay === 'notifications' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                Notifications
                <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-xs">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              </h3>
              {notifications.length > 0 && setNotifications && (
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs font-semibold text-slate-500 hover:text-red-500 transition cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar space-y-2" tabIndex={0}>
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                  <div className="inline-flex p-4 bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 rounded-full mb-3">
                    <Bell className="w-8 h-8" />
                  </div>
                  <p>You have no new notifications.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    onClick={() => {
                      if (setNotifications) {
                        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
                      }
                      if (setActiveTab) {
                        if (notif.type === 'gig') setActiveTab('gigs');
                        else if (notif.type === 'seeker') setActiveTab('seekers');
                        else if (notif.type === 'market') setActiveTab('market');
                        else if (notif.type === 'message') setActiveTab('chat');
                        else if (notif.type === 'wallet') setActiveTab('wallet' as any);
                      }
                      onClose();
                    }}
                    className={`p-3 rounded-lg border transition cursor-pointer flex gap-3 ${notif.isRead ? 'border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100' : 'border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm'}`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.type === 'gig' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' :
                      notif.type === 'seeker' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' :
                      notif.type === 'market' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' :
                      notif.type === 'message' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' :
                      notif.type === 'wallet' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {notif.type === 'gig' && <Briefcase className="w-4 h-4" />}
                      {notif.type === 'seeker' && <Users className="w-4 h-4" />}
                      {notif.type === 'market' && <ShoppingBag className="w-4 h-4" />}
                      {notif.type === 'message' && <MessageSquare className="w-4 h-4" />}
                      {notif.type === 'wallet' && <WalletIcon className="w-4 h-4" />}
                      {notif.type === 'promotion' && <Gift className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-xs font-semibold truncate ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 whitespace-nowrap ml-2 font-medium">
                          {notif.createdAt}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- ADMIN DASHBOARD overlay --- */}
        {activeOverlay === 'admin' && (
          <div className={isFullScreen ? 'max-w-5xl mx-auto pb-12' : ''}>
            {renderOverlayHeader('Admin Dashboard', <Activity className="w-5 h-5" />)}
            
            <div className="space-y-6">
              {/* Reset to R0 system controls */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-red-50/50 dark:bg-red-950/10 p-4 rounded-2xl border border-red-100/50 dark:border-red-900/20">
                <div>
                  <h4 className="text-xs font-bold text-red-850 dark:text-red-400 uppercase tracking-wider">System Controls</h4>
                  <p className="text-[10px] text-slate-500">Reset user balances, global supply, and admin profit to R0</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to reset user coin balance and all admin stats/pools to R0?')) {
                      onUpdateWallet({
                        balance: 0,
                        currency: 'COINS',
                        transactions: [],
                        referredUsers: []
                      });
                      addNotification?.('System Reset', 'All user balances, transactions, and pools have been successfully reset to zero.', 'promotion');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-red-500/10 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to R0
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <DollarSign className="w-6 h-6 text-slate-900 dark:text-slate-100 mb-2" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Admin Profit</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                    R{(wallet.transactions.filter(t => t.status === 'completed' && t.type === 'credit').reduce((sum, t) => sum + (t.amount / 10), 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {(wallet.transactions.filter(t => t.status === 'completed' && t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()} COINS (FEE)
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Gift className="w-6 h-6 text-slate-900 dark:text-slate-100 mb-2" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ref Pool</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                    R{(wallet.transactions.filter(t => t.status === 'completed' && t.type === 'credit').reduce((sum, t) => sum + (t.amount / 20), 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {(wallet.transactions.filter(t => t.status === 'completed' && t.type === 'credit').reduce((sum, t) => sum + (t.amount / 2), 0)).toLocaleString()} COINS
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Coins className="w-6 h-6 text-slate-900 dark:text-slate-100 mb-2" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Global Supply</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {(wallet.balance).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">ACTIVE COINS</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                  <Activity className="w-6 h-6 text-slate-900 dark:text-slate-100 mb-2" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Activity Log</p>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                    {wallet.transactions.length}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">TRANSACTIONS</p>
                </div>
                <div className="col-span-2 bg-slate-900 dark:bg-slate-50 border border-slate-800 dark:border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/10 dark:bg-slate-900/10 rounded-xl text-white dark:text-slate-900">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">5% Referral Bonus Pool</p>
                      <p className="text-lg font-black text-white dark:text-slate-900">
                        R{(wallet.transactions.filter(t => t.status === 'completed' && t.type === 'credit').reduce((sum, t) => sum + (t.amount / 20), 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-emerald-400 dark:text-emerald-600">Qualified: 0</p>
                    <p className="text-[8px] text-slate-500 uppercase">Top 10 Agents</p>
                  </div>
                </div>
              </div>

              {/* Referral Schedule Status */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Referral Program Window</h4>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">ACTIVE</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Monday 05:00 — Friday 17:00. Resets every weekend.
                </p>
              </div>

              {/* System Referrals Management */}
              <div className="bg-white dark:bg-slate-950 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">System Referrals</h4>
                    <p className="text-[10px] text-slate-500">Monitor global referral activity</p>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">
                    {(wallet.referredUsers || []).length} TOTAL
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(wallet.referredUsers || []).length === 0 ? (
                    <p className="py-4 text-xs text-slate-400 italic text-center">No active referrals recorded.</p>
                  ) : (
                    (wallet.referredUsers || []).map((user, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
                            {user.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user}</p>
                            <p className="text-[9px] text-slate-500">UID: REF_{idx + 1024}</p>
                          </div>
                        </div>
                        <span className="text-[9px] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-bold rounded-full uppercase">
                          Pending
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Top Top-up Users */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Top Top-up Users</h4>
                  <button className="text-[10px] text-slate-900 dark:text-slate-100 font-bold hover:underline">View All</button>
                </div>
                <div className="space-y-2">
                  {[].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-white font-bold text-xs`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{user.coins} COINS</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-slate-100">{user.amount}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Owe 5%: <span className="text-slate-900 dark:text-slate-100">R{user.bonus}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referrer Payouts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Referrer Payouts (Weekly)</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Resetting in 2d 4h</span>
                </div>
                <div className="space-y-2">
                  {[].map((ref, i) => (
                    <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center text-[10px] font-bold">
                            {ref.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{ref.name}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ref.refs >= 50 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'}`}>
                          {ref.refs} REFS
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">Reward</p>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">R{ref.milestonePay}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">10% Comm</p>
                          <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">R{ref.commission}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Owed</p>
                          <p className="text-sm font-black text-slate-900 dark:text-slate-100">R{ref.total}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
                  <Users className="w-5 h-5 text-blue-500 mb-1" />
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">0</p>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Active Users</p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
                  <Activity className="w-5 h-5 text-emerald-500 mb-1" />
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">0</p>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Online</p>
                </div>
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center text-center">
                  <Globe className="w-5 h-5 text-purple-500 mb-1" />
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-100">0</p>
                  <p className="text-[9px] font-semibold text-slate-500 uppercase">Visitors</p>
                </div>
              </div>

              {/* Pending Top-ups */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Pending Payments</h4>
                <div className="space-y-3">
                  {wallet.transactions.filter(t => t.status === 'pending').length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-400">
                      No pending top-up requests.
                    </div>
                  ) : (
                    wallet.transactions.filter(t => t.status === 'pending').map(tx => (
                      <div key={tx.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{tx.description}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{tx.id} • {tx.date}</p>
                          </div>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            +{(tx.amount ?? 0).toLocaleString()} <span className="text-[10px]">COINS</span>
                          </span>
                        </div>
                        
                        {tx.proofUrl && (
                          <div className="flex gap-2 items-center">
                            <button 
                              onClick={() => { setAdminProofUrl(tx.proofUrl!); setAdminProofViewerOpen(true); }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5" /> View Proof
                            </button>
                            <div className="flex-1" />
                            <button 
                              onClick={() => handleRejectTopup(tx.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition cursor-pointer"
                              title="Reject Payment"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleApproveTopup(tx.id)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition cursor-pointer"
                              title="Approve Payment"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- REFERRAL PROGRAM overlay --- */}
        {activeOverlay === 'referral' && (
          <div className={isFullScreen ? 'max-w-5xl mx-auto pb-12' : ''}>
            {renderOverlayHeader('Referral Program', <Gift className="w-5 h-5" />)}
            
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-400 mb-4">
                  <Gift className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Refer & Earn R100/Week</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                  Earn R100 weekly plus <span className="font-bold text-indigo-600 dark:text-indigo-400">10% commission</span> on all their coin top-ups!
                </p>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400">Closes: Friday 17:00</span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-500">Starts: Mon 05:00</span>
                </div>

                <div className="bg-white/50 dark:bg-slate-900/50 rounded-xl p-3 mb-6 text-left space-y-2 border border-indigo-50 dark:border-indigo-800/20">
                  <div className="flex items-start gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">Refer 50 users to join, register, and verify their ID.</p>
                  </div>
                  <div className="flex items-start gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">Referred users must top up with any coin amount.</p>
                  </div>
                  <div className="flex items-start gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">Only 10 spots available weekly (Monday - Friday).</p>
                  </div>
                  <div className="flex items-start gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">Cashout: Min 15–20 referrals required to withdraw any earnings.</p>
                  </div>
                  <div className="flex items-start gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">Partial Pay: Reach 50% (25 users) to get half pay (R50) + 10% top-up commission.</p>
                  </div>
                  <div className="flex items-start gap-2 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0" />
                    <p className="text-slate-600 dark:text-slate-400">R20+ Bonus: Referrals who top-up &gt; R20 receive 5% back from the top 10 referral agent pool.</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-1 text-left">Your Referral Link</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200 font-mono truncate text-left">
                        timegig.io/ref/
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText('https://timegig.io/ref/');
                      }}
                      className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                    >
                      Copy Link
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2 text-left">Refer a Person (Email or Name)</p>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Enter email or name..."
                        value={referralInput}
                        onChange={(e) => {
                          setReferralInput(e.target.value);
                          setReferralError('');
                        }}
                        className={`flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border ${referralError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-lg text-xs outline-none focus:border-indigo-500 transition-colors`}
                      />
                      <button 
                        onClick={() => {
                          if (!referralInput.trim()) return;
                          const normalized = referralInput.trim().toLowerCase();
                          if ((wallet.referredUsers || []).includes(normalized)) {
                            setReferralError('Already referred!');
                            return;
                          }
                          onUpdateWallet({
                            ...wallet,
                            referredUsers: [...(wallet.referredUsers || []), normalized]
                          });
                          setReferralInput('');
                          setReferralError('');
                          addNotification?.('Referral Sent', `You referred ${normalized} successfully.`, 'promotion');
                        }}
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white text-xs font-bold rounded-lg hover:opacity-90 transition"
                      >
                        Refer
                      </button>
                    </div>
                    {referralError && (
                      <p className="text-[10px] text-red-500 font-bold mt-1 text-left">{referralError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Tracking */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Your Progress</h4>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">{(wallet.referredUsers || []).length} / 50 REFS</span>
                </div>
                <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((wallet.referredUsers || []).length / 50) * 100)}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-medium">
                  <span className="text-slate-500">25 (R50 Milestone)</span>
                  <span className="text-slate-500">50 (R100 Milestone)</span>
                </div>
              </div>

              {/* Milestone Celebration & Bank Details */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6"
              >
                {/* Check if user has minimum referrals (setting to 20 for this demo context) */}
                {(wallet.referredUsers || []).length >= 20 ? (
                  <>
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">Congratulations!</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        You've reached the minimum referral threshold! You are now eligible for payouts.
                      </p>
                    </div>

                    {!isBankDetailsSubmitted ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Landmark className="w-4 h-4 text-slate-400" />
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Enter Payout Details</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          <input 
                            type="text" 
                            placeholder="Bank Name (e.g. Capitec, FNB)" 
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                          />
                          <input 
                            type="text" 
                            placeholder="Account Number" 
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                          />
                          <select 
                            className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500"
                            value={bankDetails.accountType}
                            onChange={(e) => setBankDetails({...bankDetails, accountType: e.target.value})}
                          >
                            <option>Savings</option>
                            <option>Cheque / Current</option>
                            <option>Transmission</option>
                          </select>
                        </div>
                        <button 
                          onClick={() => {
                            if (bankDetails.bankName && bankDetails.accountNumber) {
                              setIsBankDetailsSubmitted(true);
                              addNotification?.('Payout Details Saved', 'Your bank account has been securely saved for the weekly payout.', 'wallet');
                            }
                          }}
                          className="w-full py-3 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white font-bold rounded-xl transition shadow-lg shadow-slate-200 dark:shadow-none"
                        >
                          Save & Qualify for Payout
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-slate-900 dark:text-slate-100 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100">Details Received</p>
                          <p className="text-[10px] text-slate-500">Payout will be processed this Friday at 17:00.</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-full flex items-center justify-center mb-3">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">Almost There!</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      You need at least <span className="font-bold text-slate-900 dark:text-slate-100">20 referrals</span> to unlock payouts and enter your bank details.
                    </p>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                      <div className="h-full bg-slate-900 dark:bg-slate-50 transition-all duration-500" style={{ width: `${Math.min(100, ((wallet.referredUsers || []).length / 20) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </motion.div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent Referrals</h4>
                  <span className="text-[10px] text-slate-400 font-medium">Earned R0.00 this week</span>
                </div>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {(wallet.referredUsers || []).length === 0 ? (
                    <p className="p-4 text-xs text-slate-400 italic text-center">No referrals yet. Share your link or refer someone above!</p>
                  ) : (
                    (wallet.referredUsers || []).map((user, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                            {user.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{user}</p>
                            <p className="text-[9px] text-slate-500 uppercase font-mono">Status: Pending Verification</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600">+R0.00</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </motion.div>
      <FullscreenViewer 
        isOpen={adminProofViewerOpen} 
        onClose={() => setAdminProofViewerOpen(false)} 
        images={adminProofUrl ? [adminProofUrl] : []} 
        title="Proof of Payment"
      />
    </div>
  );
}
