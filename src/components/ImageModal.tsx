'use client';

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function ImageModal({ imageUrl, onClose }: ImageModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!imageUrl || !isMounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="bg-slate-900/50 rounded-3xl p-8 border-4 border-purple-500 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl filter brightness-0 invert">📸</span> Payment Receipt
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-slate-300 text-3xl transition-colors"
            >
              ✕
            </button>
          </div>
          <img
            src={imageUrl}
            alt="Receipt"
            className="w-full rounded-2xl border-2 border-purple-500/50"
          />
          <div className="flex gap-4">
            <a
              href={imageUrl}
              download="receipt.png"
              className="flex-1 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white font-bold py-3 px-6 rounded-xl transition-all text-center"
            >
              ⬇️ Download
            </a>
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
