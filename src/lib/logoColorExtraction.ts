/**
 * Extract dominant color from logo images using canvas sampling
 */

export async function extractLogoColor(logoUrl: string): Promise<string | null> {
  if (!logoUrl) return null;

  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      const timeoutId = setTimeout(() => {
        console.log('Logo color extraction timed out');
        resolve(null);
      }, 5000);

      img.onload = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(null);
            return;
          }

          // Sample at a reasonable size
          const maxSize = 100;
          const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Color frequency map
          const colorCounts: Record<string, { count: number; r: number; g: number; b: number }> = {};
          
          for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const a = pixels[i + 3];
            
            // Skip transparent pixels
            if (a < 128) continue;
            
            // Skip near-white and near-black pixels
            const brightness = (r + g + b) / 3;
            if (brightness > 240 || brightness < 15) continue;
            
            // Skip gray pixels (low saturation)
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const saturation = max === 0 ? 0 : (max - min) / max;
            if (saturation < 0.15 && brightness > 30 && brightness < 220) continue;
            
            // Quantize to reduce noise (group similar colors)
            const qr = Math.round(r / 16) * 16;
            const qg = Math.round(g / 16) * 16;
            const qb = Math.round(b / 16) * 16;
            const key = `${qr},${qg},${qb}`;
            
            if (!colorCounts[key]) {
              colorCounts[key] = { count: 0, r: qr, g: qg, b: qb };
            }
            colorCounts[key].count++;
          }
          
          // Find the most frequent non-neutral color
          let dominantColor: { r: number; g: number; b: number } | null = null;
          let maxCount = 0;
          
          for (const color of Object.values(colorCounts)) {
            if (color.count > maxCount) {
              maxCount = color.count;
              dominantColor = { r: color.r, g: color.g, b: color.b };
            }
          }
          
          if (dominantColor) {
            const hex = rgbToHex(dominantColor.r, dominantColor.g, dominantColor.b);
            console.log('Extracted logo color:', hex);
            resolve(hex);
          } else {
            console.log('No dominant color found in logo');
            resolve(null);
          }
        } catch (err) {
          console.error('Error processing logo image:', err);
          resolve(null);
        }
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        console.log('Failed to load logo image for color extraction');
        resolve(null);
      };

      img.src = logoUrl;
    });
  } catch (error) {
    console.error('Logo color extraction error:', error);
    return null;
  }
}

/**
 * Convert RGB values to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Determine if a color is warm (gold, tan, orange, red) vs cool (blue, purple, green)
 */
export function isWarmColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  
  const { h } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  // Warm hues: 0-60 (red to yellow) and 300-360 (pink to red)
  return h <= 60 || h >= 300;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l };
}

/**
 * Get a readable name for a color (for debugging)
 */
export function getColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return 'unknown';
  
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  
  if (s < 0.1) {
    if (l < 0.2) return 'black';
    if (l > 0.8) return 'white';
    return 'gray';
  }
  
  if (h < 15 || h >= 345) return 'red';
  if (h < 45) return 'orange';
  if (h < 65) return 'yellow/gold';
  if (h < 150) return 'green';
  if (h < 210) return 'cyan';
  if (h < 270) return 'blue';
  if (h < 300) return 'purple';
  return 'pink';
}
