import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  Disc3, 
  Users, 
  FolderKanban, 
  Heart, 
  LayoutGrid, 
  Share2, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Menu,
  X
} from 'lucide-react';

export const Sidebar = ({ 
  activeNav, 
  setActiveNav, 
  onOpenRepo, 
  isOpen, 
  onClose,
  allRepos 
}) => {
  // Mini Player State for bottom of sidebar
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(16);
  const [isLiked, setIsLiked] = useState(true);
  const audioRef = useRef(null);

  const activeSong = allRepos?.find(r => r.slug === 'adhoori-kahani') || {
    name: 'Ahoori Kahani',
    owner: { username: 'vikash' }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 16);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(e => console.warn('Playback notice:', e.message));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatSecs = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'repositories', label: 'Song Repositories', icon: Disc3 },
    { id: 'collaborations', label: 'Collaborations', icon: Users },
    { id: 'projects', label: 'My Projects', icon: FolderKanban },
    { id: 'liked', label: 'Liked Songs', icon: Heart },
    { id: 'templates', label: 'Templates', icon: LayoutGrid },
    { id: 'shared', label: 'Shared with Me', icon: Share2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-none"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-[#f5f3ec] border-r-2 border-black z-50 flex flex-col justify-between
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top: Logo & Tagline */}
        <div className="p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            {/* Waveform graphic in acid yellow */}
            <div className="w-8 h-8 bg-black border-2 border-black flex items-center justify-center text-[#d7ff3b] font-mono font-bold shadow-brutal-sm">
              <span className="flex items-end space-x-0.5 h-4">
                <span className="w-0.5 h-2 bg-[#d7ff3b]"></span>
                <span className="w-0.5 h-4 bg-[#d7ff3b]"></span>
                <span className="w-0.5 h-3 bg-[#d7ff3b]"></span>
                <span className="w-0.5 h-4 bg-[#d7ff3b]"></span>
                <span className="w-0.5 h-1.5 bg-[#d7ff3b]"></span>
              </span>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-black block leading-none font-sans">
                MusicCollab
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-neutral-600 block mt-0.5">
                CREATE • COLLABORATE • RELEASE
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-[#ede8dc] border border-black"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Middle: Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 font-mono text-xs">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  if (item.id === 'repositories' && allRepos?.length > 0) {
                    // stays on dashboard or filters
                  }
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 font-bold transition-all border ${
                  isActive 
                    ? 'bg-[#d7ff3b] text-black border-black shadow-brutal-sm' 
                    : 'bg-transparent text-neutral-800 border-transparent hover:bg-[#ede8dc] hover:border-black'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black stroke-[2.5]' : 'text-neutral-600'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t-2 border-black space-y-1">
            <button
              onClick={() => { setActiveNav('settings'); if (onClose) onClose(); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 font-bold border transition-all ${
                activeNav === 'settings' 
                  ? 'bg-black text-[#d7ff3b] border-black shadow-brutal-sm' 
                  : 'bg-transparent text-neutral-700 border-transparent hover:bg-[#ede8dc]'
              }`}
            >
              <Settings className="w-4 h-4 text-neutral-600" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => { setActiveNav('help'); if (onClose) onClose(); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 font-bold border transition-all ${
                activeNav === 'help' 
                  ? 'bg-black text-[#d7ff3b] border-black shadow-brutal-sm' 
                  : 'bg-transparent text-neutral-700 border-transparent hover:bg-[#ede8dc]'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-neutral-600" />
              <span>Help & Support</span>
            </button>
          </div>
        </div>

        {/* Bottom: Sticky Mini Audio Player matching screenshot */}
        <div className="p-3 bg-[#ede8dc] border-t-2 border-black">
          {/* Hidden real audio element */}
          <audio 
            ref={audioRef}
            src="/uploads/audio/adhoori-guitar-take-01.wav"
            preload="auto"
          />

          <div className="flex items-center space-x-2.5 mb-2">
            {/* Song cover art thumbnail */}
            <div 
              onClick={() => onOpenRepo && onOpenRepo(activeSong)}
              className="w-10 h-10 border-2 border-black bg-gradient-to-br from-amber-600 to-rose-900 cursor-pointer flex-shrink-0 relative overflow-hidden flex items-center justify-center text-[#d7ff3b] text-xs font-bold font-mono shadow-brutal-sm hover:scale-105 transition-transform"
              title="Click to open repository"
            >
              <Disc3 className={`w-5 h-5 text-white ${isPlaying ? 'animate-spin' : ''}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div 
                onClick={() => onOpenRepo && onOpenRepo(activeSong)}
                className="font-bold text-xs truncate text-black hover:underline cursor-pointer"
              >
                Ahoori Kahani
              </div>
              <div className="text-[10px] text-neutral-600 font-mono truncate">
                @vikash
              </div>
            </div>

            <button 
              onClick={() => setIsLiked(!isLiked)}
              className="p-1 hover:text-rose-600"
              title="Favorite"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'}`} />
            </button>
          </div>

          {/* Time scrubber */}
          <div className="space-y-1">
            <div 
              onClick={handleSeek}
              className="h-1.5 bg-neutral-300 border border-black cursor-pointer relative"
            >
              <div 
                className="h-full bg-black"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>

            <div className="flex justify-between text-[9px] font-mono text-neutral-500">
              <span>{formatSecs(currentTime)}</span>
              <span>{formatSecs(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between pt-1">
            <button className="text-neutral-600 hover:text-black">
              <Shuffle className="w-3 h-3" />
            </button>
            <button 
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = 0;
              }}
              className="text-neutral-700 hover:text-black"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause Button in acid yellow circle */}
            <button 
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-[#d7ff3b] border-2 border-black flex items-center justify-center text-black hover:scale-105 shadow-brutal-sm"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-black" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
              )}
            </button>

            <button 
              onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = duration;
              }}
              className="text-neutral-700 hover:text-black"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
            <button className="text-neutral-600 hover:text-black">
              <Repeat className="w-3 h-3" />
            </button>
          </div>
        </div>

      </aside>
    </>
  );
};
