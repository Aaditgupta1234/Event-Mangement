import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function MemoryReelPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [showReelMaker, setShowReelMaker] = useState(false);
  const [newMemory, setNewMemory] = useState({ title: '', description: '', eventName: '', imageFile: null });
  const [selectedImages, setSelectedImages] = useState([]);
  const [reelPreview, setReelPreview] = useState(null);
  const [reelTitle, setReelTitle] = useState('My Festival Reel');
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [reelEffects, setReelEffects] = useState({
    transition: 'fade',
    duration: 10,
    filter: 'none',
    music: 'upbeat',
    textStyle: 'modern',
    easing: 'ease-in-out'
  });
  const [previewFrame, setPreviewFrame] = useState(0);
  const previewCanvasRef = useRef(null);
  const previewAnimationRef = useRef(null);
  const [isPreviewPaused, setIsPreviewPaused] = useState(false);
  const currentFrameRef = useRef(0);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = () => {
    const saved = localStorage.getItem(`memories_${user?.id}`);
    if (saved) {
      setMemories(JSON.parse(saved));
    } else {
      // Sample memories for demo
      const sampleMemories = [
        {
          id: '1',
          title: 'Amazing DJ Night',
          description: 'The crowd was electric! Best night ever.',
          eventName: 'EDM Festival',
          date: new Date().toISOString(),
          imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400'
        },
        {
          id: '2',
          title: 'Robo Wars Finals',
          description: 'Intense competition, our bot made it to semifinals!',
          eventName: 'Tech Fest',
          date: new Date(Date.now() - 86400000).toISOString(),
          imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400'
        },
        {
          id: '3',
          title: 'Food Festival Fun',
          description: 'Tried 10 different cuisines in one day!',
          eventName: 'Food Carnival',
          date: new Date(Date.now() - 172800000).toISOString(),
          imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'
        }
      ];
      setMemories(sampleMemories);
      localStorage.setItem(`memories_${user?.id}`, JSON.stringify(sampleMemories));
    }
  };

  // Preview canvas animation
  useEffect(() => {
    if (!showReelMaker || selectedImages.length === 0 || !previewCanvasRef.current) return;

    const selectedMemories = memories.filter(m => selectedImages.includes(m.id));
    if (selectedMemories.length === 0) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const framesPerImage = reelEffects.duration * 2; // 2fps for preview
    const totalFrames = framesPerImage * selectedMemories.length;

    const loadImages = async () => {
      const imgSet = await Promise.all(
        selectedMemories.map(mem => {
          return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = mem.imageUrl;
          });
        })
      );
      return imgSet;
    };

    loadImages().then(images => {
      currentFrameRef.current = 0;

      const applyFilter = (ctx, filter) => {
        switch(filter) {
          case 'sepia':
            ctx.filter = 'sepia(100%)';
            break;
          case 'vintage':
            ctx.filter = 'saturate(1.2) contrast(0.9) brightness(1.1)';
            break;
          case 'vibrant':
            ctx.filter = 'saturate(1.5) contrast(1.2)';
            break;
          case 'coolBlue':
            ctx.filter = 'hue-rotate(200deg) saturate(1.2)';
            break;
          case 'warmOrange':
            ctx.filter = 'hue-rotate(-15deg) saturate(1.3) brightness(1.05)';
            break;
          default:
            ctx.filter = 'none';
        }
      };

      const applyEasing = (t, easing) => {
        switch(easing) {
          case 'linear':
            return t;
          case 'ease-in':
            return t * t;
          case 'ease-out':
            return t * (2 - t);
          case 'ease-in-out':
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          case 'ease-in-cubic':
            return t * t * t;
          case 'ease-out-cubic':
            return (--t) * t * t + 1;
          default:
            return t;
        }
      };

      const drawImageWithTransition = (ctx, img, progress, transition, w, h) => {
        const easedProgress = applyEasing(progress, reelEffects.easing);
        switch(transition) {
          case 'fade':
            ctx.globalAlpha = easedProgress;
            break;
          case 'slideLeft':
            ctx.translate(-w * (1 - easedProgress), 0);
            break;
          case 'slideRight':
            ctx.translate(w * (1 - easedProgress), 0);
            break;
          case 'zoom':
            const zoomScale = 0.8 + 0.2 * easedProgress;
            ctx.translate(w / 2, h / 2);
            ctx.scale(zoomScale, zoomScale);
            ctx.translate(-w / 2, -h / 2);
            break;
          case 'rotate':
            ctx.translate(w / 2, h / 2);
            ctx.rotate((Math.PI * 2 * easedProgress) * 0.3);
            ctx.translate(-w / 2, -h / 2);
            break;
          case 'blur':
            ctx.filter = `blur(${20 * (1 - easedProgress)}px)`;
            break;
          case 'wipeLeft':
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, w * easedProgress, h);
            ctx.clip();
            break;
          case 'wipeRight':
            ctx.save();
            ctx.beginPath();
            ctx.rect(w * (1 - easedProgress), 0, w * easedProgress, h);
            ctx.clip();
            break;
          case 'wipeUp':
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, h * (1 - easedProgress), w, h * easedProgress);
            ctx.clip();
            break;
          case 'wipeDown':
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, 0, w, h * easedProgress);
            ctx.clip();
            break;
          case 'flip':
            ctx.translate(w / 2, h / 2);
            ctx.scale(Math.cos(easedProgress * Math.PI), 1);
            ctx.translate(-w / 2, -h / 2);
            ctx.globalAlpha = easedProgress < 0.5 ? 1 : 2 * easedProgress - 1;
            break;
          case 'bounce':
            const bounceProgress = easedProgress < 0.5 
              ? 4 * easedProgress * easedProgress * easedProgress 
              : 1 - Math.pow(-2 * easedProgress + 2, 3) / 2;
            const bounceScale = 0.5 + 0.5 * bounceProgress;
            ctx.translate(w / 2, h / 2);
            ctx.scale(bounceScale, bounceScale);
            ctx.translate(-w / 2, -h / 2);
            ctx.globalAlpha = easedProgress;
            break;
          case 'push':
            ctx.translate(-w * (1 - easedProgress), 0);
            break;
          case 'swirl':
            ctx.translate(w / 2, h / 2);
            const swirlRotation = (1 - easedProgress) * Math.PI * 2;
            const swirlScale = 0.5 + 0.5 * easedProgress;
            ctx.rotate(swirlRotation);
            ctx.scale(swirlScale, swirlScale);
            ctx.translate(-w / 2, -h / 2);
            ctx.globalAlpha = easedProgress;
            break;
        }

        if (img) {
          const hRatio = canvas.width / img.width;
          const vRatio = canvas.height / img.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShift_x = (canvas.width - img.width * ratio) / 2;
          const centerShift_y = (canvas.height - img.height * ratio) / 2;
          ctx.drawImage(img, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
        }
      };

      const drawText = (ctx, text, style, w, h) => {
        switch(style) {
          case 'modern':
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 8;
            ctx.font = 'bold 20px Arial';
            break;
          case 'retro':
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#000000';
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.font = 'bold 20px Courier';
            break;
          case 'neon':
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.font = 'bold 20px Arial';
            break;
          case 'shadow':
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(0,0,0,1)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.font = 'bold 20px Arial';
            break;
        }
        ctx.textAlign = 'center';
        ctx.fillText(text, w / 2, h - 20);
        ctx.shadowColor = 'transparent';
      };

      const animate = () => {
        if (currentFrameRef.current < totalFrames) {
          const imageIndex = Math.floor(currentFrameRef.current / framesPerImage) % images.length;
          const frameProgress = (currentFrameRef.current % framesPerImage) / framesPerImage;
          const img = images[imageIndex];

          ctx.fillStyle = '#0b0d12';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          applyFilter(ctx, reelEffects.filter);
          drawImageWithTransition(ctx, img, frameProgress, reelEffects.transition, canvas.width, canvas.height);
          ctx.restore();

          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
          drawText(ctx, reelTitle, reelEffects.textStyle, canvas.width, canvas.height);

          // Draw timeline at bottom
          const timelineHeight = 4;
          const timelineY = canvas.height - timelineHeight;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fillRect(0, timelineY, canvas.width, timelineHeight);
          
          const progress = currentFrameRef.current / totalFrames;
          ctx.fillStyle = '#6af2c6';
          ctx.fillRect(0, timelineY, canvas.width * progress, timelineHeight);

          if (!isPreviewPaused) {
            currentFrameRef.current = currentFrameRef.current + 1;
          }
          setPreviewFrame(currentFrameRef.current);
          previewAnimationRef.current = requestAnimationFrame(animate);
        } else {
          // Preview finished, stop animation
          if (previewAnimationRef.current) {
            cancelAnimationFrame(previewAnimationRef.current);
          }
        }
      };

      if (previewAnimationRef.current) {
        cancelAnimationFrame(previewAnimationRef.current);
      }
      animate();
    });

    return () => {
      if (previewAnimationRef.current) {
        cancelAnimationFrame(previewAnimationRef.current);
      }
    };
  }, [showReelMaker, selectedImages, reelEffects, reelTitle, memories, isPreviewPaused]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setNewMemory({ ...newMemory, imageFile: { name: file.name, data: event.target.result } });
    };
    reader.onerror = () => {
      alert('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const addMemory = () => {
    if (!newMemory.title) return;
    
    const memory = {
      id: Date.now().toString(),
      title: newMemory.title,
      description: newMemory.description,
      eventName: newMemory.eventName,
      date: new Date().toISOString(),
      imageUrl: newMemory.imageFile?.data || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'
    };
    
    const updated = [memory, ...memories];
    setMemories(updated);
    localStorage.setItem(`memories_${user?.id}`, JSON.stringify(updated));
    setNewMemory({ title: '', description: '', eventName: '', imageFile: null });
    setShowUpload(false);
  };

  const deleteMemory = (id) => {
    if (!confirm('Delete this memory?')) return;
    const updated = memories.filter(m => m.id !== id);
    setMemories(updated);
    localStorage.setItem(`memories_${user?.id}`, JSON.stringify(updated));
  };

  const toggleImageSelection = (id) => {
    setSelectedImages(prev => 
      prev.includes(id) ? prev.filter(imgId => imgId !== id) : [...prev, id]
    );
  };

  const createReel = async () => {
    if (selectedImages.length === 0) {
      alert('Select at least 2 photos to create a reel');
      return;
    }

    const selectedMemories = memories.filter(m => selectedImages.includes(m.id));
    setReelPreview({ images: selectedMemories, currentIndex: 0 });
  };

  const downloadReel = async () => {
    if (!reelPreview || reelPreview.images.length === 0) return;

    // Create HTML5 Canvas animation
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');

    const images = await Promise.all(
      reelPreview.images.map(img => {
        return new Promise((resolve) => {
          const imgEl = new Image();
          imgEl.crossOrigin = 'anonymous';
          imgEl.onload = () => resolve(imgEl);
          imgEl.onerror = () => resolve(null);
          imgEl.src = img.imageUrl;
        });
      })
    );

    // Create video stream for download
    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks = [];

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reelTitle.replace(/\s+/g, '_')}_${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    mediaRecorder.start();

    // Apply filter to canvas based on effect
    const applyFilter = (ctx, canvas, filter) => {
      switch(filter) {
        case 'sepia':
          ctx.filter = 'sepia(100%)';
          break;
        case 'vintage':
          ctx.filter = 'saturate(1.2) contrast(0.9) brightness(1.1)';
          break;
        case 'vibrant':
          ctx.filter = 'saturate(1.5) contrast(1.2)';
          break;
        case 'coolBlue':
          ctx.filter = 'hue-rotate(200deg) saturate(1.2)';
          break;
        case 'warmOrange':
          ctx.filter = 'hue-rotate(-15deg) saturate(1.3) brightness(1.05)';
          break;
        default:
          ctx.filter = 'none';
      }
    };

    // Apply easing function to progress
    const applyEasing = (t, easing) => {
      switch(easing) {
        case 'linear':
          return t;
        case 'ease-in':
          return t * t;
        case 'ease-out':
          return t * (2 - t);
        case 'ease-in-out':
          return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        case 'ease-in-cubic':
          return t * t * t;
        case 'ease-out-cubic':
          return (--t) * t * t + 1;
        default:
          return t;
      }
    };

    // Draw image with transition effect
    const drawImageWithTransition = (ctx, img, progress, transition) => {
      const w = canvas.width;
      const h = canvas.height;
      const easedProgress = applyEasing(progress, reelEffects.easing);

      switch(transition) {
        case 'fade':
          ctx.globalAlpha = easedProgress;
          break;
        case 'slideLeft':
          ctx.translate(-w * (1 - easedProgress), 0);
          break;
        case 'slideRight':
          ctx.translate(w * (1 - easedProgress), 0);
          break;
        case 'zoom':
          const zoomScale = 0.8 + 0.2 * easedProgress;
          ctx.translate(w / 2, h / 2);
          ctx.scale(zoomScale, zoomScale);
          ctx.translate(-w / 2, -h / 2);
          break;
        case 'rotate':
          ctx.translate(w / 2, h / 2);
          ctx.rotate((Math.PI * 2 * easedProgress) * 0.3);
          ctx.translate(-w / 2, -h / 2);
          break;
        case 'blur':
          ctx.filter = `blur(${20 * (1 - easedProgress)}px)`;
          break;
        case 'wipeLeft':
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, w * easedProgress, h);
          ctx.clip();
          break;
        case 'wipeRight':
          ctx.save();
          ctx.beginPath();
          ctx.rect(w * (1 - easedProgress), 0, w * easedProgress, h);
          ctx.clip();
          break;
        case 'wipeUp':
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, h * (1 - easedProgress), w, h * easedProgress);
          ctx.clip();
          break;
        case 'wipeDown':
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, 0, w, h * easedProgress);
          ctx.clip();
          break;
        case 'flip':
          ctx.translate(w / 2, h / 2);
          ctx.scale(Math.cos(easedProgress * Math.PI), 1);
          ctx.translate(-w / 2, -h / 2);
          ctx.globalAlpha = easedProgress < 0.5 ? 1 : 2 * easedProgress - 1;
          break;
        case 'bounce':
          const bounceProgress = easedProgress < 0.5 
            ? 4 * easedProgress * easedProgress * easedProgress 
            : 1 - Math.pow(-2 * easedProgress + 2, 3) / 2;
          const bounceScale = 0.5 + 0.5 * bounceProgress;
          ctx.translate(w / 2, h / 2);
          ctx.scale(bounceScale, bounceScale);
          ctx.translate(-w / 2, -h / 2);
          ctx.globalAlpha = easedProgress;
          break;
        case 'push':
          ctx.translate(-w * (1 - easedProgress), 0);
          break;
        case 'swirl':
          ctx.translate(w / 2, h / 2);
          const swirlRotation = (1 - easedProgress) * Math.PI * 2;
          const swirlScale = 0.5 + 0.5 * easedProgress;
          ctx.rotate(swirlRotation);
          ctx.scale(swirlScale, swirlScale);
          ctx.translate(-w / 2, -h / 2);
          ctx.globalAlpha = easedProgress;
          break;
      }

      if (img) {
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;
        ctx.drawImage(img, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
      }
    };

    // Draw text with style
    const drawText = (ctx, text, x, y, style) => {
      switch(style) {
        case 'modern':
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 8;
          ctx.font = 'bold 36px "Arial", sans-serif';
          break;
        case 'retro':
          ctx.fillStyle = '#ffff00';
          ctx.shadowColor = '#000000';
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.shadowBlur = 0;
          ctx.font = 'bold 36px "Courier", monospace';
          break;
        case 'neon':
          ctx.fillStyle = '#00ffff';
          ctx.shadowColor = '#00ffff';
          ctx.shadowBlur = 20;
          ctx.font = 'bold 36px "Arial", sans-serif';
          break;
        case 'shadow':
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,0,0,1)';
          ctx.shadowBlur = 15;
          ctx.shadowOffsetX = 4;
          ctx.shadowOffsetY = 4;
          ctx.font = 'bold 36px "Arial", sans-serif';
          break;
      }
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y);
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    // Animate through images
    let frameCount = 0;
    const framesPerImage = reelEffects.duration * 30; // Duration in seconds * 30fps
    const totalFrames = framesPerImage * images.length;

    const animateFrame = () => {
      const imageIndex = Math.floor(frameCount / framesPerImage) % images.length;
      const frameProgress = (frameCount % framesPerImage) / framesPerImage;
      const img = images[imageIndex];

      // Clear canvas
      ctx.fillStyle = '#0b0d12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context state for transformations
      ctx.save();

      // Apply filter
      applyFilter(ctx, canvas, reelEffects.filter);

      // Draw image with transition effect
      drawImageWithTransition(ctx, img, frameProgress, reelEffects.transition);

      // Restore context state
      ctx.restore();

      // Add title background
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, canvas.height - 100, canvas.width, 100);

      // Draw title with selected text style
      drawText(ctx, reelTitle, canvas.width / 2, canvas.height - 40, reelEffects.textStyle);

      // Draw timeline at bottom
      const timelineHeight = 4;
      const timelineY = canvas.height - timelineHeight;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, timelineY, canvas.width, timelineHeight);
      
      const progress = frameCount / totalFrames;
      ctx.fillStyle = '#6af2c6';
      ctx.fillRect(0, timelineY, canvas.width * progress, timelineHeight);

      frameCount++;
      if (frameCount < totalFrames) {
        requestAnimationFrame(animateFrame);
      } else {
        mediaRecorder.stop();
      }
    };

    animateFrame();
  };

  const downloadAsGIF = () => {
    if (!reelPreview || reelPreview.images.length === 0) return;

    const images = reelPreview.images;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 450;

    // Simple GIF creation using canvas
    let animationIndex = 0;
    const gif = document.createElement('canvas');
    gif.width = 600;
    gif.height = 450;
    const gifCtx = gif.getContext('2d');

    // Create downloadable animated GIF simulation (as MP4 WebM)
    downloadReel();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px' }}>📸 Memory Reel</h1>
            <p style={{ color: '#adb6d9', margin: 0 }}>
              {memories.length} memories captured · Create & download reels
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" onClick={() => setShowUpload(true)}>
              + Add Memory
            </button>
            {memories.length >= 2 && (
              <button className="btn" style={{ background: 'linear-gradient(135deg, #ff9f43, #f8b500)' }} onClick={() => { setShowReelMaker(true); setSelectedImages([]); }}>
                🎬 Create Reel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reel Maker Modal */}
      {showReelMaker && !reelPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflow: 'auto'
        }} onClick={() => setShowReelMaker(false)}>
          <div className="card" style={{ maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 8px' }}>🎬 Create Your Reel</h2>
              <p style={{ color: '#adb6d9', margin: '0 0 20px' }}>Select photos to create an animated reel</p>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Reel Title
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g., Best Moments 2025"
                  value={reelTitle}
                  onChange={(e) => setReelTitle(e.target.value)}
                />
              </div>

              <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Select at least 2 photos: {selectedImages.length} selected
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    onClick={() => toggleImageSelection(memory.id)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: selectedImages.includes(memory.id) ? '3px solid #6af2c6' : '2px solid #ffffff20',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div
                      style={{
                        height: '120px',
                        background: `url(${memory.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    {selectedImages.includes(memory.id) && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(106, 242, 198, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        ✓
                      </div>
                    )}
                    <div style={{ padding: '8px', fontSize: '12px', fontWeight: '600' }}>
                      {memory.title.substring(0, 15)}...
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Preview Canvas */}
              {selectedImages.length >= 2 && (
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#6af2c6' }}>
                    👁️ Live Preview (Updated as you change effects)
                  </p>
                  <div style={{
                    background: '#ffffff08',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '2px solid #6af2c6',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <canvas
                      ref={previewCanvasRef}
                      width={400}
                      height={300}
                      style={{
                        display: 'block',
                        maxWidth: '100%',
                        height: 'auto'
                      }}
                    />
                  </div>

                  {/* Pause and Replay Buttons */}
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button
                      onClick={() => setIsPreviewPaused(!isPreviewPaused)}
                      style={{
                        padding: '10px 20px',
                        background: isPreviewPaused ? '#6af2c6' : '#ffffff10',
                        border: '1px solid #6af2c6',
                        borderRadius: '8px',
                        color: isPreviewPaused ? '#0a0e27' : '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isPreviewPaused ? '▶️ Resume' : '⏸️ Pause'}
                    </button>
                    <button
                      onClick={() => {
                        currentFrameRef.current = 0;
                        setPreviewFrame(0);
                        setIsPreviewPaused(false);
                      }}
                      style={{
                        padding: '10px 20px',
                        background: '#ffffff10',
                        border: '1px solid #6af2c6',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      🔄 Replay
                    </button>
                  </div>
                </div>
              )}

              {/* Effects Section */}
              <div style={{ background: '#ffffff08', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '600' }}>✨ Reel Effects</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  {/* Transition Effect */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#adb6d9' }}>
                      Transition
                    </label>
                    <select
                      value={reelEffects.transition}
                      onChange={(e) => setReelEffects({ ...reelEffects, transition: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#ffffff10',
                        border: '1px solid #6af2c6',
                        borderRadius: '8px',
                        color: '#000',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginBottom: '8px'
                      }}
                    >
                      <option value="fade">Fade</option>
                      <option value="slideLeft">Slide Left</option>
                      <option value="slideRight">Slide Right</option>
                      <option value="zoom">Zoom</option>
                      <option value="rotate">Rotate</option>
                      <option value="blur">Blur</option>
                      <option value="wipeLeft">Wipe Left</option>
                      <option value="wipeRight">Wipe Right</option>
                      <option value="wipeUp">Wipe Up</option>
                      <option value="wipeDown">Wipe Down</option>
                      <option value="flip">3D Flip</option>
                      <option value="bounce">Bounce In</option>
                      <option value="push">Push</option>
                      <option value="swirl">Swirl</option>
                    </select>
                    <div style={{ fontSize: '11px', color: '#6af2c6', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {reelEffects.transition === 'fade' && '📀 Smooth alpha fade'}
                      {reelEffects.transition === 'slideLeft' && '→ Slides from right'}
                      {reelEffects.transition === 'slideRight' && '← Slides from left'}
                      {reelEffects.transition === 'zoom' && '🔍 Zoom in effect'}
                      {reelEffects.transition === 'rotate' && '⟳ Rotating transition'}
                      {reelEffects.transition === 'blur' && '💨 Blur in/out'}
                      {reelEffects.transition === 'wipeLeft' && '◧ Horizontal wipe left'}
                      {reelEffects.transition === 'wipeRight' && '◨ Horizontal wipe right'}
                      {reelEffects.transition === 'wipeUp' && '⬆ Vertical wipe up'}
                      {reelEffects.transition === 'wipeDown' && '⬇ Vertical wipe down'}
                      {reelEffects.transition === 'flip' && '🔄 3D flip animation'}
                      {reelEffects.transition === 'bounce' && '🎾 Bouncy entrance'}
                      {reelEffects.transition === 'push' && '▶ Push transition'}
                      {reelEffects.transition === 'swirl' && '🌀 Swirling vortex'}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#adb6d9' }}>
                      Duration per Image: {reelEffects.duration}s
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={reelEffects.duration}
                      onChange={(e) => setReelEffects({ ...reelEffects, duration: parseInt(e.target.value) })}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        accentColor: '#6af2c6',
                        marginBottom: '8px'
                      }}
                    />
                    <div style={{ fontSize: '11px', color: '#6af2c6' }}>
                      ⏱️ Total reel time: {reelEffects.duration * selectedImages.length}s
                    </div>
                  </div>

                  {/* Easing Function */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#adb6d9' }}>
                      Animation Easing
                    </label>
                    <select
                      value={reelEffects.easing}
                      onChange={(e) => setReelEffects({ ...reelEffects, easing: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#ffffff10',
                        border: '1px solid #6af2c6',
                        borderRadius: '8px',
                        color: '#000',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginBottom: '8px'
                      }}
                    >
                      <option value="linear">Linear</option>
                      <option value="ease-in">Ease In</option>
                      <option value="ease-out">Ease Out</option>
                      <option value="ease-in-out">Ease In-Out</option>
                      <option value="ease-in-cubic">Ease In Cubic</option>
                      <option value="ease-out-cubic">Ease Out Cubic</option>
                    </select>
                    <div style={{ fontSize: '11px', color: '#6af2c6' }}>
                      {reelEffects.easing === 'linear' && '➡️ Constant speed'}
                      {reelEffects.easing === 'ease-in' && '🚀 Starts slow, ends fast'}
                      {reelEffects.easing === 'ease-out' && '🛬 Starts fast, ends slow'}
                      {reelEffects.easing === 'ease-in-out' && '⚡ Smooth acceleration'}
                      {reelEffects.easing === 'ease-in-cubic' && '🚀🚀 Strong acceleration'}
                      {reelEffects.easing === 'ease-out-cubic' && '🛬🛬 Strong deceleration'}
                    </div>
                  </div>

                  {/* Filter Effect */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#adb6d9' }}>
                      Filter
                    </label>
                    <select
                      value={reelEffects.filter}
                      onChange={(e) => setReelEffects({ ...reelEffects, filter: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#ffffff10',
                        border: '1px solid #6af2c6',
                        borderRadius: '8px',
                        color: '#000',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginBottom: '8px'
                      }}
                    >
                      <option value="none">None</option>
                      <option value="sepia">Sepia</option>
                      <option value="vintage">Vintage</option>
                      <option value="vibrant">Vibrant</option>
                      <option value="coolBlue">Cool Blue</option>
                      <option value="warmOrange">Warm Orange</option>
                    </select>
                    <div style={{ fontSize: '11px', color: '#6af2c6' }}>
                      {reelEffects.filter === 'none' && '✓ Original colors'}
                      {reelEffects.filter === 'sepia' && '📷 Brown vintage look'}
                      {reelEffects.filter === 'vintage' && '✨ Classic film style'}
                      {reelEffects.filter === 'vibrant' && '🌈 High saturation'}
                      {reelEffects.filter === 'coolBlue' && '❄️ Cool blue tones'}
                      {reelEffects.filter === 'warmOrange' && '🔥 Warm golden tones'}
                    </div>
                  </div>

                  {/* Music */}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#adb6d9' }}>
                      Music
                    </label>
                    <select
                      value={reelEffects.music}
                      onChange={(e) => setReelEffects({ ...reelEffects, music: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#ffffff10',
                        border: '1px solid #6af2c6',
                        borderRadius: '8px',
                        color: '#000',
                        fontSize: '14px',
                        cursor: 'pointer',
                        marginBottom: '8px'
                      }}
                    >
                      <option value="none">No Music</option>
                      <option value="upbeat">🎵 Upbeat</option>
                      <option value="calm">🎵 Calm</option>
                      <option value="energetic">🎵 Energetic</option>
                    </select>
                    <div style={{ fontSize: '11px', color: '#6af2c6' }}>
                      {reelEffects.music === 'none' && '🔇 No background audio'}
                      {reelEffects.music === 'upbeat' && '🎉 Cheerful pop'}
                      {reelEffects.music === 'calm' && '😌 Relaxing ambient'}
                      {reelEffects.music === 'energetic' && '⚡ High energy'}
                    </div>
                  </div>

                  {/* Text Style */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#adb6d9' }}>
                      Text Style
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      {[ { value: 'modern', label: 'Modern' }, { value: 'retro', label: 'Retro' }, { value: 'neon', label: 'Neon' }, { value: 'shadow', label: 'Shadow' }].map((style) => (
                        <button
                          key={style.value}
                          onClick={() => setReelEffects({ ...reelEffects, textStyle: style.value })}
                          style={{
                            padding: '8px 16px',
                            background: reelEffects.textStyle === style.value ? '#6af2c6' : '#ffffff10',
                            border: '1px solid ' + (reelEffects.textStyle === style.value ? '#6af2c6' : '#ffffff30'),
                            borderRadius: '6px',
                            color: reelEffects.textStyle === style.value ? '#0a0e27' : '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            transition: 'all 0.3s'
                          }}
                        >
                          {style.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6af2c6' }}>
                      {reelEffects.textStyle === 'modern' && '✓ Clean & professional'}
                      {reelEffects.textStyle === 'retro' && '✓ Retro yellow with shadow'}
                      {reelEffects.textStyle === 'neon' && '✓ Glowing cyan effect'}
                      {reelEffects.textStyle === 'shadow' && '✓ Deep shadow effect'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: selectedImages.length >= 2 ? '' : '#ffffff20', cursor: selectedImages.length >= 2 ? 'pointer' : 'not-allowed' }}
                  disabled={selectedImages.length < 2}
                  onClick={createReel}
                >
                  Create Reel
                </button>
                <button className="btn ghost" style={{ flex: 1 }} onClick={() => { setShowReelMaker(false); setSelectedImages([]); }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reel Preview Modal */}
      {reelPreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '20px',
          overflow: 'auto'
        }} onClick={() => setReelPreview(null)}>
          <div className="card" style={{ maxWidth: '700px', width: '100%', maxHeight: '90vh', overflow: 'auto', margin: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 16px' }}>🎬 Your Reel Preview</h2>
              
              <div style={{
                width: '100%',
                aspectRatio: '9/12',
                background: '#ffffff10',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%), url(${reelPreview.images[0]?.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  padding: '20px',
                  textAlign: 'center',
                  filter: reelEffects.filter === 'sepia' ? 'sepia(100%)' 
                    : reelEffects.filter === 'vintage' ? 'saturate(1.2) contrast(0.9) brightness(1.1)'
                    : reelEffects.filter === 'vibrant' ? 'saturate(1.5) contrast(1.2)'
                    : reelEffects.filter === 'coolBlue' ? 'hue-rotate(200deg) saturate(1.2)'
                    : reelEffects.filter === 'warmOrange' ? 'hue-rotate(-15deg) saturate(1.3) brightness(1.05)'
                    : 'none'
                }}>
                  <h3 style={{ 
                    color: reelEffects.textStyle === 'neon' ? '#00ffff' : reelEffects.textStyle === 'retro' ? '#ffff00' : '#fff',
                    margin: '0 0 8px', 
                    fontSize: '20px',
                    fontFamily: reelEffects.textStyle === 'retro' ? 'Courier, monospace' : 'Arial, sans-serif',
                    textShadow: reelEffects.textStyle === 'neon' ? '0 0 10px #00ffff'
                      : reelEffects.textStyle === 'shadow' ? '4px 4px 8px rgba(0,0,0,0.8)'
                      : 'none',
                    fontWeight: 'bold'
                  }}>{reelTitle}</h3>
                  <p style={{ color: '#adb6d9', margin: '0', fontSize: '14px' }}>
                    {reelPreview.images.length} photos · {reelEffects.transition} transition · {reelEffects.duration}s per photo
                  </p>
                </div>
              </div>

              {/* Effects Summary */}
              <div style={{ background: '#ffffff08', borderRadius: '12px', padding: '12px', marginBottom: '20px', fontSize: '12px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#6af2c6' }}>✨ Effects Applied:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: '#adb6d9' }}>
                  <p style={{ margin: 0 }}>Transition: <strong>{reelEffects.transition}</strong></p>
                  <p style={{ margin: 0 }}>Filter: <strong>{reelEffects.filter}</strong></p>
                  <p style={{ margin: 0 }}>Duration: <strong>{reelEffects.duration}s</strong></p>
                  <p style={{ margin: 0 }}>Text: <strong>{reelEffects.textStyle}</strong></p>
                </div>
              </div>

              <p style={{ color: '#adb6d9', fontSize: '14px', marginBottom: '20px', textAlign: 'center' }}>
                Your reel will automatically cycle through all {reelPreview.images.length} photos with {reelEffects.transition} transitions when downloaded
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn" 
                  style={{ flex: 1, background: 'linear-gradient(135deg, #6af2c6, #00d4aa)' }}
                  onClick={downloadReel}
                >
                  ⬇️ Download Reel (Video)
                </button>
                <button className="btn ghost" style={{ flex: 1 }} onClick={() => { setReelPreview(null); setShowReelMaker(true); }}>
                  ← Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memory Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {memories.map((memory) => (
          <div key={memory.id} className="card" style={{ overflow: 'hidden' }}>
            {/* Image */}
            <div style={{
              height: '200px',
              background: `linear-gradient(135deg, #7c9cff22, #6af2c622), url(${memory.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative'
            }}>
              <button
                onClick={() => deleteMemory(memory.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </div>
            
            {/* Content */}
            <div style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 8px' }}>{memory.title}</h3>
              <p style={{ color: '#adb6d9', fontSize: '14px', margin: '0 0 12px' }}>
                {memory.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span className="pill">{memory.eventName}</span>
                <span style={{ color: '#adb6d9' }}>
                  {new Date(memory.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {memories.length === 0 && (
        <div className="card">
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#adb6d9' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📸</div>
            <h3 style={{ margin: '0 0 8px' }}>No memories yet</h3>
            <p style={{ margin: '0 0 20px' }}>Start capturing your festival moments!</p>
            <button className="btn" onClick={() => setShowUpload(true)}>
              Add Your First Memory
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflow: 'auto'
        }} onClick={() => setShowUpload(false)}>
          <div className="card" style={{ 
            maxWidth: '600px', 
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            margin: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '24px' }}>
              <h2 style={{ margin: '0 0 20px' }}>Add New Memory</h2>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Photo
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  style={{
                    padding: '40px 20px',
                    border: dragActive ? '3px solid #6af2c6' : '2px dashed #6af2c6',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: dragActive ? 'rgba(106, 242, 198, 0.15)' : 'rgba(106, 242, 198, 0.05)',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => !dragActive && (e.currentTarget.style.background = 'rgba(106, 242, 198, 0.1)')}
                  onMouseLeave={(e) => !dragActive && (e.currentTarget.style.background = 'rgba(106, 242, 198, 0.05)')}
                >
                  {newMemory.imageFile ? (
                    <div>
                      <img
                        src={newMemory.imageFile.data}
                        alt="Preview"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          width: 'auto',
                          height: 'auto',
                          borderRadius: '8px',
                          marginBottom: '12px',
                          display: 'block',
                          marginLeft: 'auto',
                          marginRight: 'auto'
                        }}
                      />
                      <p style={{ margin: '0', fontWeight: '600', color: '#6af2c6', wordBreak: 'break-all' }}>
                        ✓ {newMemory.imageFile.name}
                      </p>
                      <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#adb6d9' }}>
                        Click or drag to change photo
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
                      <p style={{ margin: '0', fontWeight: '600' }}>Click to upload photo</p>
                      <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#adb6d9' }}>
                        or drag and drop
                      </p>
                      <p style={{ margin: '12px 0 0', fontSize: '11px', color: '#7c9cff' }}>
                        Max 5MB • JPG, PNG, WebP
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Title
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g., Amazing DJ Night"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Event Name
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g., EDM Festival"
                  value={newMemory.eventName}
                  onChange={(e) => setNewMemory({ ...newMemory, eventName: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                  Description
                </label>
                <textarea
                  className="input"
                  rows="3"
                  placeholder="Share your experience..."
                  value={newMemory.description}
                  onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn" style={{ flex: 1 }} onClick={addMemory}>
                  Add Memory
                </button>
                <button className="btn ghost" style={{ flex: 1 }} onClick={() => setShowUpload(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
