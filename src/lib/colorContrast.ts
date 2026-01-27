/**
 * WCAG-compliant color contrast utilities
 * Ensures text is always readable against backgrounds
 */

/**
 * Convert hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Handle shorthand hex (#fff) and full hex (#ffffff)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  
  // Handle shorthand
  const shorthand = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hex);
  if (shorthand) {
    return {
      r: parseInt(shorthand[1] + shorthand[1], 16),
      g: parseInt(shorthand[2] + shorthand[2], 16),
      b: parseInt(shorthand[3] + shorthand[3], 16),
    };
  }
  
  return null;
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5; // Return middle value if parsing fails
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * WCAG requires 4.5:1 for normal text, 3:1 for large text
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color combination passes WCAG AA standard
 * Normal text: 4.5:1, Large text (18pt+): 3:1
 */
export function passesContrastCheck(
  textColor: string,
  bgColor: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(textColor, bgColor);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Determine if a color is "dark" based on luminance
 */
export function isDarkColor(hex: string): boolean {
  return getLuminance(hex) < 0.5;
}

/**
 * Get a readable text color against a background
 * Prefers the suggested color if it has sufficient contrast
 * Otherwise returns white or black
 */
export function getReadableTextColor(
  backgroundColor: string,
  preferredColor?: string
): string {
  // Default to a neutral if no background specified
  if (!backgroundColor) {
    return '#000000';
  }
  
  // If preferred color has good contrast, use it
  if (preferredColor && passesContrastCheck(preferredColor, backgroundColor, true)) {
    return preferredColor;
  }
  
  // Otherwise, pick white or black based on background luminance
  const bgLuminance = getLuminance(backgroundColor);
  return bgLuminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Get text color for CTA buttons
 * Always ensures readable text on the button background
 */
export function getButtonTextColor(buttonBgColor: string): string {
  if (!buttonBgColor) return '#FFFFFF';
  return isDarkColor(buttonBgColor) ? '#FFFFFF' : '#000000';
}

/**
 * Get a semi-transparent overlay color for text readability
 * Returns an rgba color that ensures text contrast
 */
export function getTextOverlayColor(forDarkText: boolean): string {
  return forDarkText
    ? 'rgba(255, 255, 255, 0.85)'
    : 'rgba(0, 0, 0, 0.6)';
}

/**
 * Lighten or darken a hex color by a percentage
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const adjust = (value: number) => {
    const adjusted = Math.round(value + (255 * percent) / 100);
    return Math.max(0, Math.min(255, adjusted));
  };
  
  const r = adjust(rgb.r);
  const g = adjust(rgb.g);
  const b = adjust(rgb.b);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generate a contrasting accent color that works with both light and dark backgrounds
 */
export function getContrastingAccent(primaryColor: string, isDarkBg: boolean): string {
  if (!primaryColor) {
    return isDarkBg ? '#FFFFFF' : '#000000';
  }
  
  // If primary is too dark for dark bg, lighten it
  if (isDarkBg && isDarkColor(primaryColor)) {
    return adjustColorBrightness(primaryColor, 40);
  }
  
  // If primary is too light for light bg, darken it
  if (!isDarkBg && !isDarkColor(primaryColor)) {
    return adjustColorBrightness(primaryColor, -30);
  }
  
  return primaryColor;
}
