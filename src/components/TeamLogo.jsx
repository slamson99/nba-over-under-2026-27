import React, { useState } from 'react';

export function TeamLogo({ team, abbr, logoUrl, fallbackLogoUrl, size = "w-6 h-6" }) {
  const [imgSrc, setImgSrc] = useState(logoUrl);
  const [failedAll, setFailedAll] = useState(false);

  const handleError = () => {
    if (imgSrc !== fallbackLogoUrl && fallbackLogoUrl) {
      setImgSrc(fallbackLogoUrl);
    } else {
      setFailedAll(true);
    }
  };

  if (failedAll) {
    return (
      <div className={`${size} bg-[#1A1D23] border border-[#2A2F3A] flex items-center justify-center text-[10px] font-mono font-bold text-[#9CA3AF] shrink-0`}>
        {(abbr || team?.slice(0, 3) || 'NBA').toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={`${team} official logo`}
      onError={handleError}
      className={`${size} object-contain shrink-0`}
      loading="lazy"
    />
  );
}
