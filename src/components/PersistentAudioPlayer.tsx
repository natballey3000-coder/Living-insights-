import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import type { UnifiedResource } from '../types/platform.ts';

interface PersistentAudioPlayerProps {
  track: UnifiedResource | null;
  onClose: () => void;
  onOpenDetail: (resource: UnifiedResource) => void;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export const PersistentAudioPlayer: React.FC<PersistentAudioPlayerProps> = ({
  track,
  onClose,
  onOpenDetail,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [resumedFrom, setResumedFrom] = useState<number | null>(null);

  useEffect(() => {
    if (!track?.mediaUrl || !audioRef.current) return;
    setLoadError(null);
    setResumedFrom(null);

    const audio = audioRef.current;
    audio.src = track.mediaUrl;
    audio.playbackRate = playbackRate;

    try {
      const saved = localStorage.getItem(`ifl_resume_${track.id}`);
      if (saved) {
        const parsed = Number(saved);
        if (Number.isFinite(parsed) && parsed > 5) {
          audio.currentTime = parsed;
          setResumedFrom(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [track?.id, track?.mediaUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  if (!track) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setLoadError('Audio playback could not start. Try opening the source link directly.'));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (audioRef.current && Number.isFinite(val)) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const rewind15 = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
  };

  return (
    <aside
      aria-label="Audio Teaching Player"
      className="fixed bottom-14 lg:bottom-0 left-0 right-0 z-30 bg-[#181615] text-[#F9F7F3] border-t border-[#2E2A27] px-4 py-3 shadow-lg"
    >
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => {
          if (!audioRef.current) return;
          const t = audioRef.current.currentTime;
          setCurrentTime(t);
          if (Math.floor(t) % 5 === 0 && t > 5) {
            try {
              localStorage.setItem(`ifl_resume_${track.id}`, String(Math.floor(t)));
            } catch {
              // ignore
            }
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration || 0);
        }}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setLoadError('Audio stream unavailable in browser player. Use Open Source below.');
        }}
      />

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center justify-between gap-3 min-w-0 flex-1">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onOpenDetail(track)}
              className="text-sm font-semibold text-[#F9F7F3] hover:underline truncate block text-left max-w-[260px] sm:max-w-md cursor-pointer"
            >
              {track.title}
            </button>
            <p className="text-xs text-[#B8B1A8] truncate">
              {track.speakerOrAuthor}
              {resumedFrom ? ` · Resumed from ${formatTime(resumedFrom)}` : ''}
            </p>
            {loadError && <p className="text-xs text-amber-300 mt-0.5">{loadError}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close audio player"
            className="sm:hidden min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#B8B1A8] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={rewind15}
            aria-label="Rewind 15 seconds"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-[#B8B1A8] hover:text-white rounded cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause teaching' : 'Play teaching'}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center bg-[#F9F7F3] text-[#181615] rounded-full hover:bg-[#EFECE6] transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-[140px] sm:w-52">
            <span className="text-[11px] text-[#B8B1A8] tabular-nums">{formatTime(currentTime)}</span>
            <input
              type="range"
              aria-label="Seek audio position"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full accent-[#C68B59] cursor-pointer"
            />
            <span className="text-[11px] text-[#B8B1A8] tabular-nums">
              {duration ? formatTime(duration) : '--:--'}
            </span>
          </div>

          <button
            type="button"
            onClick={cycleSpeed}
            aria-label={`Playback speed ${playbackRate}x`}
            className="px-2.5 py-1.5 text-xs font-medium text-[#F9F7F3] border border-[#3C3733] rounded hover:bg-[#2B2825] tabular-nums whitespace-nowrap shrink-0 cursor-pointer"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            className="min-h-[40px] min-w-[40px] hidden sm:inline-flex items-center justify-center text-[#B8B1A8] hover:text-white cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <a
            href={track.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open original teaching page"
            className="min-h-[40px] px-2.5 inline-flex items-center gap-1 text-xs text-[#B8B1A8] hover:text-white whitespace-nowrap shrink-0"
          >
            <span>Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close audio player"
            className="hidden sm:inline-flex min-h-[40px] min-w-[40px] items-center justify-center text-[#B8B1A8] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
