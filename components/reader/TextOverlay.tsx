'use client';

import { useState, useCallback } from 'react';
import clsx from 'clsx';

type TextOverlayProps = {
  text: { en?: string; de?: string };
  language: 'en' | 'de' | 'bilingual';
  nightMode?: boolean;
  editable?: boolean;
  onTextChange?: (text: { en?: string; de?: string }) => void;
};

export const TextOverlay = ({
  text,
  language,
  nightMode,
  editable,
  onTextChange,
}: TextOverlayProps) => {
  const [activeLang, setActiveLang] = useState<'en' | 'de'>(
    language === 'de' ? 'de' : 'en',
  );
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const displayText = activeLang === 'de' ? text.de : text.en;
  const showToggle = language === 'bilingual' && text.en && text.de;

  const startEditing = useCallback(() => {
    if (!editable) return;
    setEditing(true);
    setEditValue(displayText ?? '');
  }, [editable, displayText]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    if (onTextChange) {
      onTextChange({
        ...text,
        [activeLang]: editValue,
      });
    }
  }, [onTextChange, text, activeLang, editValue]);

  return (
    <div
      className={clsx(
        'rounded-xl px-4 py-3',
        nightMode
          ? 'bg-slate-800/90 text-slate-100'
          : 'bg-white/90 text-slate-700',
      )}
      data-testid="text-overlay"
    >
      {showToggle && (
        <div className="mb-2 flex gap-1" data-testid="lang-toggle">
          <button
            onClick={() => setActiveLang('en')}
            className={clsx(
              'rounded px-2 py-0.5 text-xs font-medium transition-colors',
              activeLang === 'en'
                ? 'bg-brand-primary text-white'
                : 'text-slate-400 hover:text-slate-600',
            )}
            data-testid="lang-en"
          >
            EN
          </button>
          <button
            onClick={() => setActiveLang('de')}
            className={clsx(
              'rounded px-2 py-0.5 text-xs font-medium transition-colors',
              activeLang === 'de'
                ? 'bg-brand-primary text-white'
                : 'text-slate-400 hover:text-slate-600',
            )}
            data-testid="lang-de"
          >
            DE
          </button>
        </div>
      )}

      {editing ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          rows={4}
          className="w-full rounded border border-slate-200 p-2 text-sm leading-relaxed focus:border-brand-primary focus:outline-none"
          autoFocus
          data-testid="text-editor"
        />
      ) : (
        <div className="flex items-start gap-2">
          <p
            className="flex-1 text-sm leading-relaxed"
            data-testid="page-text"
          >
            {displayText || '(no text)'}
          </p>
          {editable && (
            <button
              onClick={startEditing}
              className="shrink-0 rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-400 hover:bg-slate-50"
              data-testid="edit-button"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
};
