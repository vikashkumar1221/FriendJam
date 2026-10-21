import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Plus, 
  ArrowRight, 
  Disc3, 
  Users, 
  FolderKanban, 
  HardDrive, 
  Music, 
  UserPlus, 
  GitCommit, 
  GitMerge, 
  MessageSquare, 
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const StudioDashboard = ({ 
  onOpenRepo, 
  onOpenNewRepoModal, 
  onInviteModal,
  searchQuery,
  onSearch,
  allRepos = [],
  onRefreshRepos,
  onOpenMessage
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const data = await api.getGlobalActivities();
      if (data.activities && data.activities.length > 0) {
        setActivities(data.activities);
      } else {
        setActivities([
          {
            _id: 'act-1',
            user: { username: 'neha', displayName: 'Neha' },
            action: 'TAKE_UPLOADED',
            details: 'added a new vocal take on Raat Ke Safar',
            createdAt: new Date(Date.now() - 3600000 * 2)
          },
          {
            _id: 'act-2',
            user: { username: 'arjun', displayName: 'Arjun' },
            action: 'COMMENT_POSTED',
            details: 'commented on Adhoori Kahani "This chorus sounds amazing! 🔥"',
            createdAt: new Date(Date.now() - 3600000 * 4)
          },
          {
            _id: 'act-3',
            user: { username: 'vikash', displayName: 'You' },
            action: 'COMMIT_PUSHED',
            details: 'pushed changes to Laal Dhun',
            createdAt: new Date(Date.now() - 3600000 * 6)
          },
          {
            _id: 'act-4',
            user: { username: 'rohan', displayName: 'Rohan' },
            action: 'MEMBER_JOINED',
            details: 'joined the collaboration on Nayi Subah',
            createdAt: new Date(Date.now() - 3600000 * 24)
          },
          {
            _id: 'act-5',
            user: { username: 'neha', displayName: 'Neha' },
            action: 'PR_MERGED',
            details: 'merged take PR #4 into main',
            createdAt: new Date(Date.now() - 3600000 * 26)
          }
        ]);
      }
    } catch {
      // ignore
    }
  };

  // Featured flagship projects for the LANDR-style 3D showcase carousel
  const featuredProjects = [
    {
      slug: 'adhoori-kahani',
      artistBadge: 'FEATURED WORKSPACE • @vikash',
      title: 'ADHOORI KAHANI',
      tags: ['Indie Folk', 'Acoustic Guitar', 'Rock'],
      description: 'An acoustic indie-rock ballad with synchronized multitrack stems, warm fingerpicked Martin D-28, soaring vocal harmonies, and 4-track branch takes.',
      bpm: 96,
      key: 'E min',
      time: '04:12',
      bg: 'from-[#b85328] via-[#8c3a19] to-[#3a1508]',
      artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop'
    },
    {
      slug: 'raat-ke-safar',
      artistBadge: 'FEATURED WORKSPACE • @neha',
      title: 'RAAT KE SAFAR',
      tags: ['Lo-fi', 'Ambient', 'Chillhop'],
      description: 'Late-night lo-fi chillhop track with rain textures, Rhodes piano chords, muted trumpet and relaxed groove.',
      bpm: 78,
      key: 'D min',
      time: '03:45',
      bg: 'from-[#2b3a4a] via-[#1f2834] to-[#121921]',
      artwork: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=600&auto=format&fit=crop'
    },
    {
      slug: 'laal-dhun',
      artistBadge: 'FEATURED WORKSPACE • @vikash',
      title: 'LAAL DHUN',
      tags: ['Alternative', 'Fuzz Rock', 'Indie'],
      description: 'Punchy alternative indie rock with fuzz bass, driving rhythm, soaring vocal layers, and live guitar solos.',
      bpm: 128,
      key: 'A min',
      time: '03:28',
      bg: 'from-[#8f2b24] via-[#631a15] to-[#2b0c0a]',
      artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop'
    },
    {
      slug: 'sheher-se-door',
      artistBadge: 'FEATURED WORKSPACE • @arjun-drums',
      title: 'SHEHER SE DOOR',
      tags: ['Acoustic', 'Fingerstyle', 'Chill'],
      description: 'Gentle fingerstyle acoustic ballad capturing sunset over the hills with delicate backing vocals and 3/4 waltz time.',
      bpm: 88,
      key: 'G maj',
      time: '03:15',
      bg: 'from-[#4e5b52] via-[#353f38] to-[#1b221d]',
      artwork: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop'
    },
    {
      slug: 'nayi-subah',
      artistBadge: 'FEATURED WORKSPACE • @vikash',
      title: 'NAYI SUBAH',
      tags: ['Pop', 'Hindi Indie', 'Synth'],
      description: 'Upbeat Hindi indie-pop with uplifting synth hooks, acoustic strumming, crisp percussion and bass arrangement.',
      bpm: 114,
      key: 'D maj',
      time: '03:50',
      bg: 'from-[#d97706] via-[#b45309] to-[#451a03]',
      artwork: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop'
    }
  ];

  const currentProject = featuredProjects[featuredIndex];
  const prevProject = featuredProjects[(featuredIndex - 1 + featuredProjects.length) % featuredProjects.length];
  const nextProject = featuredProjects[(featuredIndex + 1) % featuredProjects.length];

  // Real production-grade track data, waveforms, and musical attributes
  const songThumbnails = {
    'adhoori-kahani': {
      bg: 'from-[#b85328] via-[#8c3a19] to-[#3a1508]',
      label: 'Adhoori Kahani',
      tags: ['indie folk', 'acoustic guitar', 'ballad'],
      duration: '04:12',
      bpm: 96,
      key: 'E min',
      timeSig: '4/4',
      status: 'Tracking',
      waveform: [20, 35, 60, 85, 95, 70, 80, 100, 75, 55, 90, 85, 60, 40, 65, 80, 95, 70, 50, 35, 25, 15]
    },
    'raat-ke-safar': {
      bg: 'from-[#2b3a4a] via-[#1f2834] to-[#121921]',
      label: 'Raat Ke Safar',
      tags: ['lo-fi', 'ambient', 'chillhop'],
      duration: '03:45',
      bpm: 78,
      key: 'D min',
      timeSig: '4/4',
      status: 'Mixing',
      waveform: [15, 25, 40, 50, 45, 60, 55, 65, 70, 50, 45, 55, 60, 50, 40, 45, 50, 35, 30, 25, 20, 15]
    },
    'laal-dhun': {
      bg: 'from-[#8f2b24] via-[#631a15] to-[#2b0c0a]',
      label: 'Laal Dhun',
      tags: ['alternative', 'fuzz rock', 'indie'],
      duration: '03:28',
      bpm: 128,
      key: 'A min',
      timeSig: '4/4',
      status: 'Tracking',
      waveform: [35, 60, 85, 100, 90, 95, 80, 100, 90, 85, 95, 100, 75, 85, 90, 95, 80, 70, 60, 45, 30, 20]
    },
    'sheher-se-door': {
      bg: 'from-[#4e5b52] via-[#353f38] to-[#1b221d]',
      label: 'Sheher Se Door',
      tags: ['acoustic', 'fingerstyle', 'chill'],
      duration: '03:15',
      bpm: 88,
      key: 'G maj',
      timeSig: '3/4',
      status: 'Arrangement',
      waveform: [15, 30, 45, 55, 70, 65, 50, 60, 75, 65, 50, 60, 70, 60, 45, 55, 65, 50, 40, 30, 20, 15]
    },
    'nayi-subah': {
      bg: 'from-[#d97706] via-[#b45309] to-[#451a03]',
      label: 'Nayi Subah',
      tags: ['pop', 'hindi indie', 'synth'],
      duration: '03:50',
      bpm: 114,
      key: 'D maj',
      timeSig: '4/4',
      status: 'Tracking',
      waveform: [25, 45, 70, 85, 75, 90, 80, 85, 95, 80, 70, 85, 90, 80, 65, 75, 85, 70, 55, 40, 30, 20]
    }
  };

  // Distinct studio collaborators (each profile appears once)
  const collaborators = [
    { username: 'vikash', name: 'Vikash Sharma', role: 'Songwriter & Producer', initial: 'V', color: 'from-[#b85328] to-[#8c3a19]' },
    { username: 'neha', name: 'Neha Sharma', role: 'Vocalist & Producer', initial: 'N', color: 'from-[#7c3aed] to-[#5b21b6]' },
    { username: 'maya-vocals', name: 'Maya Patel', role: 'Lead Vocalist & Lyricist', initial: 'M', color: 'from-[#d97706] to-[#b45309]' },
    { username: 'sid-guitar', name: 'Siddharth Roy', role: 'Lead Guitarist', initial: 'S', color: 'from-[#2563eb] to-[#1d4ed8]' },
    { username: 'arjun-drums', name: 'Arjun Mehta', role: 'Drummer & Percussionist', initial: 'A', color: 'from-[#059669] to-[#047857]' },
    { username: 'rohan', name: 'Rohan Verma', role: 'Bass & Arrangement', initial: 'R', color: 'from-[#475569] to-[#1e293b]' },
  ];

  // LANDR-style quick genre / attribute filter tags
  const filterTags = [
    { id: 'all', label: 'All Tracks' },
    { id: 'indie', label: 'Indie Folk / Rock' },
    { id: 'lo-fi', label: 'Lo-fi / Ambient' },
    { id: 'alternative', label: 'Alternative' },
    { id: 'acoustic', label: 'Acoustic' },
    { id: 'pop', label: 'Pop / Hindi' }
  ];

  const filteredRepos = (allRepos || []).filter(r => {
    const meta = songThumbnails[r.slug] || {};
    const matchesSearch = !searchQuery || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.genre || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === 'all' || 
      (r.genre || '').toLowerCase().includes(selectedTag.toLowerCase()) ||
      (meta.tags || []).some(t => t.toLowerCase().includes(selectedTag.toLowerCase()));

    return matchesSearch && matchesTag;
  });

  // KPI Metrics
  const totalReposCount = allRepos.length;
  const projectsOwnedCount = allRepos.filter(r => 
    r.owner?._id === user?.id || 
    r.owner?.username === user?.username || 
    r.myRole === 'owner'
  ).length || Math.min(totalReposCount, 3);
  const totalCollaboratorsCount = collaborators.length;
  const storageUsed = '2.4 GB';
  const storageTotal = '10 GB';
  const storagePct = 24;

  const getActivityIcon = (action) => {
    switch (action) {
      case 'TAKE_UPLOADED':
        return <Music className="w-3.5 h-3.5 text-[#a84c26]" />;
      case 'COMMENT_POSTED':
        return <MessageSquare className="w-3.5 h-3.5 text-[#2563eb]" />;
      case 'COMMIT_PUSHED':
        return <GitCommit className="w-3.5 h-3.5 text-[#059669]" />;
      case 'PR_MERGED':
        return <GitMerge className="w-3.5 h-3.5 text-[#7c3aed]" />;
      case 'MEMBER_JOINED':
        return <UserPlus className="w-3.5 h-3.5 text-[#d97706]" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#a84c26]" />;
    }
  };

  const formatActivityTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffHours = Math.floor((now - d) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      
      {/* 1. LANDR-Inspired "For you" Spotlight Showcase Carousel */}
      <div className="rounded-3xl bg-gradient-to-br from-[#181a20] via-[#20232b] to-[#121418] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl border border-white/10">
        
        {/* Subtle background ambient glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-[#a84c26]/20 via-transparent to-transparent pointer-events-none" />

        {/* Top Header & Search Bar (from LANDR screenshot) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm sm:text-base font-bold font-sans tracking-wide text-white">
              For you
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-xs font-mono text-[#e5a83b] uppercase tracking-wider">
              Studio Spotlight
            </span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch && onSearch(e.target.value)}
              placeholder="Search instruments, genres, keyword..."
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 focus:border-[#e5a83b] rounded-full text-xs text-white placeholder-neutral-400 outline-none transition-all"
            />
          </div>
        </div>

        {/* Showcase Grid: Left Details + Right 3D Layered Artwork Stack */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left: Project Details & Single Primary Action */}
          <div className="lg:col-span-7 space-y-4">
            
            <div className="inline-flex items-center space-x-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono font-bold tracking-wider text-[#e5a83b] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e5a83b]" />
              <span>{currentProject.artistBadge}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-sans text-white uppercase leading-none">
              {currentProject.title}
            </h1>

            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {currentProject.tags.map((t, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-white/10 text-neutral-200 border border-white/5"
                >
                  {t}
                </span>
              ))}
              <span className="text-[11px] font-mono text-[#e5a83b] ml-1">
                {currentProject.bpm} BPM • {currentProject.key}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed font-sans max-w-xl">
              {currentProject.description}
            </p>

            {/* Actions: The SINGLE primary "Create Repository" action + "Open Workspace" */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onOpenNewRepoModal}
                className="studio-btn-amber px-6 py-3 text-xs font-bold inline-flex items-center space-x-2 shadow-copper hover:brightness-105 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Repository</span>
              </button>

              <button
                onClick={() => {
                  const target = allRepos?.find(r => r.slug === currentProject.slug);
                  if (target && onOpenRepo) onOpenRepo(target);
                }}
                className="px-5 py-3 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-full inline-flex items-center space-x-2 transition-all"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Right: 3D Layered Artwork Stack (LANDR Spotlight Reference) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            
            <div className="relative flex items-center justify-center h-64 sm:h-72 w-full max-w-sm select-none">
              
              {/* Left peeking cover */}
              <div 
                onClick={() => setFeaturedIndex((featuredIndex - 1 + featuredProjects.length) % featuredProjects.length)}
                className="absolute left-1 sm:left-4 w-36 sm:w-44 h-36 sm:h-44 rounded-2xl overflow-hidden shadow-2xl opacity-50 -rotate-6 scale-90 cursor-pointer hover:opacity-75 transition-all border border-white/10"
                title={`Previous: ${prevProject.title}`}
              >
                <img 
                  src={prevProject.artwork} 
                  alt={prevProject.title}
                  className="w-full h-full object-cover" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${prevProject.bg} opacity-60`} />
              </div>

              {/* Right peeking cover */}
              <div 
                onClick={() => setFeaturedIndex((featuredIndex + 1) % featuredProjects.length)}
                className="absolute right-1 sm:right-4 w-36 sm:w-44 h-36 sm:h-44 rounded-2xl overflow-hidden shadow-2xl opacity-50 rotate-6 scale-90 cursor-pointer hover:opacity-75 transition-all border border-white/10"
                title={`Next: ${nextProject.title}`}
              >
                <img 
                  src={nextProject.artwork} 
                  alt={nextProject.title}
                  className="w-full h-full object-cover" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${nextProject.bg} opacity-60`} />
              </div>

              {/* Center active cover */}
              <div 
                onClick={() => {
                  const target = allRepos?.find(r => r.slug === currentProject.slug);
                  if (target && onOpenRepo) onOpenRepo(target);
                }}
                className="relative z-10 w-44 sm:w-52 h-44 sm:h-52 rounded-2xl overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.8)] cursor-pointer hover:scale-105 transition-all border-2 border-white/20 group"
                title={`Click to open ${currentProject.title}`}
              >
                <img 
                  src={currentProject.artwork} 
                  alt={currentProject.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${currentProject.bg} opacity-60`} />
                
                <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/15">
                      MASTER STEM
                    </span>
                    <Disc3 className="w-5 h-5 text-[#f5be57] animate-spin" />
                  </div>

                  <div>
                    <span className="font-extrabold text-sm sm:text-base tracking-tight block drop-shadow-md">
                      {currentProject.title}
                    </span>
                    <span className="text-[10px] text-amber-200 font-mono block">
                      {currentProject.bpm} BPM • {currentProject.key}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Carousel navigation dots */}
            <div className="flex items-center space-x-2 pt-3">
              {featuredProjects.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setFeaturedIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    featuredIndex === idx 
                      ? 'w-6 bg-[#f5be57]' 
                      : 'w-2 bg-white/25 hover:bg-white/50'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* 2. Four Compact Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Repositories */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7a7e85] uppercase font-mono tracking-wide">
              Total Repositories
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#f0f9f4] flex items-center justify-center text-[#059669]">
              <Music className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-sans text-[#1c1e21]">
              {totalReposCount}
            </div>
            <div className="text-[11px] text-[#059669] font-medium mt-1">
              Active song projects
            </div>
          </div>
        </div>

        {/* Card 2: Collaborators */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7a7e85] uppercase font-mono tracking-wide">
              Collaborators
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-sans text-[#1c1e21]">
              {totalCollaboratorsCount}
            </div>
            <div className="text-[11px] text-[#7a7e85] font-medium mt-1">
              Active in network
            </div>
          </div>
        </div>

        {/* Card 3: Projects Owned */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7a7e85] uppercase font-mono tracking-wide">
              Projects Owned
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#faf5ff] flex items-center justify-center text-[#7c3aed]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-sans text-[#1c1e21]">
              {projectsOwnedCount}
            </div>
            <div className="text-[11px] text-[#7a7e85] font-medium mt-1">
              Created by you
            </div>
          </div>
        </div>

        {/* Card 4: Storage Used */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7a7e85] uppercase font-mono tracking-wide">
              Storage Used
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fff7ed] flex items-center justify-center text-[#ea580c]">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold font-sans text-[#1c1e21]">
              {storageUsed} <span className="text-xs font-normal text-[#7a7e85]">of {storageTotal}</span>
            </div>
            <div className="w-full h-1.5 bg-[#f0ede6] rounded-full mt-2 relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#e5a83b] to-[#a84c26] rounded-full" 
                style={{ width: `${storagePct}%` }} 
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Dedicated Collaborators Section: Displayed once with unique profiles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-sans tracking-tight text-[#1c1e21]">
              Studio Collaborators
            </h2>
            <p className="text-xs text-[#7a7e85]">
              Musicians, producers, and vocalists in your creative circle
            </p>
          </div>

          <button
            onClick={onInviteModal}
            className="text-xs font-semibold text-[#a84c26] hover:text-[#6e2b13] flex items-center space-x-1 px-3 py-1.5 rounded-full hover:bg-[#fff7ed] transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Collaborator</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {collaborators.map((c) => (
            <div 
              key={c.username}
              onClick={() => onOpenMessage ? onOpenMessage(c.username) : onInviteModal()}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e8e4dc] shadow-soft hover:shadow-soft-lg hover:border-[#a84c26]/40 hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col items-center text-center group"
            >
              {/* Perfectly round circular avatar with status dot */}
              <div className="relative mb-3 flex-shrink-0">
                <div className={`w-14 h-14 aspect-square rounded-full bg-gradient-to-tr ${c.color} shadow-md group-hover:scale-105 transition-transform flex items-center justify-center text-white text-lg font-bold border-2 border-white ring-2 ring-[#f0ede6]`}>
                  <span>{c.initial}</span>
                </div>
                <span 
                  className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" 
                  title="Active in studio"
                />
              </div>

              {/* Name */}
              <span className="text-xs sm:text-sm font-bold text-[#1c1e21] group-hover:text-[#a84c26] transition-colors truncate w-full">
                {c.name}
              </span>

              {/* Role badge */}
              <span className="text-[10px] text-[#6b707b] font-medium mt-1 truncate w-full bg-[#f6f3ed] px-2 py-0.5 rounded-full border border-[#ebe5dc]">
                {c.role}
              </span>

              {/* Quick Direct Message / Chat Trigger */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenMessage) onOpenMessage(c.username);
                }}
                className="mt-3 px-3 py-1 rounded-full bg-[#f3efe9] hover:bg-[#1c1e24] text-[#4b4f57] hover:text-white text-[10px] font-semibold flex items-center space-x-1.5 transition-all shadow-2xs group-hover:bg-[#1c1e24] group-hover:text-white"
                title={`Send direct message to ${c.name}`}
              >
                <MessageSquare className="w-3 h-3 text-[#20c9b0]" />
                <span>Chat</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom Area: Two columns (Recent Song Repositories on left, Recent Activity on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (lg:col-span-7 xl:col-span-8): Recent Song Repositories (LANDR reference inspired layout) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-3.5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold font-sans tracking-tight text-[#1c1e21]">
                Recent Song Repositories
              </h2>
              <span className="text-[11px] font-mono text-[#7a7e85] bg-[#f0ede6] px-2 py-0.5 rounded-full font-semibold">
                {filteredRepos.length} tracks
              </span>
            </div>

            {/* Quick Tag Pills from LANDR Reference */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {filterTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                    selectedTag === tag.id
                      ? 'bg-[#1c1e21] text-white shadow-sm'
                      : 'bg-[#f0ede6] text-[#60646c] hover:bg-[#e4ded4] hover:text-[#1c1e21]'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header Row (Desktop LANDR layout) */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#7a7e85] border-b border-[#ece8e1]">
            <div className="col-span-5">Song & Tags</div>
            <div className="col-span-3">Waveform Preview</div>
            <div className="col-span-1 text-center">Time</div>
            <div className="col-span-1 text-center">BPM</div>
            <div className="col-span-1 text-center">Key</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          {/* List of Repositories */}
          <div className="space-y-2">
            {filteredRepos.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-[#e8e4dc] text-center space-y-2">
                <Disc3 className="w-8 h-8 text-[#8c9099] mx-auto opacity-50" />
                <p className="text-xs font-medium text-[#7a7e85]">
                  No repositories found matching your selection.
                </p>
              </div>
            ) : (
              filteredRepos.map((repo) => {
                const meta = songThumbnails[repo.slug] || {
                  bg: 'from-[#475569] to-[#1e293b]',
                  label: repo.name,
                  tags: [repo.genre?.toLowerCase() || 'indie'],
                  duration: '03:30',
                  bpm: repo.bpm || 120,
                  key: repo.keySignature || 'C maj',
                  timeSig: repo.timeSignature || '4/4',
                  status: repo.status || 'Active',
                  waveform: [20, 40, 60, 80, 70, 90, 85, 75, 60, 80, 95, 70, 50, 65, 80, 60, 45, 30]
                };

                return (
                  <div
                    key={repo._id}
                    className="bg-white p-3 sm:px-4 sm:py-3 rounded-2xl border border-[#e8e4dc] shadow-soft hover:border-[#a84c26]/40 hover:shadow-soft-lg transition-all group flex flex-col md:grid md:grid-cols-12 gap-3 items-center"
                  >
                    {/* Col 1-5: Artwork + Title & Tags (LANDR Sample Style) */}
                    <div className="w-full md:col-span-5 flex items-center space-x-3 min-w-0">
                      <div 
                        onClick={() => onOpenRepo(repo)}
                        className={`w-11 h-11 flex-shrink-0 rounded-xl bg-gradient-to-br ${meta.bg} shadow-sm cursor-pointer flex items-center justify-center text-white group-hover:scale-105 transition-transform`}
                      >
                        <Disc3 className="w-5 h-5 text-[#f5be57]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div 
                          onClick={() => onOpenRepo(repo)}
                          className="font-bold text-xs sm:text-sm text-[#1c1e21] font-sans truncate hover:text-[#a84c26] cursor-pointer"
                        >
                          {repo.name || meta.label}
                        </div>

                        {/* LANDR-style Tag Tokens underneath name */}
                        <div className="flex flex-wrap items-center gap-1 mt-0.5">
                          {(meta.tags || [repo.genre?.toLowerCase() || 'indie']).map((tag, tIdx) => (
                            <span 
                              key={tIdx} 
                              className="text-[10px] font-mono text-[#7a7e85] bg-[#f5f2ec] px-1.5 py-0.5 rounded-md hover:bg-[#eae4d9] transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Col 6-8: Waveform Visualization (LANDR Amplitude Bars) */}
                    <div className="hidden md:flex md:col-span-3 items-center space-x-0.5 h-7 px-1 bg-[#faf8f5] rounded-lg py-1 border border-[#f0ede6]">
                      {(meta.waveform || [30, 50, 70, 90, 60, 80, 100, 75, 55, 70, 85, 60, 40, 55, 75, 60, 45, 30]).map((h, i) => (
                        <span
                          key={i}
                          className="flex-1 bg-[#8c9099] rounded-full group-hover:bg-[#e5a83b] transition-colors"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>

                    {/* Col 9: Duration */}
                    <div className="hidden md:block md:col-span-1 text-center font-mono text-xs text-[#6e7279]">
                      {meta.duration}
                    </div>

                    {/* Col 10: BPM */}
                    <div className="hidden md:block md:col-span-1 text-center font-mono text-xs font-semibold text-[#1c1e21]">
                      {repo.bpm || meta.bpm}
                    </div>

                    {/* Col 11: Musical Key */}
                    <div className="hidden md:block md:col-span-1 text-center font-mono text-[11px] text-[#a84c26] font-semibold bg-[#fff7ed] px-1 py-0.5 rounded border border-[#fed7aa]/50">
                      {meta.key || repo.keySignature}
                    </div>

                    {/* Col 12: Open Button & Mobile Metadata Cluster */}
                    <div className="w-full md:col-span-1 flex items-center justify-between md:justify-end gap-2 border-t md:border-t-0 border-[#f0ede6] pt-2 md:pt-0">
                      {/* Mobile Metadata tags */}
                      <div className="flex md:hidden items-center space-x-2 font-mono text-[10px] text-[#7a7e85]">
                        <span>{meta.duration}</span>
                        <span>•</span>
                        <span>{repo.bpm || meta.bpm} BPM</span>
                        <span>•</span>
                        <span className="text-[#a84c26] font-semibold">{meta.key || repo.keySignature}</span>
                      </div>

                      <button
                        onClick={() => onOpenRepo(repo)}
                        className="studio-btn-primary px-3 py-1.5 text-xs font-sans flex items-center space-x-1 shadow-sm flex-shrink-0"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Right Column (lg:col-span-5 xl:col-span-4): Recent Activity exclusively */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-3.5">
          
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-sans tracking-tight text-[#1c1e21]">
              Recent Activity
            </h2>
            <span className="text-[10px] font-mono text-[#7a7e85] uppercase tracking-wider bg-[#f0ede6] px-2 py-0.5 rounded-full font-semibold">
              Live Feed
            </span>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-3 text-xs">
            {activities.length === 0 ? (
              <p className="text-neutral-500 text-xs py-3 text-center">
                No recent activity recorded.
              </p>
            ) : (
              activities.slice(0, 6).map((act, idx) => (
                <div key={act._id || idx} className="flex items-start space-x-3 pb-3 border-b border-[#f3efe9] last:border-b-0 last:pb-0">
                  <div className="w-7 h-7 rounded-xl bg-[#f5f2ec] border border-[#e2ded5] flex-shrink-0 flex items-center justify-center">
                    {getActivityIcon(act.action)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[#3a3d44] text-[11px] leading-snug">
                      <strong className="text-[#1c1e21] font-bold">
                        {act.user?.username === user?.username ? 'You' : act.user?.displayName || act.user?.username || 'Collaborator'}
                      </strong>{' '}
                      {act.details}
                    </p>
                    <span className="text-[9px] text-[#8c9099] block mt-0.5 font-mono">
                      {formatActivityTime(act.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
