'use client';

import { useState, useRef, useEffect } from 'react';

interface SmartLogoProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  onDark?: boolean; // true if logo is on dark background
  fallbackText?: string;
}

/**
 * SmartLogo component that handles:
 * - Image load errors gracefully
 * - Automatic contrast detection
 * - Fallback to company initials if image fails
 * - No forced inversion - shows logo as-is
 */
export function SmartLogo({ src, alt, className = '', onDark = true, fallbackText }: SmartLogoProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [needsBackground, setNeedsBackground] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setImageStatus('error');
      return;
    }

    // Reset status when src changes
    setImageStatus('loading');
    
    // Create test image to check if it loads
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      setImageStatus('loaded');
      
      // Try to detect if image is mostly transparent/white (would be invisible on light bg)
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(img.naturalWidth, 50);
        canvas.height = Math.min(img.naturalHeight, 50);
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          let transparentPixels = 0;
          let lightPixels = 0;
          const totalPixels = data.length / 4;
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];
            
            if (a < 50) {
              transparentPixels++;
            } else if (r > 230 && g > 230 && b > 230) {
              lightPixels++;
            }
          }
          
          // If logo is mostly transparent with light content, it needs a dark background
          const transparencyRatio = transparentPixels / totalPixels;
          const lightRatio = lightPixels / totalPixels;
          
          if (transparencyRatio > 0.5 && lightRatio > 0.1) {
            setNeedsBackground(true);
          }
        }
      } catch {
        // Canvas security error for cross-origin images - that's fine
        // Just show the image as-is
      }
    };
    
    img.onerror = () => {
      setImageStatus('error');
    };
    
    img.src = src;
  }, [src]);

  // Show fallback if no source or error loading
  if (!src || imageStatus === 'error') {
    if (fallbackText) {
      const initials = fallbackText
        .split(' ')
        .slice(0, 2)
        .map(word => word[0])
        .join('')
        .toUpperCase();
      
      return (
        <div 
          className={`flex items-center justify-center font-bold ${className}`}
          style={{ 
            backgroundColor: onDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            color: onDark ? 'white' : 'black',
            borderRadius: '8px',
            padding: '0.5em 1em',
          }}
        >
          {initials}
        </div>
      );
    }
    return null;
  }

  // Still loading
  if (imageStatus === 'loading') {
    return (
      <div 
        className={`animate-pulse rounded ${className}`}
        style={{ 
          backgroundColor: onDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          minWidth: '80px',
          minHeight: '32px',
        }}
      />
    );
  }

  // Image loaded successfully
  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={`${className} ${needsBackground && !onDark ? 'bg-gray-900 p-2 rounded' : ''}`}
      style={{
        // Add subtle shadow for visibility on any background
        filter: needsBackground && onDark ? 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' : undefined,
      }}
      onError={() => setImageStatus('error')}
    />
  );
}
