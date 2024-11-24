import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { SubtitleDisplay } from './SubtitleDisplay';

interface PlaygroundProps {
  mediaUrl?: string;
  subtitles?: Subtitle[];
}

interface Subtitle {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
}

export function Playground({ mediaUrl, subtitles }: PlaygroundProps) {
  
  
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    const subtitle = subtitles?.find(
      sub => progress >= sub.startTime && progress <= sub.endTime
    );
    setCurrentSubtitle(subtitle || null);
  }, [progress, subtitles]);

  const handleProgress = (state: { playedSeconds: number }) => {
    setProgress(state.playedSeconds);
  };

  const handleSkip = (direction: 'forward' | 'backward') => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const newTime = direction === 'forward' ? currentTime + 10 : currentTime - 10;
      playerRef.current.seekTo(newTime);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="aspect-video relative bg-black">
        <ReactPlayer
          ref={playerRef}
          url={mediaUrl}
          width="100%"
          height="100%"
          playing={playing}
          onProgress={handleProgress}
          progressInterval={100}
        />
        <SubtitleDisplay subtitle={currentSubtitle?.text} />
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleSkip('backward')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <SkipBack className="w-6 h-6 text-gray-700" />
            </button>
            
            <button
              onClick={() => setPlaying(!playing)}
              className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
            >
              {playing ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={() => handleSkip('forward')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <SkipForward className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex-1 mx-4">
            <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const percent = (e.clientX - rect.left) / rect.width;
                   playerRef.current?.seekTo(percent);
                 }}>
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                style={{ width: `${(progress / (playerRef.current?.getDuration() || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle Editor */}
      <div className="p-4 border-t border-gray-200 max-h-48 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">Subtitles</h3>
        <div className="space-y-2">
          {subtitles?.map((subtitle) => (
            <div
              key={subtitle.id}
              className={`p-2 rounded ${
                currentSubtitle?.id === subtitle.id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => playerRef.current?.seekTo(subtitle.startTime)}
            >
              <div className="text-sm text-gray-500">
                {formatTime(subtitle.startTime)} → {formatTime(subtitle.endTime)}
              </div>
              <div className="text-gray-800">{subtitle.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const pad = (num: number) => num.toString().padStart(2, '0');
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${pad(minutes)}:${pad(remainingSeconds)}`;
}