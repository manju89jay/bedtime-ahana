'use client';

import { useState, useCallback } from 'react';
import clsx from 'clsx';

type AudioPlayerProps = {
  audioUrl?: string;
  nightMode?: boolean;
};

export const AudioPlayer = ({ audioUrl, nightMode }: AudioPlayerProps) => {
  const [playing, setPlaying] = useState(false);

  const togglePlay = useCallback(() => {
    if (!audioUrl) return;
    setPlaying((p) => !p);
    // In production, this would create/control an Audio element
    // For now, toggle the visual state
  }, [audioUrl]);

  if (!audioUrl) return null;

  return (
    <button
      onClick={togglePlay}
      className={clsx(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
        nightMode
          ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
      )}
      data-testid="audio-player"
      aria-label={playing ? 'Pause narration' : 'Play narration'}
    >
      <span className="text-base">{playing ? '\u23F8' : '\u25B6'}</span>
      <span>{playing ? 'Pause' : 'Listen'}</span>
    </button>
  );
};
