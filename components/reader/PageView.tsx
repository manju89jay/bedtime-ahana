'use client';

import { useState, useCallback } from 'react';
import clsx from 'clsx';

type PageViewProps = {
  imageUrl: string;
  pageNumber: number;
  alt: string;
  nightMode?: boolean;
};

export const PageView = ({ imageUrl, pageNumber, alt, nightMode }: PageViewProps) => {
  const [zoomed, setZoomed] = useState(false);

  const toggleZoom = useCallback(() => {
    setZoomed((z) => !z);
  }, []);

  return (
    <div
      className={clsx(
        'relative aspect-square w-full max-w-[640px] cursor-pointer overflow-hidden rounded-xl',
        nightMode ? 'brightness-75' : '',
      )}
      onClick={toggleZoom}
      role="button"
      tabIndex={0}
      aria-label={zoomed ? 'Zoom out illustration' : 'Zoom in illustration'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') toggleZoom();
      }}
      data-testid="page-view"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          className={clsx(
            'h-full w-full object-cover transition-transform duration-300',
            zoomed ? 'scale-150' : 'scale-100',
          )}
          data-testid="page-image"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20">
          <span className="text-4xl text-slate-300">{pageNumber}</span>
        </div>
      )}
    </div>
  );
};
