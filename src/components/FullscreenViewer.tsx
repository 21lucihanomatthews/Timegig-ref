import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface FullscreenViewerProps {
  images: string[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function FullscreenViewer({ images, title, isOpen, onClose }: FullscreenViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-4xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          {images.length > 1 && (
            <button onClick={prev} className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <motion.img
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            src={images[currentIndex]}
            alt={title}
            className="max-h-[80vh] w-auto object-contain rounded-lg"
          />

          {images.length > 1 && (
            <button onClick={next} className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="absolute bottom-6 text-white text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
