'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

export default function MagicLamp() {
  const [isGenieVisible, setIsGenieVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleLampClick = () => {
    if (!isGenieVisible) {
      // Show genie with initial dot effect for 1 second
      setIsGenieVisible(true);
      
      // Play audio
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }

      // Hide the dot after 1 second and show just the genie
      setTimeout(() => {
        // The genie will be visible via the Tenor embed
      }, 1000);
    } else {
      // Hide genie
      setIsGenieVisible(false);
      
      // Stop audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  };

  return (
    <>
      {/* Audio element */}
      <audio ref={audioRef} src="/ReelAudio-80274.mp3" />

      {/* Magic Lamp Container */}
      <div className="fixed bottom-4 right-4 z-50 cursor-pointer">
        {/* Lamp Image */}
        {!isGenieVisible && (
          <div
            onClick={handleLampClick}
            className="relative w-24 h-24 animate-pulse"
          >
            <Image
              src="/aladdin lamp Sticker by M.A.C.gif"
              alt="Magic Lamp"
              width={96}
              height={96}
              unoptimized
              priority
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* White Glowing Dot with Expanding Waves (Transition) */}
        {isGenieVisible && (
          <div className="relative w-24 h-24 flex items-center justify-center" style={{ animation: 'dotFadeOut 1s ease-in-out forwards' }}>
            {/* Expanding wave circles */}
            <div className="absolute w-8 h-8 bg-white rounded-full opacity-80"
              style={{
                animation: 'expandingPulse 1s ease-out forwards'
              }}>
            </div>
            <div className="absolute w-8 h-8 bg-white rounded-full opacity-60"
              style={{
                animation: 'expandingPulse 1s ease-out 0.2s forwards'
              }}>
            </div>
            <div className="absolute w-8 h-8 bg-white rounded-full opacity-40"
              style={{
                animation: 'expandingPulse 1s ease-out 0.4s forwards'
              }}>
            </div>
            
            {/* Center glowing dot */}
            <div className="absolute w-8 h-8 bg-white rounded-full shadow-lg" 
              style={{
                boxShadow: '0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.5)'
              }}>
            </div>
          </div>
        )}

        {/* Genie GIF Container */}
        {isGenieVisible && (
          <div 
            onClick={handleLampClick}
            className="fixed bottom-24 right-4 w-40 h-40 z-51 animate-fadeIn bg-transparent"
            style={{
              animation: 'slideUp 0.6s ease-out'
            }}
          >
            <Image
              src="/gwiz-genie-and-the-power-belt.gif"
              alt="Genie"
              width={160}
              height={160}
              unoptimized
              priority
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes expandingPulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }

        @keyframes dotFadeOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          90% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }

        .animate-fadeIn {
          animation: slideUp 0.6s ease-out;
        }
      `}</style>
    </>
  );
}
