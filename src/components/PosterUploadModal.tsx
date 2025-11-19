'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Upload,
  CheckCircle,
  ImagePlus,
  Send,
} from 'lucide-react';
import Image from 'next/image';

interface PosterUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  isFirstTime?: boolean;
}

export default function PosterUploadModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  isFirstTime = false,
}: PosterUploadModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      setError('');
      // Create preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('email', userEmail);
      formData.append('isFirstTime', isFirstTime.toString());
      formData.append('posterImage', selectedImage);

      const response = await fetch('/api/registration-form', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload poster');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload poster');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101]"
          >
            <div className="bg-gradient-to-br from-purple-950/95 via-[#1a0a2e]/95 to-purple-950/95 backdrop-blur-xl border border-amber-600/40 rounded-2xl shadow-2xl shadow-purple-900/50 p-6 mx-4 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-amber-100 font-protest">
                  {isFirstTime ? 'Welcome to PECFest!' : 'Complete Your Profile'}
                </h2>
                <button
                  onClick={handleClose}
                  disabled={uploading}
                  className="text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success State */}
              {success ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center py-6"
                >
                  <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                  <p className="text-amber-100 text-base font-semibold">
                    Poster uploaded successfully!
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Poster Display */}
                  <div className="mb-4">
                    <div className="relative w-full aspect-[7/10] bg-gradient-to-br from-purple-900/30 to-violet-900/30 rounded-xl overflow-hidden border-2 border-amber-600/30">
                      <Image
                        src="/gemini_poster.jpg"
                        alt="Gemini Poster"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                    <p className="text-amber-300/80 text-xs mt-2 text-center">
                      Upload your photo with this poster to complete your registration
                    </p>
                  </div>

                  {/* Image Preview */}
                  {previewUrl && (
                    <div className="mb-3">
                      <p className="text-amber-100 text-xs mb-1.5 font-semibold">
                        Selected Image:
                      </p>
                      <div className="relative w-full aspect-video bg-black/50 rounded-lg overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload Buttons */}
                  <div className="space-y-3 mb-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-400 hover:to-teal-500 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      <ImagePlus className="w-4 h-4" />
                      {selectedImage ? 'Change Image' : 'Select Image'}
                    </button>

                    {selectedImage && (
                      <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-600 text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Upload Poster
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/50 rounded-lg p-2.5 mb-3"
                    >
                      <p className="text-red-300 text-xs">{error}</p>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
