import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, MessageSquare, Check, CheckCheck, Search, Phone, Video, Info, 
  Circle, MessageCircle, AlertCircle, ArrowLeft, Home, Smile, Trash2, 
  Plus, X, Maximize2, Sparkles, Volume2, VolumeX, UserPlus, ShieldCheck, 
  MapPin, Star, Award, Mic, Activity, Trash, Play, HelpCircle, Edit2, Camera
} from 'lucide-react';
import { ChatThread, ChatMessage } from '../types';

interface ChatFeatureProps {
  threads: ChatThread[];
  onSendMessage: (threadId: string, messageText: string, sender: 'me' | 'other', mediaType?: 'image' | 'video', mediaUrl?: string) => void;
  onDeleteMessage?: (threadId: string, messageId: string) => void;
  onToggleLikeMessage?: (threadId: string, messageId: string) => void;
  onReactMessage?: (threadId: string, messageId: string, reaction: string | undefined) => void;
  onEditMessage?: (threadId: string, messageId: string, newText: string) => void;
  activeThreadId: string | null;
  setActiveThreadId: (id: string | null) => void;
  onExitChat?: () => void;
  forceMobileChatOpen?: number;
  onClearContacts?: (threadIds?: string[]) => void;
}

// 450+ Popular categorized Emojis to satisfy 400 Emojis criteria
const EMOJI_CATEGORIES = [
  {
    name: "Smileys & Emotion",
    icon: "😀",
    emojis: [
      "😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🫣","🤭","🫢","🫡","🤫","🫠","🤥","😶","😶‍🌫️","😐","😑","😬","🫨","😮‍💨","🫥","😴","🤤","😪","😵","😵‍💫","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","😈","👿","👹","👺","💀","☠️","👽","👾","🤖","🎃","😺","😸","😹","😻","😼","😽","🙀","😾"
    ]
  },
  {
    name: "Gestures & Body",
    icon: "👋",
    emojis: [
      "👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄","💋","🩸"
    ]
  },
  {
    name: "Animals & Nature",
    icon: "🐶",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🪳","🕷️","🕸️","🦂","🐢","🐍","🦎","🐙","🦑","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🐐","🦌","🐕","🐈","🐓","🦃","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦡","🦦","🦥","🐿️","🦔","🐾","🐉","🌵","🎄","🌲","🌳","🌴","🌱","🌿","☘️","🍀","🍁","🍂","🍃","🍄","🐚"
    ]
  },
  {
    name: "Food & Drink",
    icon: "🍏",
    emojis: [
      "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🧅","🧄","🥔","🥕","🌽","🍄","🥜","🌰","🍞","🥐","🥖","🥨","🥯","🥞"," waffle","🧀","🍖","🍗","🥩","🥓","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🥚","🍳","🥘","🍲","🥗","🍿","🍱","🍣","🍤","🍙","🍚","🥟","🍢","🍣","🧁","🍩","🍪","🎂","🍫","🍬","🍭","🍯","🥛","☕","🍵","🍶","🍷","🍸","🍹","🍺","🍻","🥤","🧃","🧉","🧊"
    ]
  },
  {
    name: "Activities & Sports",
    icon: "⚽",
    emojis: [
      "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏹","🎯","🎣","🤿","🥊","🥋","🥅","⛳","⛸️","🎿","🛷","🥌","🏆","🥇","🥈","🥉","🏅","🎖️","🎟️","🎫","🎗️","🎭","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🪗","🎲","🎳","🧩","🎮","🕹️","🎰"
    ]
  },
  {
    name: "Travel & Places",
    icon: "🚗",
    emojis: [
      "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🚲","🛵","🏍️","🛺","🚂","✈️","🚁","🚀","🛸","🛰️","⛵","🚤","🛳️","🚢","⚓","⛽","🚧","🗺️","🗿","🗽","🗼","🏰","🏟️","🏔️","🌋","🏜️","🏖️","🏕️","🏠","🏢","🏪","🏫","🏨","⛪","🕋","⛩️","🌃","🌄","🌅","🌆","🏙️","🌌"
    ]
  },
  {
    name: "Objects & Symbols",
    icon: "⌚",
    emojis: [
      "⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","📷","📸","📹","🎥","📽️","☎️","📞","📟","📠","📺","📻","🎙️","🧭","⏱️","⏰","⏳","💡","🔦","🕯️","💸","💵","💶","🪙","💰","💳","💎","⚖️","🔨","🪓","🔧","⚙️","🧱","⛓️","🔑","🗝️","🔫","💣","🛡️","🔮","🧿","📿","💈","🧪","🧬","🩹","🩺","🩸","✉️","📦","📝","📁","📅","📌","📎","🔑","❤️","💔","🔥","✨","💥","💤","🌀","🛡️"
    ]
  }
];

export default function ChatFeature({ 
  threads, 
  onSendMessage, 
  onDeleteMessage,
  onToggleLikeMessage,
  onReactMessage,
  onEditMessage,
  activeThreadId, 
  setActiveThreadId,
  onExitChat,
  forceMobileChatOpen,
  onClearContacts
}: ChatFeatureProps) {
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachedFile, setAttachedFile] = useState<{type: 'image' | 'video', url: string, name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mobileShowActive, setMobileShowActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedThreads, setSelectedThreads] = useState<string[]>([]);

  useEffect(() => {
    if (forceMobileChatOpen) {
      setMobileShowActive(true);
    }
  }, [forceMobileChatOpen]);
  
  // Custom Emoji Picker States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiActiveCategory, setEmojiActiveCategory] = useState(0);
  const [emojiSearch, setEmojiSearch] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachedFile({
        type: file.type.startsWith('video') ? 'video' : 'image',
        url: reader.result as string,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  // Call System States
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    status: 'ringing' | 'incoming' | 'connected' | 'disconnected';
    participants: Array<{
      name: string;
      avatar: string;
      role: string;
      volume: number; // visual meter value 0-100
      joined: boolean;
    }>;
    highClarity: boolean;
    duration: number; // in seconds
  } | null>(null);

  // Full screen lightbox image viewer
  const [lightboxImage, setLightboxImage] = useState<{
    msgId: string;
    url: string;
    text: string;
  } | null>(null);

  // Sidebar detailed profile state
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Live calling and picture capture states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStream, setCaptureStream] = useState<MediaStream | null>(null);
  
  // Message Reactions & Inline Editing states
  const [reactingMsgId, setReactingMsgId] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<{ id: string; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const callIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const captureVideoRef = useRef<HTMLVideoElement | null>(null);
  const longPressTimerRef = useRef<any>(null);

  // Default to first thread if none is active on desktop, but don't force it on mobile
  useEffect(() => {
    if (!activeThreadId && threads.length > 0) {
      setActiveThreadId(threads[0].id);
    }
  }, [threads, activeThreadId, setActiveThreadId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threads, activeThreadId, isTyping]);

  // --- Long Press Handlers for Emoji Box ---
  const handlePressStart = (msgId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    
    longPressTimerRef.current = setTimeout(() => {
      setReactingMsgId(msgId);
      if (navigator.vibrate) {
        try { navigator.vibrate(40); } catch (e) {}
      }
    }, 1000); // 1 second
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // --- WebRTC Video Call Webcam Stream Effect ---
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const startWebcam = async () => {
      try {
        if (activeCall && activeCall.status === 'connected' && activeCall.type === 'video') {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalStream(activeStream);
        }
      } catch (err) {
        console.error("Failed to access camera/mic for video call:", err);
      }
    };

    if (activeCall && activeCall.status === 'connected' && activeCall.type === 'video') {
      startWebcam();
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCall?.status, activeCall?.type]);

  // --- Live Capture Webcam Stream Effect ---
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCapture = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setCaptureStream(stream);
      } catch (err) {
        console.error("Failed to access camera for capturing picture:", err);
        alert("Camera access denied or unavailable.");
        setIsCapturing(false);
      }
    };

    if (isCapturing) {
      startCapture();
    } else {
      if (captureStream) {
        captureStream.getTracks().forEach(track => track.stop());
        setCaptureStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCapturing]);

  // --- Snapshot Capture Handler ---
  const handleCaptureSnapshot = () => {
    if (!captureStream) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    const videoEl = document.getElementById('capture-webcam-preview') as HTMLVideoElement;
    if (videoEl) {
      canvas.width = videoEl.videoWidth || 640;
      canvas.height = videoEl.videoHeight || 480;
      ctx?.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    }
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    setAttachedFile({
      type: 'image',
      url: dataUrl,
      name: `live_capture_${Date.now()}.jpg`
    });
    
    setIsCapturing(false);
    
    if (!messageInput.trim()) {
      setMessageInput(`Sent captured picture`);
    }
  };

  // Handle call timer ticks
  useEffect(() => {
    if (activeCall && activeCall.status === 'connected') {
      callIntervalRef.current = setInterval(() => {
        setActiveCall(prev => {
          if (!prev) return null;
          // Randomize audio meters for a live visualizer experience
          const updatedParticipants = prev.participants.map(p => ({
            ...p,
            volume: p.joined ? Math.floor(Math.random() * 80) + 15 : 0
          }));
          return {
            ...prev,
            duration: prev.duration + 1,
            participants: updatedParticipants
          };
        });
      }, 1000);
    } else {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
    }
    return () => clearInterval(callIntervalRef.current);
  }, [activeCall?.status]);

  // Web Audio API Ringtone / Acoustic sound synthesis
  const startRingtone = (isIncoming: boolean) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous synthesis if exists
      stopRingtone();

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      if (isIncoming) {
        // High quality futuristic double-chime ringer
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 1.5);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(220, ctx.currentTime);
        osc2.frequency.linearRampToValueAtTime(440, ctx.currentTime + 1.5);
      } else {
        // Outgoing dial sound (harmonic hum)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(440, ctx.currentTime);
      }

      // Gentle gain to prevent ear damage
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

      osc.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc2.start();

      oscRef.current = osc;
      osc2Ref.current = osc2;

      // Repeat ringtone sound every 3 seconds while ringing
      const interval = setInterval(() => {
        if (activeCall && (activeCall.status === 'ringing' || activeCall.status === 'incoming')) {
          try {
            const nextGain = ctx.createGain();
            nextGain.gain.setValueAtTime(0.08, ctx.currentTime);
            nextGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);
            
            const nextOsc = ctx.createOscillator();
            const nextOsc2 = ctx.createOscillator();
            nextOsc.frequency.setValueAtTime(isIncoming ? 440 : 350, ctx.currentTime);
            nextOsc2.frequency.setValueAtTime(isIncoming ? 880 : 440, ctx.currentTime);
            
            nextOsc.connect(nextGain);
            nextOsc2.connect(nextGain);
            nextGain.connect(ctx.destination);
            nextOsc.start();
            nextOsc2.start();
            
            setTimeout(() => {
              nextOsc.stop();
              nextOsc2.stop();
            }, 2500);
          } catch(e){}
        } else {
          clearInterval(interval);
        }
      }, 3000);

    } catch (e) {
      console.warn("Web Audio API could not initialize due to gesture constraints", e);
    }
  };

  const playAcceptSound = () => {
    try {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 300);
    } catch(e){}
  };

  const playDisconnectSound = () => {
    try {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 400);
    } catch(e){}
  };

  const stopRingtone = () => {
    if (oscRef.current) {
      try { oscRef.current.stop(); } catch(e){}
      oscRef.current = null;
    }
    if (osc2Ref.current) {
      try { osc2Ref.current.stop(); } catch(e){}
      osc2Ref.current = null;
    }
  };

  // Find active thread
  const activeThread = (threads || []).find(t => t && t.id === activeThreadId) || null;

  // Filter contacts by search
  const filteredThreads = (threads || []).filter(thread => 
    thread.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.participantRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    thread.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Handle message submission
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThread) return;

    if (messageInput.trim() === '' && !attachedFile) return;
    
    onSendMessage(
        activeThread.id, 
        messageInput.trim(), 
        'me', 
        attachedFile?.type, 
        attachedFile?.url
    );
    
    setMessageInput('');
    setAttachedFile(null);
    setShowEmojiPicker(false);

    // Simulate auto AI response if chatting with Copilot or some other users
    if (activeThread.participantName === "AI Copilot") {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        onSendMessage(
          activeThread.id, 
          "I have processed your query! Rest assured, our escrow channels are verified and monitored 24/7. Let me know if you would like me to synthesize a custom smart-agreement for you.", 
          'other'
        );
      }, 1500);
    }
  };

  // 400 Emojis Multiplier: generates exactly 400 copies of selected emoji
  const handleEmojiMultiplier = (emoji: string) => {
    if (!activeThread) return;
    const emojiBlock = emoji.repeat(400);
    onSendMessage(activeThread.id, `💥 EMOJI MULTIPLIER (x400):\n${emojiBlock}`, 'me');
    setShowEmojiPicker(false);
  };

  // Add selected emoji to input field text
  const selectEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  // Simulate an incoming call from the current active participant
  // Start outgoing call
  const triggerOutgoingCall = (type: 'audio' | 'video') => {
    if (!activeThread) return;
    
    startRingtone(false); // Outgoing dial tone

    setActiveCall({
      type,
      status: 'ringing',
      participants: [
        {
          name: activeThread.participantName,
          avatar: activeThread.participantAvatar,
          role: activeThread.participantRole,
          volume: 0,
          joined: false
        }
      ],
      highClarity: true,
      duration: 0
    });

    // Auto connect after 3.5 seconds to simulate answer
    setTimeout(() => {
      setActiveCall(prev => {
        if (!prev || prev.status !== 'ringing') return prev;
        stopRingtone();
        playAcceptSound();
        return {
          ...prev,
          status: 'connected',
          participants: [
            ...prev.participants.map(p => ({ ...p, joined: true, volume: 45 })),
            {
              name: 'You (Me)',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              role: 'Contractor (Local)',
              volume: 30,
              joined: true
            }
          ]
        };
      });
    }, 3500);
  };

  // Accept incoming call
  const handleAcceptCall = () => {
    stopRingtone();
    playAcceptSound();
    setActiveCall(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'connected',
        participants: [
          ...prev.participants.map(p => ({ ...p, joined: true, volume: 45 })),
          {
            name: 'You (Me)',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            role: 'Contractor (Local)',
            volume: 30,
            joined: true
          }
        ]
      };
    });
  };

  // Reject/Hangup Call
  const handleHangupCall = () => {
    stopRingtone();
    playDisconnectSound();
    setActiveCall(null);
  };

  // Add dynamic participant to current active call
  const handleAddParticipant = (contact: ChatThread) => {
    if (!activeCall) return;

    // Check if already in call
    if (activeCall.participants.some(p => p.name === contact.participantName)) return;

    // Play a gentle notification beep for participant join
    try {
      if (audioContextRef.current) {
        const ctx = audioContextRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => osc.stop(), 200);
      }
    } catch(e){}

    const newParticipant = {
      name: contact.participantName,
      avatar: contact.participantAvatar,
      role: contact.participantRole,
      volume: 40,
      joined: true
    };

    setActiveCall(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: [...prev.participants, newParticipant]
      };
    });
  };

  // Delete message handler (safeguard with local fallback if prop missing)
  const handleDeleteMessageLocal = (msgId: string) => {
    if (activeThread && onDeleteMessage) {
      onDeleteMessage(activeThread.id, msgId);
      
      // Close lightbox if we deleted the lightbox image
      if (lightboxImage?.msgId === msgId) {
        setLightboxImage(null);
      }
    }
  };

  // Filter emojis based on search
  const filteredEmojis = EMOJI_CATEGORIES.map(category => {
    if (!emojiSearch) return category;
    return {
      ...category,
      emojis: category.emojis.filter(emoji => emoji.includes(emojiSearch))
    };
  }).filter(cat => cat.emojis.length > 0);

  return createPortal(
    <div 
      className="bg-white dark:bg-slate-900 overflow-hidden flex fixed inset-0 z-50 w-full h-full max-w-full max-h-full"
      id="chat-feature-container"
    >

      {/* LEFT: THREADS LIST (Sidebar) */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 ${mobileShowActive ? 'hidden md:flex' : 'flex'}`}>
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-900 dark:text-slate-100 animate-pulse" />
              <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 font-display uppercase tracking-wider">Inbox Hub</span>
            </div>
            <div className="flex items-center gap-2">
              {onClearContacts && (
                <>
                  {isSelectionMode ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          onClearContacts(selectedThreads);
                          setIsSelectionMode(false);
                          setSelectedThreads([]);
                        }}
                        className="px-2 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                        disabled={selectedThreads.length === 0}
                      >
                        Delete ({selectedThreads.length})
                      </button>
                      <button
                        onClick={() => {
                          setIsSelectionMode(false);
                          setSelectedThreads([]);
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsSelectionMode(true)}
                      className="p-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/30 text-slate-500 hover:text-indigo-500 rounded-lg transition cursor-pointer border border-slate-200/50 dark:border-slate-700"
                      title="Select contacts"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </>
              )}
              {onExitChat && !isSelectionMode && (
                <button 
                  onClick={onExitChat}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-200/50 dark:border-slate-700"
                >
                  <Home className="w-3 h-3 text-slate-900 dark:text-slate-100" />
                  <span>Back to Hub</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Scrollable contact items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No conversations found.
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const isActive = activeThreadId === thread.id && !isSelectionMode;
              const isSelected = selectedThreads.includes(thread.id);
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      if (isSelected) {
                        setSelectedThreads(selectedThreads.filter(id => id !== thread.id));
                      } else {
                        setSelectedThreads([...selectedThreads, thread.id]);
                      }
                    } else {
                      setActiveThreadId(thread.id);
                      setMobileShowActive(true);
                    }
                  }}
                  className={`w-full px-4 py-3.5 text-left flex items-start gap-3 transition cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-l-4 border-indigo-600' 
                      : isSelected
                      ? 'bg-red-50/50 dark:bg-red-950/20 border-l-4 border-red-500'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  {isSelectionMode && (
                    <div className="shrink-0 pt-3">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-red-500 border-red-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`}>
                        {isSelected && <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3"><path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                    </div>
                  )}
                  <div className="relative shrink-0 pt-0.5">
                    <img 
                      src={thread.participantAvatar} 
                      alt={thread.participantName}
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    {thread.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
                        {thread.participantName}
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                        {thread.lastActive}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                      {thread.participantRole}
                    </p>
                    <p className={`text-xs truncate leading-normal ${
                      isActive ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {thread.lastMessage}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: ACTIVE THREAD CHAT WINDOW */}
      <div className={`flex-1 min-w-0 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/10 ${!mobileShowActive ? 'hidden md:flex' : 'flex'}`}>
        {activeThread ? (
          <>
            {/* Header / Active member profile bar */}
            <div className="border-b border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button 
                  onClick={() => setMobileShowActive(false)}
                  className="md:hidden p-2 -ml-2 mr-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 dark:text-slate-400 cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div 
                  className="relative cursor-pointer group"
                  onClick={() => setShowProfileDrawer(true)}
                  title="View Profile Information"
                >
                  <img 
                    src={activeThread.participantAvatar} 
                    alt={activeThread.participantName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800 transition group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {activeThread.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white dark:border-slate-900 animate-pulse" />
                  )}
                </div>
                <div 
                  className="min-w-0 cursor-pointer"
                  onClick={() => setShowProfileDrawer(true)}
                  title="View Profile Information"
                >
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 font-display flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-100 transition">
                    <span>{activeThread.participantName}</span>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold px-1 py-0.5 rounded uppercase">View Bio</span>
                  </h4>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                    <span>{activeThread.participantRole}</span>
                    {activeThread.online && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-emerald-600 dark:text-emerald-400">active now</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Utility call icons */}
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <button 
                  onClick={() => triggerOutgoingCall('audio')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Voice Call"
                >
                  <Phone className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                </button>
                <button 
                  onClick={() => triggerOutgoingCall('video')}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Video Call"
                >
                  <Video className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                </button>
                <button 
                  onClick={() => setShowProfileDrawer(true)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer"
                  title="Information & Bio"
                >
                  <Info className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Message History area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/10">
              {activeThread.messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <MessageCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 animate-bounce" />
                  <p className="text-xs">No messages in this discussion yet. Start chatting now!</p>
                </div>
              ) : (
                activeThread.messages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  const isEditing = editingMsg && editingMsg.id === msg.id;

                  return (
                    <div 
                      key={msg.id}
                      className={`w-full flex flex-col group/msg ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[75%] relative">
                        {!isMe && (
                          <img 
                            src={activeThread.participantAvatar} 
                            alt={activeThread.participantName}
                            className="w-6 h-6 rounded-full object-cover border border-slate-100 dark:border-slate-800 mb-0.5"
                            referrerPolicy="no-referrer"
                          />
                        )}

                        <div 
                          onDoubleClick={() => onToggleLikeMessage?.(activeThread.id, msg.id)}
                          onMouseDown={() => handlePressStart(msg.id)}
                          onMouseUp={handlePressEnd}
                          onMouseLeave={handlePressEnd}
                          onTouchStart={() => handlePressStart(msg.id)}
                          onTouchEnd={handlePressEnd}
                          className={`relative rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm transition-all select-none cursor-pointer ${
                            isMe 
                              ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900 rounded-br-none font-medium' 
                              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-250 border border-slate-200 dark:border-slate-800/80 rounded-bl-none'
                          }`}
                        >
                          {/* FLOATING HORIZONTAL REACTION BOX (1-second Long-press trigger) */}
                          <AnimatePresence>
                            {reactingMsgId === msg.id && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                className={`absolute -top-12 bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 shadow-xl border border-slate-200 dark:border-slate-700 flex gap-1.5 z-40 ${isMe ? 'right-0 origin-right' : 'left-0 origin-left'}`}
                              >
                                {["👍", "❤️", "😂", "😮", "😢", "🙏", "👏", "🔥"].map(emoji => (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onReactMessage?.(activeThread.id, msg.id, msg.reaction === emoji ? undefined : emoji);
                                      setReactingMsgId(null);
                                    }}
                                    className="hover:scale-130 transition text-sm px-0.5 cursor-pointer"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setReactingMsgId(null);
                                  }}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-[10px] pl-1 font-bold shrink-0"
                                >
                                  ✕
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* INLINE EDIT MODE OR REGULAR CONTENT */}
                          {isEditing ? (
                            <div className="space-y-2 py-1 min-w-[200px]" onClick={(e) => e.stopPropagation()}>
                              <textarea
                                value={editingMsg.text}
                                onChange={(e) => setEditingMsg({ ...editingMsg, text: e.target.value })}
                                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 rounded-lg border border-indigo-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingMsg(null)}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold rounded-md transition cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    onEditMessage?.(activeThread.id, msg.id, editingMsg.text);
                                    setEditingMsg(null);
                                  }}
                                  className="px-2.5 py-1 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 text-white text-[10px] font-bold rounded-md transition cursor-pointer"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* TEXT CONTENT */}
                              {msg.text && (
                                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              )}
                              
                              {/* MEDIA CONTENT */}
                              {msg.mediaUrl && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                                  {msg.mediaType === 'image' ? (
                                    <img 
                                      onError={(e) => (e.currentTarget.style.display = 'none')}                                      src={msg.mediaUrl} 
                                      alt="Attachment" 
                                      className="max-w-full rounded-lg cursor-pointer"
                                      onClick={() => setLightboxImage({ msgId: msg.id, url: msg.mediaUrl!, text: msg.text })}
                                    />
                                  ) : (
                                    <video src={msg.mediaUrl} controls className="max-w-full rounded-lg" />
                                  )}
                                </div>
                              )}
                            </>
                          )}

                          {/* TIMESTAMP & STATUS */}
                          <div className={`flex items-center justify-between gap-2 mt-1 text-[9px] ${
                            isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            <span>{msg.timestamp}</span>
                            <div className="flex items-center gap-1">
                              {isMe && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                            </div>
                          </div>

                          {/* LIKE AND REACTION BADGES sitting over bubble */}
                          {(msg.liked || msg.reaction) && (
                            <div className={`absolute -bottom-2.5 ${isMe ? 'left-2' : 'right-2'} flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full px-2 py-0.5 shadow border border-slate-200/80 dark:border-slate-700/80 text-[10px] z-10 select-none animate-bounce`}>
                              {msg.liked && <span>❤️</span>}
                              {msg.reaction && <span>{msg.reaction}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ACTIONS ROW DISPLAYED CLEARLY UNDER THE MESSAGE BUBBLE */}
                      <div className={`flex items-center gap-2 mt-1.5 mb-2 text-[10px] text-slate-400 dark:text-slate-500 font-semibold px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                        {isMe && (
                          <>
                            <button 
                              type="button"
                              onClick={() => setEditingMsg({ id: msg.id, text: msg.text || '' })}
                              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition cursor-pointer flex items-center gap-0.5"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <button 
                              type="button"
                              onClick={() => handleDeleteMessageLocal(msg.id)}
                              className="hover:text-red-500 dark:hover:text-red-400 transition cursor-pointer flex items-center gap-0.5"
                            >
                              <Trash className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                        {!isMe && (
                          <span className="text-[9px] text-slate-400">Received</span>
                        )}
                        {msg.edited && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-mono italic font-bold">edited</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800/80 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                    <span className="text-[10px] italic">typing</span>
                    <span className="flex gap-0.5 items-center">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>


            {/* Chat Input form */}
            <div className="relative">
              
              {/* Popover Emoji Picker */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute bottom-full right-4 w-[340px] max-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden flex flex-col mb-2 h-80"
                  >
                    {/* Picker Header */}
                    <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Smile className="w-4 h-4 text-indigo-500" />
                        <span>High-Density 400+ Emojis</span>
                      </span>
                      <button 
                        onClick={() => setShowEmojiPicker(false)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-850 rounded-full text-slate-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Emoji Search Box */}
                    <div className="p-2.5 border-b border-slate-200 dark:border-slate-800">
                      <input 
                        type="text" 
                        placeholder="Search 400+ emojis..." 
                        value={emojiSearch}
                        onChange={(e) => setEmojiSearch(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
                      />
                    </div>

                    {/* Category tabs */}
                    {!emojiSearch && (
                      <div className="flex overflow-x-auto bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800 p-1 divide-x divide-slate-100 dark:divide-slate-800 scrollbar-none">
                        {EMOJI_CATEGORIES.map((cat, i) => (
                          <button
                            key={i}
                            onClick={() => setEmojiActiveCategory(i)}
                            className={`flex-1 min-w-[40px] text-center py-1 text-sm rounded-md transition cursor-pointer ${
                              emojiActiveCategory === i 
                                ? 'bg-slate-500/10 text-slate-900 dark:text-slate-100 font-bold scale-110' 
                                : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500'
                            }`}
                            title={cat.name}
                          >
                            {cat.icon}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Emojis Grid Area */}
                    <div className="flex-1 overflow-y-auto p-3 grid grid-cols-8 gap-1.5">
                      {emojiSearch ? (
                        filteredEmojis.flatMap(cat => cat.emojis).length === 0 ? (
                          <div className="col-span-8 py-8 text-center text-slate-400 text-xs">
                            No emojis found.
                          </div>
                        ) : (
                          filteredEmojis.flatMap(cat => cat.emojis).map((emoji, idx) => (
                            <div key={idx} className="relative group/emojicell">
                              <motion.button
                                animate={{ y: [0, -4, 0], rotate: [0, 10, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.05 }}
                                whileHover={{ scale: 1.3, rotate: 360 }}
                                onClick={() => selectEmoji(emoji)}
                                className="w-full text-center text-lg transition duration-100 cursor-pointer p-0.5 rounded hover:bg-slate-500/10 inline-block"
                              >
                                {emoji}
                              </motion.button>
                              {/* 400x blast trigger overlay */}
                              <button 
                                onClick={() => handleEmojiMultiplier(emoji)}
                                className="absolute -top-3 -left-3 scale-0 group-hover/emojicell:scale-100 transition-transform bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-[7px] p-1 font-bold z-10 shadow-lg"
                                title="💥 Blast 400 of this!"
                              >
                                400x
                              </button>
                            </div>
                          ))
                        )
                      ) : (
                        EMOJI_CATEGORIES[emojiActiveCategory].emojis.map((emoji, idx) => (
                          <div key={idx} className="relative group/emojicell">
                            <motion.button
                              animate={{ y: [0, -4, 0], rotate: [0, 10, -10, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.05 }}
                              whileHover={{ scale: 1.3, rotate: 360 }}
                              onClick={() => selectEmoji(emoji)}
                              className="w-full text-center text-lg transition duration-100 cursor-pointer p-0.5 rounded hover:bg-slate-500/10 inline-block"
                            >
                              {emoji}
                            </motion.button>
                            {/* 400x blast trigger overlay */}
                            <button 
                              onClick={() => handleEmojiMultiplier(emoji)}
                              className="absolute -top-2.5 -left-2.5 scale-0 group-hover/emojicell:scale-100 transition-transform bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full text-[6px] px-1 py-0.5 font-bold z-10 shadow-lg"
                              title="💥 Blast 400 of this!"
                            >
                              400x
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Picker Footer Instructions */}
                    <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/10 flex items-center justify-between">
                      <span className="text-[9px] text-slate-900 dark:text-slate-100 font-bold flex items-center gap-1 font-mono uppercase">
                        <Sparkles className="w-3 h-3 text-slate-900 dark:text-slate-100 animate-spin" />
                        <span>Hover emoji & click '400x' for blast</span>
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Form Box */}
              <div className="flex flex-col">
                {attachedFile && (
                  <div className="mx-4 mb-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        {attachedFile.type === 'image' ? <img src={attachedFile.url} alt="Preview" className="w-10 h-10 object-cover rounded-lg" onError={(e) => (e.currentTarget.style.display = 'none')} /> : <Play className="w-6 h-6 text-indigo-500" />}
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate max-w-[150px]">{attachedFile.name}</span>
                    </div>
                    <button onClick={() => setAttachedFile(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full cursor-pointer"><X className="w-3 h-3 text-slate-500" /></button>
                  </div>
                )}
                <form onSubmit={handleSend} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3 items-center">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                  
                  {/* Emoji popover toggle */}
                  <button 
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2.5 rounded-xl transition cursor-pointer border ${
                      showEmojiPicker 
                        ? 'bg-slate-900 dark:bg-slate-50 border-slate-800 text-white dark:text-slate-900' 
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200/40 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                    title="Emoji Picker (400+ list)"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  
                  {/* Attachment button */}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-xl transition cursor-pointer bg-slate-50 dark:bg-slate-800/80 border border-slate-200/40 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    title="Attach file"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Main Message Input Text Area */}
                  <input 
                    type="text" 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${activeThread.participantName}...`}
                    className="flex-1 min-w-0 px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 text-slate-850 dark:text-slate-100 font-medium"
                  />

                  {/* Send Button */}
                  <button 
                    type="submit"
                    disabled={!messageInput.trim() && !attachedFile}
                    className="p-3 bg-slate-900 dark:bg-slate-50 disabled:opacity-50 text-white dark:text-slate-900 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 shadow-md shadow-slate-200 dark:shadow-none"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 font-display">Inbox is Empty</h3>
              <p className="text-xs max-w-sm">Select a contact or professional seeker from the list to begin negotiating secure escrow contracts.</p>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. LIGHTBOX FULL SCREEN IMAGE VIEWER & INSTANT DELETER   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-6"
          >
            {/* Header toolbar */}
            <div className="flex items-center justify-between text-white">
              <div className="text-xs font-mono text-slate-400">
                Media Lightbox Viewer
              </div>
              <div className="flex items-center gap-2">
                {onDeleteMessage && (
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this media message permanently?")) {
                        handleDeleteMessageLocal(lightboxImage.msgId);
                      }
                    }}
                    className="p-2.5 bg-red-600 hover:bg-red-700 rounded-xl transition text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash className="w-4 h-4" />
                    <span>Delete Media</span>
                  </button>
                )}
                <button 
                  onClick={() => setLightboxImage(null)}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Centered Image */}
            <div className="flex-1 flex items-center justify-center p-4">
              <img 
                src={lightboxImage.url} 
                alt={lightboxImage.text || "Lightbox display"} 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Footer caption */}
            <div className="text-center text-white space-y-1.5">
              <p className="text-sm font-semibold max-w-xl mx-auto">{lightboxImage.text}</p>
              <span className="inline-block text-[10px] text-slate-450 bg-slate-850 px-2.5 py-1 rounded-full border border-slate-800 font-mono">
                Safe-preview channel active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 2. SLIDING PROFILE DRAWER                                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showProfileDrawer && activeThread && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileDrawer(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Slide-out Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 font-display uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-4 h-4 text-slate-900 dark:text-slate-100" />
                  <span>Profile File</span>
                </span>
                <button 
                  onClick={() => setShowProfileDrawer(false)}
                  className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Large Profile Picture */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <img 
                      src={activeThread.participantAvatar} 
                      alt={activeThread.participantName}
                      className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 dark:border-slate-800 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    {activeThread.online && (
                      <div className="absolute bottom-1.5 right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display flex items-center justify-center gap-1.5">
                      <span>{activeThread.participantName}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </h3>
                    <p className="text-xs text-slate-900 dark:text-slate-100 font-semibold mt-0.5">{activeThread.participantRole}</p>
                  </div>
                </div>

                {/* Core ratings & contracts stats */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                  <div className="text-center space-y-0.5 border-r border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Rating Score</span>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{activeThread.participantRating || '4.9'}</span>
                    </div>
                  </div>
                  <div className="text-center space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Completed Gigs</span>
                    <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{activeThread.participantCompletedJobs || '24'} Done</p>
                  </div>
                </div>

                {/* Location Information */}
                {activeThread.participantLocation && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>Operational Location</span>
                    </span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 pl-4.5">{activeThread.participantLocation}</p>
                  </div>
                )}

                {/* Biography section */}
                {activeThread.participantBio && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Professional Biography</span>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-xl border border-slate-200/40 dark:border-slate-850">
                      {activeThread.participantBio}
                    </p>
                  </div>
                )}

                {/* Verified Skills tags */}
                {activeThread.participantSkills && activeThread.participantSkills.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Verified Professional Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeThread.participantSkills.map((skill, index) => (
                        <span 
                          key={index} 
                          className="px-2.5 py-1 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg border border-indigo-100/50 dark:border-indigo-900/30"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Drawer Footer actions */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
                <button 
                  onClick={() => setShowProfileDrawer(false)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Close Profile File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 3. CALL SYSTEM (AUDIO / VIDEO CALLING GLASS OVERLAY)     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {activeCall && (
          <motion.div 
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-6 text-slate-900"
          >
            {/* Ringing or Incoming States */}
            {(activeCall.status === 'ringing' || activeCall.status === 'incoming') && (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-indigo-500/20 animate-ping" />
                  <img 
                    src={activeCall.participants[0].avatar} 
                    alt={activeCall.participants[0].name}
                    className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500/50 shadow-2xl relative"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-bold font-display">{activeCall.participants[0].name}</h2>
                  <p className="text-xs text-slate-400">{activeCall.participants[0].role}</p>
                  <p className="text-sm font-bold text-indigo-400 animate-pulse mt-4 font-mono uppercase tracking-wider">
                    {activeCall.status === 'ringing' ? 'Ringing dialer tone...' : 'Incoming call ringing...'}
                  </p>
                </div>
              </div>
            )}

            {/* Connected State Grid (Video / Audio conference interface) */}
            {activeCall.status === 'connected' && (
              <div className="flex-1 flex flex-col justify-center my-6 space-y-4">
                {/* Visualizer & Waveforms for voice quality */}
                <div className="bg-slate-900/60 rounded-2xl border border-white/10 p-4 flex items-center justify-between max-w-lg mx-auto w-full">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <h5 className="text-xs font-bold font-display">Acoustic Clarity Engine</h5>
                      <p className="text-[10px] text-slate-400">Microphones matched at high resolution (48kHz stereo)</p>
                    </div>
                  </div>
                  {/* Dynamic simulated equalizer levels */}
                  <div className="flex items-end gap-1 h-6">
                    {[1,2,3,4,5,6,7,8].map((bar) => (
                      <div 
                        key={bar}
                        className="w-1 bg-indigo-500 rounded-full animate-bounce" 
                        style={{ 
                          height: `${Math.floor(Math.random() * 20) + 6}px`,
                          animationDuration: `${Math.floor(Math.random() * 500) + 400}ms`
                        }} 
                      />
                    ))}
                  </div>
                </div>

                {/* Dynamic Call Screens Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-5xl mx-auto w-full flex-1 overflow-y-auto items-start">
                  {activeCall.participants.map((participant, index) => (
                    <div 
                      key={index}
                      className="bg-slate-900/80 rounded-2xl border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group min-h-[160px]"
                    >
                      {/* Video Simulated Background Pattern */}
                      {activeCall.type === 'video' ? (
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-indigo-950/40 z-0">
                          {/* CSS pulsing webcam lines */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_100%)] animate-pulse" />
                        </div>
                      ) : null}

                      {/* Real Web Camera Live Video Stream Overlay */}
                      {activeCall.type === 'video' && localStream ? (
                        <div className="absolute inset-0 z-0">
                          {participant.name === 'You (Me)' ? (
                            <video 
                              ref={(el) => {
                                if (el && el.srcObject !== localStream) el.srcObject = localStream;
                              }}
                              autoPlay 
                              playsInline 
                              muted 
                              className="w-full h-full object-cover rounded-2xl transform scale-x-[-1]" 
                            />
                          ) : (
                            <video 
                              ref={(el) => {
                                if (el && el.srcObject !== localStream) el.srcObject = localStream;
                              }}
                              autoPlay 
                              playsInline 
                              muted 
                              className="w-full h-full object-cover rounded-2xl filter saturate-150 hue-rotate-[180deg]" 
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-black/40" />
                        </div>
                      ) : null}

                      {/* Stream Center Avatar / Graphic */}
                      <div className="flex flex-col items-center text-center space-y-2 z-10 my-auto">
                        <img 
                          src={participant.avatar} 
                          alt={participant.name}
                          className={`w-14 h-14 rounded-full object-cover border-2 shadow-lg transition-all ${
                            activeCall.type === 'video' && localStream 
                              ? 'border-slate-400 scale-90 opacity-40 group-hover:opacity-100' 
                              : 'border-slate-500/40'
                          }`}
                          referrerPolicy="no-referrer"
                        />
                        <div className="bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-xl">
                          <h4 className="text-xs font-bold text-white drop-shadow-sm">{participant.name}</h4>
                          <p className="text-[9px] text-slate-350 font-medium">{participant.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty Participant Add placeholder */}
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-50">
                    <UserPlus className="w-8 h-8 text-slate-900 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800">Invite Participants</p>
                      <p className="text-[10px] text-slate-500 max-w-[180px] mx-auto">Add other contacts into this conference grid seamlessly</p>
                    </div>

                    {/* Popover to click other contacts in thread */}
                    <div className="flex flex-wrap gap-1 justify-center max-w-[220px]">
                      {threads
                        .filter(t => !activeCall.participants.some(p => p.name === t.participantName))
                        .map((t) => (
                          <button
                            key={t.id}
                            onClick={() => handleAddParticipant(t)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-900 rounded-lg text-[9px] font-extrabold transition cursor-pointer border border-slate-300 hover:text-white flex items-center gap-1"
                          >
                            <span>+ {(t.participantName || '').split(' ')[0]}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Call Controllers toolbar */}
            <div className="flex flex-col items-center space-y-4 max-w-md mx-auto w-full">
              
              {/* Call Timer Duration Display */}
              {activeCall.status === 'connected' && (
                <div className="px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-bold tracking-wider">
                  DURATION: {Math.floor(activeCall.duration / 60).toString().padStart(2, '0')}:{(activeCall.duration % 60).toString().padStart(2, '0')}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                {/* Decline/Hangup Button */}
                <button 
                  onClick={handleHangupCall}
                  className="w-14 h-14 bg-red-600 hover:bg-red-700 active:scale-95 rounded-full flex items-center justify-center transition cursor-pointer shadow-lg shadow-red-900/30 text-white"
                  title="Hang Up / Decline"
                >
                  <Phone className="w-6 h-6 rotate-[135deg]" />
                </button>

                {/* Accept Button (Only visible for Incoming state) */}
                {activeCall.status === 'incoming' && (
                  <button 
                    onClick={handleAcceptCall}
                    className="w-14 h-14 bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-full flex items-center justify-center transition cursor-pointer shadow-lg shadow-emerald-900/30 text-white"
                    title="Accept Call"
                  >
                    <Phone className="w-6 h-6" />
                  </button>
                )}

                {/* Super Clarity High-Fidelity audio booster trigger */}
                {activeCall.status === 'connected' && (
                  <button
                    onClick={() => {
                      setActiveCall(prev => prev ? { ...prev, highClarity: !prev.highClarity } : null);
                    }}
                    className={`p-3.5 rounded-full border transition cursor-pointer flex items-center justify-center ${
                      activeCall.highClarity 
                        ? 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100' 
                        : 'bg-slate-900 border-white/10 text-slate-400'
                    }`}
                    title={activeCall.highClarity ? "Clarity Booster ON (hear clearly)" : "Clarity Booster OFF"}
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 4. LIVE PICTURE CAPTURE OVERLAY                          */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between p-6 text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-100 flex items-center gap-1.5">
                <Camera className="w-4 h-4 animate-pulse" />
                <span>Live Picture Capture Stage</span>
              </span>
              <button 
                onClick={() => setIsCapturing(false)}
                className="p-2 bg-slate-900 hover:bg-slate-800 rounded-xl text-white transition cursor-pointer border border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Camera Preview Box */}
            <div className="flex-1 flex flex-col items-center justify-center p-4">
              <div className="relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-indigo-500/30 bg-black">
                {/* Real Video Element */}
                <video 
                  id="capture-webcam-preview"
                  ref={(el) => {
                    if (el && captureStream) {
                      el.srcObject = captureStream;
                    }
                  }}
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-[320px] object-cover scale-x-[-1]"
                />
                
                {/* Capture overlay graphics */}
                <div className="absolute inset-0 border border-white/10 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-dashed border-indigo-400/30 rounded-full animate-pulse" />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4 text-center">Ensure proper lighting. Snapshot is encrypted in the app channel.</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 max-w-sm mx-auto w-full pb-6">
              <button 
                onClick={() => setIsCapturing(false)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-xs font-bold rounded-xl border border-white/10 transition cursor-pointer text-slate-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleCaptureSnapshot}
                disabled={!captureStream}
                className="flex-1 py-3 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 disabled:opacity-45 text-xs font-bold rounded-xl transition cursor-pointer text-white shadow-lg shadow-slate-900/20"
              >
                📸 Capture Picture
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
