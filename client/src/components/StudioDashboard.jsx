import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Plus, 
  Play, 
  ArrowRight, 
  Disc3, 
  Users, 
  FolderKanban, 
  HardDrive, 
  MoreVertical, 
  MessageSquare, 
  GitCommit, 
  UserPlus, 
  GitMerge, 
  LayoutGrid, 
  BarChart3, 
  Sparkles,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Headphones,
  Music,
  Heart
} from 'lucide-react';

export const StudioDashboard = ({ 
  onOpenRepo, 
  onOpenNewRepoModal, 
  onInviteModal,
  searchQuery,
  allRepos,
  onRefreshRepos
}) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [showDemoVideoModal, setShowDemoVideoModal] = useState(false);

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
            details: 'commented on Ahoori Kahani "This chorus sounds amazing! 🔥"',
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
            details: 'joined the collaboration',
            createdAt: new Date(Date.now() - 3600000 * 24)
          },
          {
            _id: 'act-5',
            user: { username: 'neha', displayName: 'Neha' },
            action: 'PR_MERGED',
            details: 'merged a pull request',
            createdAt: new Date(Date.now() - 3600000 * 26)
          }
        ]);
      }
    } catch {
      // ignore
    }
  };

  const songThumbnails = {
    'adhoori-kahani': {
      bg: 'from-[#b85328] via-[#8c3a19] to-[#3a1508]',
      label: 'Ahoori Kahani',
      tags: ['Indie Folk', 'Rock'],
      collabs: ['vikash', 'maya-vocals', 'arjun-drums'],
      updated: 'Updated 2 days ago by @vikash'
    },
    'raat-ke-safar': {
      bg: 'from-[#2b3a4a] via-[#1f2834] to-[#121921]',
      label: 'Raat Ke Safar',
      tags: ['Lo-fi', 'Ambient'],
      collabs: ['neha', 'arjun-drums'],
      updated: 'Updated 5 days ago by @neha'
    },
    'laal-dhun': {
      bg: 'from-[#8f2b24] via-[#631a15] to-[#2b0c0a]',
      label: 'Laal Dhun',
      tags: ['Alternative', 'Indie'],
      collabs: ['vikash', 'sid-guitar'],
      updated: 'Updated 1 week ago by @vikash'
    },
    'sheher-se-door': {
      bg: 'from-[#4e5b52] via-[#353f38] to-[#1b221d]',
      label: 'Sheher Se Door',
      tags: ['Acoustic', 'Chill'],
      collabs: ['arjun-drums', 'neha'],
      updated: 'Updated 1 week ago by @arjun'
    },
    'nayi-subah': {
      bg: 'from-[#d97706] via-[#b45309] to-[#451a03]',
      label: 'Nayi Subah',
      tags: ['Pop', 'Hindi'],
      collabs: ['vikash', 'maya-vocals', 'sid-guitar', 'rohan'],
      updated: 'Updated 2 weeks ago by @vikash'
    }
  };

  const filteredRepos = (allRepos || []).filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) ||
           r.slug.toLowerCase().includes(q) ||
           (r.genre || '').toLowerCase().includes(q) ||
           (r.description || '').toLowerCase().includes(q);
  });

  const popularCollaborators = [
    { name: 'Vikash Sharma', role: 'Songwriter', initial: 'V', color: 'from-[#b85328] to-[#8c3a19]' },
    { name: 'Maya Patel', role: 'Vocals', initial: 'M', color: 'from-[#d97706] to-[#b45309]' },
    { name: 'Neha Sharma', role: 'Producer', initial: 'N', color: 'from-[#7c3aed] to-[#5b21b6]' },
    { name: 'Siddharth Roy', role: 'Guitarist', initial: 'S', color: 'from-[#2563eb] to-[#1d4ed8]' },
    { name: 'Arjun Mehta', role: 'Drummer', initial: 'A', color: 'from-[#059669] to-[#047857]' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Curated Banner matching Dribbble Blinding Lights Card */}
      <div className="rounded-3xl bg-gradient-to-r from-[#a84c26] via-[#853718] to-[#251007] text-white p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-soft-lg border border-[#c46235]/30">
        
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-black/40 via-transparent to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* Left Text */}
          <div className="lg:col-span-8 space-y-3.5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#f5be57] uppercase bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full inline-block">
              CURATED PLAYLIST • TURN IDEAS INTO MUSIC
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans leading-tight">
              CREATE. COLLABORATE. <br />
              <span className="text-[#f5be57]">RELEASE.</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-200 max-w-lg leading-relaxed font-sans opacity-90">
              Your music, your people, your history. A modern studio workspace for songwriters, producers and bands to track stems without lost takes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenNewRepoModal}
                className="studio-btn-amber px-5 py-2.5 text-xs font-bold flex items-center space-x-1.5 shadow-copper"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>New Song Repository</span>
              </button>

              <button
                onClick={() => setShowDemoVideoModal(true)}
                className="px-5 py-2.5 text-xs font-medium bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center space-x-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Demo</span>
              </button>

              <div className="hidden sm:flex items-center space-x-1.5 text-[11px] text-[#f5be57] font-mono ml-3">
                <Heart className="w-3.5 h-3.5 fill-[#f5be57]" />
                <span>83,012 Collaborators active</span>
              </div>
            </div>
          </div>

          {/* Right Visual: Stylized Album Card Art */}
          <div className="lg:col-span-4 flex justify-end">
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[#c86235] via-[#6e2b13] to-[#1c0c05] p-4 flex flex-col justify-between border border-white/10 shadow-player relative overflow-hidden group hover:scale-105 transition-transform">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded-full text-white backdrop-blur-sm">
                  MASTER STEM
                </span>
                <Disc3 className="w-6 h-6 text-[#f5be57] animate-spin" />
              </div>

              <div className="text-center">
                <span className="font-editorial italic text-2xl font-bold tracking-wide text-white block">
                  Ahoori Kahani
                </span>
                <span className="text-[10px] text-amber-200 font-mono">
                  44.1kHz • 24-bit Lossless
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-white/70 font-mono border-t border-white/10 pt-2">
                <span>Indie Folk / Rock</span>
                <span>04:12</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Popular Collaborators matching Dribbble row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold font-sans tracking-tight text-[#1c1e21]">
            Popular Collaborators & Artists
          </h2>
          <button className="text-xs text-[#7a7e85] hover:text-[#1c1e21] font-medium flex items-center space-x-1">
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-4 overflow-x-auto pb-2">
          {popularCollaborators.map((artist, idx) => (
            <div 
              key={idx}
              className="flex flex-col items-center space-y-1.5 flex-shrink-0 cursor-pointer group"
              onClick={onInviteModal}
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${artist.color} p-0.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center text-white text-lg font-bold border-2 border-white`}>
                <span>{artist.initial}</span>
              </div>
              <span className="text-xs font-semibold text-[#1c1e21] group-hover:text-[#a84c26] transition-colors">
                {artist.name}
              </span>
              <span className="text-[10px] text-[#7a7e85] font-mono -mt-1">
                {artist.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Four KPI Metric Cards in clean porcelain white */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Repositories */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7a7e85] uppercase font-mono">Total Repositories</span>
            <div className="w-8 h-8 rounded-full bg-[#f0f9f4] flex items-center justify-center text-[#059669]">
              <Music className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold font-sans text-[#1c1e21]">12</div>
              <div className="text-[11px] text-[#059669] font-medium mt-1">↑ 3 this month</div>
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end space-x-1 h-6">
              <span className="w-1.5 h-2 bg-[#e2ded5] rounded-full"></span>
              <span className="w-1.5 h-3.5 bg-[#e5a83b] rounded-full"></span>
              <span className="w-1.5 h-5 bg-[#a84c26] rounded-full"></span>
              <span className="w-1.5 h-6 bg-[#1c1e21] rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Card 2: Collaborators */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7a7e85] uppercase font-mono">Collaborators</span>
            <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold font-sans text-[#1c1e21]">8</div>
              <div className="text-[11px] text-[#7a7e85] mt-1">● 2 active now</div>
            </div>
            {/* Avatars */}
            <div className="flex -space-x-1.5">
              <div className="w-6 h-6 rounded-full bg-[#a84c26] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">V</div>
              <div className="w-6 h-6 rounded-full bg-[#e5a83b] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">N</div>
              <div className="w-6 h-6 rounded-full bg-[#2563eb] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">M</div>
              <div className="w-6 h-6 rounded-full bg-[#1c1e21] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">+4</div>
            </div>
          </div>
        </div>

        {/* Card 3: Projects Owned */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7a7e85] uppercase font-mono">Projects Owned</span>
            <div className="w-8 h-8 rounded-full bg-[#faf5ff] flex items-center justify-center text-[#7c3aed]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold font-sans text-[#1c1e21]">5</div>
              <div className="text-[11px] text-[#7a7e85] mt-1">3 in progress</div>
            </div>
            {/* Amber Circular Ring Indicator */}
            <div className="w-9 h-9 rounded-full border-2 border-[#e5a83b] bg-[#fffbeb] flex items-center justify-center font-bold text-[11px] text-[#b45309]">
              60%
            </div>
          </div>
        </div>

        {/* Card 4: Storage Used */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#7a7e85] uppercase font-mono">Storage Used</span>
            <div className="w-8 h-8 rounded-full bg-[#fff7ed] flex items-center justify-center text-[#ea580c]">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold font-sans text-[#1c1e21]">
              2.4 GB <span className="text-xs font-normal text-[#7a7e85]">of 10 GB</span>
            </div>
            {/* Progress bar with copper fill */}
            <div className="w-full h-2 bg-[#f0ede6] rounded-full mt-2 relative overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#e5a83b] to-[#a84c26] rounded-full" style={{ width: '24%' }} />
            </div>
          </div>
        </div>

      </div>

      {/* 4. Lower Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (68% width): Recent Song Repositories */}
        <div className="lg:col-span-8 space-y-3">
          
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-sans tracking-tight text-[#1c1e21]">
              Recent Song Repositories
            </h2>
            <button className="text-xs text-[#7a7e85] hover:text-[#1c1e21] font-medium flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredRepos.map((repo) => {
              const meta = songThumbnails[repo.slug] || {
                bg: 'from-[#475569] to-[#1e293b]',
                label: repo.name,
                tags: [repo.genre || 'Indie', 'Alternative'],
                collabs: [repo.owner?.username || 'vikash'],
                updated: `Updated on ${new Date(repo.updatedAt).toLocaleDateString()}`
              };

              return (
                <div
                  key={repo._id}
                  className="bg-white p-3.5 rounded-2xl border border-[#e8e4dc] shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#a84c26]/40 hover:shadow-soft-lg transition-all group"
                >
                  {/* Left: Thumbnail & Song Title & Tags */}
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <div 
                      onClick={() => onOpenRepo(repo)}
                      className={`w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${meta.bg} shadow-sm cursor-pointer flex items-center justify-center text-white group-hover:scale-105 transition-transform`}
                    >
                      <Disc3 className="w-6 h-6 text-[#f5be57]" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div 
                        onClick={() => onOpenRepo(repo)}
                        className="font-bold text-sm text-[#1c1e21] font-sans truncate hover:text-[#a84c26] cursor-pointer"
                      >
                        {meta.label || repo.name}
                      </div>

                      {/* Genre pills */}
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                        {(meta.tags || [repo.genre]).map((t, tIdx) => (
                          <span key={tIdx} className="bg-[#f3efe9] text-[#555962] px-2 py-0.5 rounded-full font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Golden Amber Waveform preview snippet */}
                  <div className="hidden md:flex items-center space-x-1 px-3 h-8 w-32 flex-shrink-0">
                    {[15, 30, 60, 95, 50, 100, 70, 35, 80, 90, 45, 25, 70, 85, 30].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-[#e5a83b] rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  {/* Collaborator Avatars */}
                  <div className="flex -space-x-1.5 flex-shrink-0">
                    {(meta.collabs || ['vikash']).slice(0, 3).map((collab, cIdx) => (
                      <div
                        key={cIdx}
                        className="w-6 h-6 rounded-full border-2 border-white bg-[#ece8e1] flex items-center justify-center text-[10px] font-bold text-[#1c1e21] font-mono shadow-sm"
                        title={`@${collab}`}
                      >
                        {collab[0].toUpperCase()}
                      </div>
                    ))}
                    {(meta.collabs || []).length > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-[#1c1e21] text-[#f5be57] flex items-center justify-center text-[9px] font-bold font-mono">
                        +{meta.collabs.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Metadata updated info */}
                  <div className="text-[10px] font-mono text-[#8c9099] whitespace-nowrap hidden sm:block">
                    {meta.updated}
                  </div>

                  {/* Open Pill Button */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onOpenRepo(repo)}
                      className="studio-btn-primary px-3.5 py-1.5 text-xs font-sans flex items-center space-x-1 shadow-sm"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column (32% width): Recent Activity & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recent Activity Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-2.5">
              <h3 className="font-bold text-sm font-sans tracking-tight text-[#1c1e21]">
                Recent Activity
              </h3>
              <button className="text-[#7a7e85] hover:text-[#1c1e21] font-medium flex items-center space-x-0.5 text-[11px]">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {activities.slice(0, 5).map((act, idx) => (
                <div key={act._id || idx} className="flex items-start space-x-3">
                  <div className="w-7 h-7 rounded-full bg-[#f3efe9] border border-[#e2ded5] flex-shrink-0 flex items-center justify-center font-bold text-xs text-[#a84c26]">
                    {act.user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[#3a3d44] text-[11px] leading-snug">
                      <strong className="text-[#1c1e21] font-bold">
                        {act.user?.username === 'vikash' ? 'You' : act.user?.displayName || act.user?.username}
                      </strong>{' '}
                      {act.details}
                    </p>
                    <span className="text-[9px] text-[#8c9099] block mt-0.5 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions 2x2 Grid matching Dribbble */}
          <div className="bg-white p-5 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-3.5 text-xs">
            <div className="border-b border-[#ece8e1] pb-2">
              <h3 className="font-bold text-sm font-sans tracking-tight text-[#1c1e21]">
                Quick Actions
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              
              <button
                onClick={onOpenNewRepoModal}
                className="p-3.5 rounded-2xl bg-[#f8f6f2] hover:bg-[#fff7ed] border border-[#ece8e1] hover:border-[#fed7aa] transition-all text-center flex flex-col items-center justify-center space-y-1.5 group shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#f0f9f4] flex items-center justify-center text-[#059669] group-hover:scale-110 transition-transform">
                  <Music className="w-4 h-4" />
                </div>
                <span className="font-bold text-[11px] text-[#1c1e21]">New Repository</span>
              </button>

              <button
                onClick={onInviteModal}
                className="p-3.5 rounded-2xl bg-[#f8f6f2] hover:bg-[#eff6ff] border border-[#ece8e1] hover:border-[#bfdbfe] transition-all text-center flex flex-col items-center justify-center space-y-1.5 group shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#2563eb] group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <span className="font-bold text-[11px] text-[#1c1e21]">Invite Collaborators</span>
              </button>

              <button
                onClick={() => alert('Loaded templates: Indie Rock Multi-track, Acoustic Ballad, and Lo-fi Hip Hop stem templates.')}
                className="p-3.5 rounded-2xl bg-[#f8f6f2] hover:bg-[#faf5ff] border border-[#ece8e1] hover:border-[#e9d5ff] transition-all text-center flex flex-col items-center justify-center space-y-1.5 group shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#faf5ff] flex items-center justify-center text-[#7c3aed] group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <span className="font-bold text-[11px] text-[#1c1e21]">Browse Templates</span>
              </button>

              <button
                onClick={() => alert('Analytics: Stems tracked: 18 takes across 5 song repositories. 0 conflicts lost.')}
                className="p-3.5 rounded-2xl bg-[#f8f6f2] hover:bg-[#fffbeb] border border-[#ece8e1] hover:border-[#fde68a] transition-all text-center flex flex-col items-center justify-center space-y-1.5 group shadow-sm"
              >
                <div className="w-8 h-8 rounded-full bg-[#fffbeb] flex items-center justify-center text-[#d97706] group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="font-bold text-[11px] text-[#1c1e21]">View Analytics</span>
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* Interactive Watch Demo Modal */}
      {showDemoVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                [STUDIO DEMO] HOW MUSICCOLLAB WORKS
              </span>
              <button 
                onClick={() => setShowDemoVideoModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#f8f5ee] border border-[#ece8e1] space-y-1.5">
                <span className="font-bold text-xs text-[#a84c26] block">1. BRANCHING FOR MUSICIANS</span>
                <p className="text-xs text-[#4b4f57] leading-relaxed">
                  Maya records on branch <code className="bg-white px-1.5 py-0.5 rounded border border-[#e2ded5] font-mono">vocals/harmonies</code>. Sid tracks on <code className="bg-white px-1.5 py-0.5 rounded border border-[#e2ded5] font-mono">guitar/solo</code>. The main mix stays clean until reviewed.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8f5ee] border border-[#ece8e1] space-y-1.5">
                <span className="font-bold text-xs text-[#a84c26] block">2. MULTITRACK STUDIO & TAKES</span>
                <p className="text-xs text-[#4b4f57] leading-relaxed">
                  Listen to synchronized stems, toggle Mute/Solo, scrub waveforms, and leave timestamped feedback at exact seconds.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8f5ee] border border-[#ece8e1] space-y-1.5">
                <span className="font-bold text-xs text-[#a84c26] block">3. PULL REQUESTS & IMMUTABLE COMMITS</span>
                <p className="text-xs text-[#4b4f57] leading-relaxed">
                  Open a pull request to merge takes into main. Revert any commit or restore older takes in 1 click.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowDemoVideoModal(false);
                  const song = allRepos?.find(r => r.slug === 'adhoori-kahani');
                  if (song && onOpenRepo) onOpenRepo(song);
                }}
                className="studio-btn-amber w-full py-3 font-bold shadow-copper text-sm"
              >
                OPEN "AHOORI KAHANI" WORKSPACE NOW
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
