import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function Logo({ className = "" }: { className?: string }) {
  const [imageError, setImageError] = useState(false);
  
  // Check if the logo exists on component mount
  useEffect(() => {
    // Create an image object to check if the logo loads
    const img = new window.Image();
    img.src = '/logo.svg';
    img.onerror = () => setImageError(true);
  }, []);

  if (imageError) {
    // SVG fallback rendered directly in the component
    return (
      <div className={`relative w-8 h-8 ${className}`}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="currentColor" />
          <path d="M19 8H13C11.3431 8 10 9.34315 10 11V17C10 18.6569 11.3431 20 13 20H19C20.6569 20 22 18.6569 22 17V11C22 9.34315 20.6569 8 19 8Z" stroke="white" strokeWidth="2" />
          <path d="M15 11V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 12V16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <rect x="10" y="22" width="12" height="2" rx="1" fill="white" />
        </svg>
      </div>
    );
  }

  // Use the Image component with immediate fallback on error
  return (
    <div className="relative w-8 h-8">
      <Image
        src="/logo.svg"
        alt=""
        width={32}
        height={32}
        className={className}
        priority
        onError={() => setImageError(true)}
      />
    </div>
  );
} 