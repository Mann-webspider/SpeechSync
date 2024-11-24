import React from 'react';

interface SubtitleDisplayProps {
  subtitle: string | undefined;
}

export function SubtitleDisplay({ subtitle }: SubtitleDisplayProps) {
  if (!subtitle) return null;

  return (
    <div className="absolute bottom-8 left-0 right-0 flex justify-center">
      <div className="bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-lg text-center max-w-2xl">
        {subtitle}
      </div>
    </div>
  );
}