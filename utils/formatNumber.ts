/**
 * Format numbers like TikTok and Instagram
 * Examples:
 * 999 -> 999
 * 1000 -> 1K
 * 1500 -> 1.5K
 * 14054 -> 14K
 * 14140 -> 14.1K
 * 100000 -> 100K
 * 1000000 -> 1M
 * 1500000 -> 1.5M
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    const thousands = num / 1000;
    // If it's a whole number of thousands, show without decimal
    if (thousands % 1 === 0) {
      return `${Math.floor(thousands)}K`;
    }
    // If the decimal part is significant (>= 0.1), show one decimal place
    const rounded = Math.round(thousands * 10) / 10;
    if (rounded % 1 === 0) {
      return `${Math.floor(rounded)}K`;
    }
    return `${rounded}K`;
  }
  
  if (num < 1000000000) {
    const millions = num / 1000000;
    // If it's a whole number of millions, show without decimal
    if (millions % 1 === 0) {
      return `${Math.floor(millions)}M`;
    }
    // If the decimal part is significant (>= 0.1), show one decimal place
    const rounded = Math.round(millions * 10) / 10;
    if (rounded % 1 === 0) {
      return `${Math.floor(rounded)}M`;
    }
    return `${rounded}M`;
  }
  
  // For billions and above
  const billions = num / 1000000000;
  if (billions % 1 === 0) {
    return `${Math.floor(billions)}B`;
  }
  const rounded = Math.round(billions * 10) / 10;
  if (rounded % 1 === 0) {
    return `${Math.floor(rounded)}B`;
  }
  return `${rounded}B`;
}

/**
 * Format follower/following counts specifically
 * This is an alias for formatNumber but can be customized if needed
 */
export function formatFollowerCount(count: number): string {
  return formatNumber(count);
}

/**
 * Format play counts
 * This is an alias for formatNumber but can be customized if needed
 */
export function formatPlayCount(count: number): string {
  return formatNumber(count);
}