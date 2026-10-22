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
  X,
  Volume2,
  Globe
} from 'lucide-react';

export const Sidebar = ({ 
  activeNav, 
  setActiveNav, 
  onOpenRepo, 
  isOpen, 
  onClose,
  allRepos 
}) => {
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

  const libraryItems = [
    { id: 'dashboard', label: 'Browse', icon: Home },
    { id: 'repositories', label: 'Songs', icon: Disc3 },
    { id: 'collaborations', label: 'Albums & Stems', icon: Users },
    { id: 'projects', label: 'Artists', icon: FolderKanban },
    { id: 'radio', label: 'Radio', icon: Disc3 },
  ];

  const myMusicItems = [
    { id: 'recently-played', label: 'Recently Played', icon: Disc3 },
    { id: 'liked', label: 'Favorite Songs', icon: Heart },
    { id: 'templates', label: 'Local Files / Takes', icon: LayoutGrid },
    { id: 'shared', label: 'Shared with Me', icon: Share2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 w-64 bg-[#232528] text-[#9ba0a9] z-50 flex flex-col justify-between
        transition-transform duration-200 ease-in-out border-r border-[#1c1e20]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top: Mac Window Controls Dots + Brand Title from Dribbble shot */}
        <div className="p-5 pb-3">
          {/* macOS 3 dots */}
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm"></span>
            <span className="ml-2 text-[10px] font-mono text-neutral-500 tracking-wider">FRIENDJAM</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#a84c26] flex items-center justify-center text-white shadow-copper">
                <span className="flex items-end space-x-0.5 h-3.5">
                  <span className="w-0.5 h-2 bg-white"></span>
                  <span className="w-0.5 h-3.5 bg-white"></span>
                  <span className="w-0.5 h-2.5 bg-white"></span>
                  <span className="w-0.5 h-3.5 bg-white"></span>
                </span>
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block leading-none font-sans">
                  FriendJam
                </span>
                <span className="text-[9px] font-mono tracking-wider text-[#e5a83b] uppercase block mt-0.5 font-bold">
                  STUDIO WORKSPACE
                </span>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="lg:hidden p-1 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Middle: Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 text-xs font-sans">
          
          {/* Section: Library */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase px-3 block mb-2 font-mono">
              Library
            </span>

            {libraryItems.map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-[#393c41] text-white font-semibold shadow-sm' 
                      : 'text-[#9ba0a9] hover:bg-[#2d3034] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#e5a83b]' : 'text-[#737882]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section: My music */}
          <div className="space-y-1 pt-1">
            <span className="text-[11px] font-bold tracking-wider text-neutral-400 uppercase px-3 block mb-2 font-mono">
              My music
            </span>

            {myMusicItems.map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-[#393c41] text-white font-semibold shadow-sm' 
                      : 'text-[#9ba0a9] hover:bg-[#2d3034] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#e5a83b]' : 'text-[#737882]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#2e3136] space-y-1">
            <button
              onClick={() => { setActiveNav('settings'); if (onClose) onClose(); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition-all ${
                activeNav === 'settings'
                  ? 'bg-[#393c41] text-white font-semibold shadow-sm'
                  : 'text-[#9ba0a9] hover:bg-[#2d3034] hover:text-white'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeNav === 'settings' ? 'text-[#e5a83b]' : 'text-[#737882]'}`} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => { setActiveNav('help'); if (onClose) onClose(); }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition-all ${
                activeNav === 'help'
                  ? 'bg-[#393c41] text-white font-semibold shadow-sm'
                  : 'text-[#9ba0a9] hover:bg-[#2d3034] hover:text-white'
              }`}
            >
              <HelpCircle className={`w-4 h-4 ${activeNav === 'help' ? 'text-[#e5a83b]' : 'text-[#737882]'}`} />
              <span>Help & Support</span>
            </button>
            <button
              onClick={() => {
                window.history.pushState({}, '', '/landing');
                window.dispatchEvent(new PopStateEvent('popstate'));
                if (onClose) onClose();
              }}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl font-medium transition-all text-[#9ba0a9] hover:bg-[#2d3034] hover:text-white cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#737882]" />
              <span>Public Landing Page</span>
            </button>
          </div>

        </div>

        {/* Bottom: Sleek Floating Mini Player matching screenshot */}
        <div className="p-3 bg-[#1d1f22] border-t border-[#26282c]">
          <audio 
            ref={audioRef}
            src="/uploads/audio/adhoori-guitar-take-01.wav"
            preload="auto"
          />

          <div className="bg-[#26282d] p-3 rounded-2xl border border-[#32353b] space-y-2.5 shadow-md">
            <div className="flex items-center space-x-2.5">
              {/* Cover Art */}
              <div 
                onClick={() => onOpenRepo && onOpenRepo(activeSong)}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a84c26] to-[#451e0f] flex items-center justify-center text-white cursor-pointer hover:opacity-90 flex-shrink-0 shadow-sm"
              >
                <Disc3 className={`w-5 h-5 text-[#e5a83b] ${isPlaying ? 'animate-spin' : ''}`} />
              </div>

              <div className="flex-1 min-w-0">
                <div 
                  onClick={() => onOpenRepo && onOpenRepo(activeSong)}
                  className="font-bold text-xs text-white truncate hover:underline cursor-pointer leading-tight"
                >
                  Ahoori Kahani
                </div>
                <div className="text-[10px] text-neutral-400 font-mono truncate mt-0.5">
                  @vikash
                </div>
              </div>

              <button 
                onClick={() => setIsLiked(!isLiked)}
                className="p-1 hover:text-rose-400 transition-colors"
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : 'text-neutral-500'}`} />
              </button>
            </div>

            {/* Amber Golden Waveform Scrubber from Dribbble shot */}
            <div 
              onClick={handleSeek}
              className="h-6 flex items-center space-x-0.5 cursor-pointer px-1 bg-[#1e2023] rounded-lg py-1"
              title="Click to seek"
            >
              {[15, 30, 60, 90, 45, 75, 100, 80, 50, 85, 95, 60, 40, 70, 90, 65, 45, 80, 30, 20].map((h, i) => {
                const played = (i / 20) <= (currentTime / duration);
                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-all ${
                      played ? 'bg-[#e5a83b]' : 'bg-[#43464d]'
                    }`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>

            <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400 px-0.5">
              <span>{formatSecs(currentTime)}</span>
              <span>{formatSecs(duration)}</span>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between pt-0.5">
              <button className="text-neutral-500 hover:text-white">
                <Shuffle className="w-3 h-3" />
              </button>
              <button 
                onClick={() => { if (audioRef.current) audioRef.current.currentTime = 0; }}
                className="text-neutral-400 hover:text-white"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              {/* Amber Golden Play Button */}
              <button 
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-[#e5a83b] hover:bg-[#f0b548] flex items-center justify-center text-[#1c1e21] shadow-copper transition-transform hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-[#1c1e21]" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-[#1c1e21] ml-0.5" />
                )}
              </button>

              <button 
                onClick={() => { if (audioRef.current) audioRef.current.currentTime = duration; }}
                className="text-neutral-400 hover:text-white"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
              <button className="text-neutral-500 hover:text-white">
                <Repeat className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
