/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Heart, Camera, RefreshCw, Download } from 'lucide-react';

const LETTER_CONTENT = "I’m sorry for being such a shy dhakkan and deleting my message! Since you didn't get to keep the last one, I made you this instead. I miss you sooo much, your eyes, your beautiful smile, you annoyingly straight but beautiful hair haha, itny softie softie lag rhy hotay mera itna dil kr rha hota hy to play with them 😭😭 kher... You're the best thing that ever happened to me, and I promise not to hit delete next time! ❤️";

// Helper to remove hyphens as per strict rule
const cleanText = (text: string) => text.replace(/-/g, ' ').replace(/—/g, ' ');

export default function App() {
  const [stage, setStage] = useState(1);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ top: '60%', left: '60%' });
  const [typedText, setTypedText] = useState('');
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [caption, setCaption] = useState('');
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; left: string; size: number; duration: number }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Starfield generation
  const [stars, setStars] = useState<{ id: number; left: string; top: string; size: string; duration: string }[]>([]);

  const triggerHearts = () => {
    setShowHearts(true);
    const newHearts = Array.from({ length: 20 }).map((_, i) => ({
      id: Date.now() + i,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 20 + 20,
      duration: Math.random() * 2 + 2,
    }));
    setFloatingHearts(newHearts);
    
    // Play a subtle pop/sparkle sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});

    setTimeout(() => setShowHearts(false), 4000);
  };

  useEffect(() => {
    const newStars = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      duration: `${15 + Math.random() * 25}s`,
    }));
    setStars(newStars);
  }, []);

  // Stage 1: Password Check
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase().trim() === 'love') {
      setStage(2);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  // Stage 2: Teleport No Button
  const teleportNoButton = () => {
    // Avoid the center area where the "Yes" button is
    let newTop, newLeft;
    do {
      newTop = Math.random() * 80 + 10;
      newLeft = Math.random() * 80 + 10;
    } while (newTop > 40 && newTop < 60 && newLeft > 40 && newLeft < 60);
    
    setNoButtonPos({ top: `${newTop}%`, left: `${newLeft}%` });
  };

  // Stage 3: Typewriter Effect
  useEffect(() => {
    if (stage === 3) {
      let i = 0;
      const interval = setInterval(() => {
        setTypedText(LETTER_CONTENT.slice(0, i));
        i++;
        if (i > LETTER_CONTENT.length) {
          clearInterval(interval);
          setIsTypingDone(true);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stage]);

  // Stage 4: Camera
  useEffect(() => {
    if (isTypingDone && stage === 3) {
      // Transition to stage 4 after a small delay
      const timer = setTimeout(() => setStage(4), 2000);
      return () => clearTimeout(timer);
    }
  }, [isTypingDone, stage]);

  useEffect(() => {
    if (stage === 4 && !capturedImage) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stage, capturedImage]);

  const startCamera = async () => {
    setIsCameraLoading(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please enable camera access to use the photobooth! ❤️");
    } finally {
      setIsCameraLoading(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      // Trigger flash effect
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);

      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        const vWidth = video.videoWidth;
        const vHeight = video.videoHeight;
        const vSize = Math.min(vWidth, vHeight);
        
        // Final capture size
        const size = 800;
        const padding = 60;
        const totalSize = size + padding * 2;
        
        canvasRef.current.width = totalSize;
        canvasRef.current.height = totalSize;
        
        // Background
        context.fillStyle = '#050505';
        context.fillRect(0, 0, totalSize, totalSize);

        // Neon Border
        context.strokeStyle = '#ff758f';
        context.lineWidth = 10;
        context.strokeRect(15, 15, totalSize - 30, totalSize - 30);
        
        // Glow
        context.shadowBlur = 25;
        context.shadowColor = '#ff758f';
        context.strokeRect(15, 15, totalSize - 30, totalSize - 30);
        context.shadowBlur = 0;

        // Draw Video (Mirrored and Cropped to Square)
        context.save();
        context.translate(totalSize, 0);
        context.scale(-1, 1);
        
        const sourceX = (vWidth - vSize) / 2;
        const sourceY = (vHeight - vSize) / 2;
        
        context.drawImage(
          video, 
          sourceX, sourceY, vSize, vSize, 
          padding, padding, size, size
        );
        context.restore();

        // Draw Heart in corner
        context.fillStyle = '#ff758f';
        const heartSize = 80;
        const hX = padding + 30;
        const hY = padding + 30;
        
        context.beginPath();
        context.moveTo(hX + heartSize / 2, hY + heartSize / 5);
        context.bezierCurveTo(hX + heartSize / 2, hY, hX, hY, hX, hY + heartSize / 3);
        context.bezierCurveTo(hX, hY + heartSize / 1.5, hX + heartSize / 2, hY + heartSize, hX + heartSize / 2, hY + heartSize);
        context.bezierCurveTo(hX + heartSize / 2, hY + heartSize, hX + heartSize, hY + heartSize / 1.5, hX + heartSize, hY + heartSize / 3);
        context.bezierCurveTo(hX + heartSize, hY, hX + heartSize / 2, hY, hX + heartSize / 2, hY + heartSize / 5);
        context.fill();

        const dataUrl = canvasRef.current.toDataURL('image/png');
        setCapturedImage(dataUrl);
        
        // Stop camera
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const downloadPhoto = () => {
    if (!capturedImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const captionHeight = caption ? 120 : 0;
      canvas.width = img.width;
      canvas.height = img.height + captionHeight;

      // Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw original framed image
      ctx.drawImage(img, 0, 0);

      // Draw Caption and extend border if needed
      if (caption) {
        // Cover the bottom border of the original image to avoid "double line"
        ctx.fillStyle = '#050505';
        ctx.fillRect(10, img.height - 40, canvas.width - 20, 40);

        // Redraw the full border to encompass the new height
        ctx.strokeStyle = '#ff758f';
        ctx.lineWidth = 10;
        ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
        
        // Glow
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff758f';
        ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#ff758f';
        ctx.font = 'italic 40px "Playfair Display", serif';
        ctx.textAlign = 'center';
        try {
          ctx.fillText(cleanText(caption), canvas.width / 2, img.height + 40);
        } catch (e) {
          ctx.font = 'italic 40px serif';
          ctx.fillText(cleanText(caption), canvas.width / 2, img.height + 40);
        }
      }

      // Download
      const link = document.createElement('a');
      link.download = `midnight-vault-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = capturedImage;
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden">
      {/* Starfield */}
      <div className="stars-container">
        {stars.map(star => (
          <div
            key={star.id}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {showHearts && floatingHearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
            animate={{ y: '-10vh', opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1] }}
            transition={{ duration: heart.duration, ease: "easeOut" }}
            className="fixed z-[100] pointer-events-none"
            style={{ left: heart.left }}
          >
            <Heart 
              size={heart.size} 
              className="text-[#ff758f] fill-[#ff758f] drop-shadow-[0_0_10px_rgba(255,117,143,0.8)]" 
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {stage === 1 && (
          <motion.div
            key="stage1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1 }}
            className="glass p-8 rounded-3xl w-full max-w-md text-center relative overflow-hidden"
          >
            <div className="mb-8 flex justify-center">
              <div className="p-4 rounded-full bg-pink-500/20 neon-glow">
                <Lock className="w-12 h-12 text-[#ff758f]" />
              </div>
            </div>
            <h1 className="font-display italic text-4xl mb-6 neon-text">Digital Vault</h1>
            <p className="text-white/60 mb-8">Enter the secret key to unlock my heart...</p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className={`w-full bg-white/10 border ${error ? 'border-red-500' : 'border-white/20'} rounded-xl px-4 py-3 text-center focus:outline-none focus:border-[#ff758f] transition-colors`}
              />
              <button
                type="submit"
                className="w-full bg-[#ff758f] text-white font-semibold py-3 rounded-xl neon-glow hover:opacity-90 transition-opacity"
              >
                Unlock
              </button>
            </form>
          </motion.div>
        )}

        {stage === 2 && (
          <motion.div
            key="stage2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
            className="glass p-10 rounded-3xl w-full max-w-md text-center relative min-h-[400px] flex flex-col justify-center"
          >
            <h2 className="font-display italic text-3xl mb-12 leading-relaxed">
              {cleanText("I was being an awkward dhakkan... do you forgive me? 🥺")}
            </h2>
            
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setStage(3)}
                className="px-12 py-4 bg-[#ff758f] text-white text-xl font-bold rounded-full neon-glow hover:scale-105 transition-transform"
              >
                Yes
              </button>
              
              <motion.button
                onMouseEnter={teleportNoButton}
                onTouchStart={teleportNoButton}
                animate={{ 
                  top: noButtonPos.top, 
                  left: noButtonPos.left,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }}
                style={{
                  position: 'fixed',
                  zIndex: 50
                }}
                className="px-8 py-2 bg-white/10 border border-white/20 text-white/50 rounded-full cursor-default whitespace-nowrap"
              >
                No
              </motion.button>
            </div>
          </motion.div>
        )}

        {stage === 3 && (
          <motion.div
            key="stage3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="glass p-8 rounded-3xl w-full max-w-2xl min-h-[300px] relative"
          >
            <div className="absolute -top-6 -left-6">
              <Heart className="w-12 h-12 text-[#ff758f] fill-[#ff758f] opacity-20" />
            </div>
            <div className="font-sans text-lg leading-relaxed text-white/90 whitespace-pre-wrap">
              {cleanText(typedText)}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-1 h-6 bg-[#ff758f] ml-1 align-middle"
              />
            </div>
          </motion.div>
        )}

        {stage === 4 && (
          <motion.div
            key="stage4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="glass p-6 rounded-3xl w-full max-w-md text-center"
          >
            <h2 className="font-display italic text-2xl mb-6 neon-text">
              {cleanText("Wait! Now smile for me... I want to see that beautiful face!")}
            </h2>
            
            <div className="relative aspect-square w-full bg-black rounded-2xl overflow-hidden mb-6 border border-white/10 shadow-2xl">
              {/* Flash Overlay */}
              <AnimatePresence>
                {showFlash && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="absolute inset-0 bg-white z-50"
                  />
                )}
              </AnimatePresence>

              {isCameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-[#ff758f] border-t-transparent rounded-full"
                  />
                </div>
              )}

              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <button
                      onClick={capturePhoto}
                      disabled={isCameraLoading}
                      className="p-5 bg-[#ff758f] rounded-full neon-glow hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-contain bg-black" />
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="p-3 bg-black/60 backdrop-blur-xl rounded-full text-white hover:bg-black/80 transition-colors shadow-lg"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {capturedImage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a sweet caption..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-center focus:outline-none focus:border-[#ff758f] transition-colors text-white"
                />
                
                {caption && (
                  <p className="font-display italic text-xl text-[#ff758f] neon-text break-words">
                    {cleanText(caption)}
                  </p>
                )}

                <p className="text-white/60 text-sm">
                  {cleanText("Long press the photo to save it and send it to me!")}
                </p>

                <button
                  onClick={downloadPhoto}
                  className="w-full bg-[#ff758f] text-white font-semibold py-3 rounded-xl neon-glow hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Framed Photo
                </button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerHearts}
                  className="w-full py-3 rounded-xl border-2 border-[#ff758f] text-[#ff758f] font-bold uppercase tracking-widest hover:bg-[#ff758f]/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className="w-5 h-5 fill-[#ff758f]" />
                  I Love You
                </motion.button>
              </motion.div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2 }}
              className="mt-8 text-xs text-white/40 font-sans tracking-widest uppercase"
            >
              Made with love for my favorite person
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
