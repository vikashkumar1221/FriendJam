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
  Music
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
        // Fallback default activities matching screenshot
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

  // Color schemes for song cards matching screenshot thumbnails
  const songThumbnails = {
    'adhoori-kahani': {
      bg: 'from-amber-600 via-orange-700 to-rose-900',
      label: 'Ahoori Kahani',
      tags: ['Indie Folk', 'Rock'],
      collabs: ['vikash', 'maya-vocals', 'arjun-drums'],
      updated: 'Updated 2 days ago by @vikash'
    },
    'raat-ke-safar': {
      bg: 'from-blue-900 via-indigo-950 to-slate-900',
      label: 'Raat Ke Safar',
      tags: ['Lo-fi', 'Ambient'],
      collabs: ['neha', 'arjun-drums'],
      updated: 'Updated 5 days ago by @neha'
    },
    'laal-dhun': {
      bg: 'from-red-900 via-rose-950 to-neutral-900',
      label: 'Laal Dhun',
      tags: ['Alternative', 'Indie'],
      collabs: ['vikash', 'sid-guitar'],
      updated: 'Updated 1 week ago by @vikash'
    },
    'sheher-se-door': {
      bg: 'from-slate-700 via-zinc-800 to-neutral-900',
      label: 'Sheher Se Door',
      tags: ['Acoustic', 'Chill'],
      collabs: ['arjun-drums', 'neha'],
      updated: 'Updated 1 week ago by @arjun'
    },
    'nayi-subah': {
      bg: 'from-amber-500 via-orange-600 to-yellow-600',
      label: 'Nayi Subah',
      tags: ['Pop', 'Hindi'],
      collabs: ['vikash', 'maya-vocals', 'sid-guitar', 'rohan'],
      updated: 'Updated 2 weeks ago by @vikash'
    }
  };

  // Filter repos based on search query
  const filteredRepos = (allRepos || []).filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.name.toLowerCase().includes(q) ||
           r.slug.toLowerCase().includes(q) ||
           (r.genre || '').toLowerCase().includes(q) ||
           (r.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Hero Banner matching screenshot */}
      <div className="brutal-card bg-[#111111] text-[#faf9f5] border-2 border-black overflow-hidden relative shadow-brutal">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-4 z-10">
            <span className="font-mono text-xs font-bold text-[#d7ff3b] tracking-widest uppercase block">
              TURN IDEAS INTO MUSIC TOGETHER
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans leading-[1.08] text-white">
              CREATE. COLLABORATE. <br />
              <span className="text-[#d7ff3b]">RELEASE.</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 max-w-md font-sans leading-relaxed">
              Your music, your people, your history. A modern workspace for songwriters, producers and bands.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenNewRepoModal}
                className="brutal-btn bg-[#d7ff3b] text-black px-4 sm:px-5 py-2.5 text-xs font-bold font-mono flex items-center space-x-1.5 shadow-brutal-sm hover:bg-[#e2f952]"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Song Repository</span>
              </button>

              <button
                onClick={() => setShowDemoVideoModal(true)}
                className="brutal-btn bg-[#1f1f1f] border-neutral-700 text-white hover:bg-neutral-800 px-4 sm:px-5 py-2.5 text-xs font-bold font-mono flex items-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Right Visualizer Column: Studio desk with neon quote */}
          <div className="lg:col-span-5 h-64 lg:h-full min-h-[220px] bg-gradient-to-r from-[#111111] via-[#1a1a1a] to-neutral-900 border-t lg:border-t-0 lg:border-l-2 border-neutral-800 p-6 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle acoustic & DAW vector illustration */}
            <div className="absolute right-3 bottom-0 opacity-20 pointer-events-none">
              <svg width="240" height="180" viewBox="0 0 240 180" fill="none">
                <rect x="20" y="20" width="160" height="110" rx="4" stroke="#ffffff" strokeWidth="2"/>
                <path d="M40 75 Q 70 30, 100 80 T 160 70" stroke="#d7ff3b" strokeWidth="3" fill="none"/>
                <circle cx="190" cy="120" r="35" stroke="#ffffff" strokeWidth="2"/>
                <line x1="190" y1="20" x2="190" y2="120" stroke="#ffffff" strokeWidth="2"/>
              </svg>
            </div>

            <div className="text-right z-10">
              <span className="font-editorial italic text-2xl sm:text-3xl text-neutral-200 block leading-tight">
                "Good Music <br />Brings People <br />Together"
              </span>
            </div>

            <div className="z-10 bg-black/60 border border-neutral-700 p-2 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>DAW MULTITRACK LIVE</span>
              </span>
              <span className="text-[#d7ff3b]">44.1kHz • 24-BIT</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Four KPI Metric Cards matching screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
        
        {/* Card 1: Total Repositories */}
        <div className="brutal-card bg-white p-4 border-2 border-black flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Total Repositories</span>
            <div className="w-7 h-7 bg-emerald-100 border border-black flex items-center justify-center text-emerald-800">
              <Music className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold font-sans text-black leading-none">12</div>
              <div className="text-[10px] text-emerald-700 font-bold mt-1">↑ 3 this month</div>
            </div>
            {/* Sparkline bars */}
            <div className="flex items-end space-x-1 h-6">
              <span className="w-1.5 h-2 bg-neutral-300"></span>
              <span className="w-1.5 h-3 bg-neutral-400"></span>
              <span className="w-1.5 h-4 bg-neutral-500"></span>
              <span className="w-1.5 h-6 bg-black"></span>
            </div>
          </div>
        </div>

        {/* Card 2: Collaborators */}
        <div className="brutal-card bg-white p-4 border-2 border-black flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Collaborators</span>
            <div className="w-7 h-7 bg-blue-100 border border-black flex items-center justify-center text-blue-800">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold font-sans text-black leading-none">8</div>
              <div className="text-[10px] text-neutral-600 mt-1">● 2 active now</div>
            </div>
            {/* Collaborator Avatars stack */}
            <div className="flex -space-x-1.5">
              <div className="w-5 h-5 rounded-full bg-amber-500 border border-black text-[9px] flex items-center justify-center text-white font-bold">V</div>
              <div className="w-5 h-5 rounded-full bg-rose-500 border border-black text-[9px] flex items-center justify-center text-white font-bold">N</div>
              <div className="w-5 h-5 rounded-full bg-blue-500 border border-black text-[9px] flex items-center justify-center text-white font-bold">M</div>
              <div className="w-5 h-5 rounded-full bg-black text-[#d7ff3b] border border-black text-[8px] flex items-center justify-center font-bold">+4</div>
            </div>
          </div>
        </div>

        {/* Card 3: Projects Owned */}
        <div className="brutal-card bg-white p-4 border-2 border-black flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Projects Owned</span>
            <div className="w-7 h-7 bg-purple-100 border border-black flex items-center justify-center text-purple-800">
              <FolderKanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold font-sans text-black leading-none">5</div>
              <div className="text-[10px] text-neutral-600 mt-1">3 in progress</div>
            </div>
            {/* Circular progress badge */}
            <div className="w-8 h-8 rounded-full border-2 border-black flex items-center justify-center font-bold text-[10px] bg-[#d7ff3b]">
              60%
            </div>
          </div>
        </div>

        {/* Card 4: Storage Used */}
        <div className="brutal-card bg-white p-4 border-2 border-black flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-neutral-500 uppercase">Storage Used</span>
            <div className="w-7 h-7 bg-amber-100 border border-black flex items-center justify-center text-amber-800">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold font-sans text-black">
              2.4 GB <span className="text-xs font-normal text-neutral-500">of 10 GB</span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-neutral-200 border border-black mt-2 relative overflow-hidden">
              <div className="h-full bg-black" style={{ width: '24%' }} />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Main Two-Column Lower Workspace matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (68% width): Recent Song Repositories */}
        <div className="lg:col-span-8 space-y-3">
          
          <div className="flex items-center justify-between font-mono text-xs">
            <h2 className="text-base sm:text-lg font-bold font-sans tracking-tight text-black">
              Recent Song Repositories
            </h2>
            <button 
              onClick={() => {}}
              className="text-neutral-600 hover:text-black font-bold flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {filteredRepos.map((repo, idx) => {
              const meta = songThumbnails[repo.slug] || {
                bg: 'from-neutral-700 to-neutral-900',
                label: repo.name,
                tags: [repo.genre || 'Indie', 'Alternative'],
                collabs: [repo.owner?.username || 'vikash'],
                updated: `Updated on ${new Date(repo.updatedAt).toLocaleDateString()}`
              };

              return (
                <div
                  key={repo._id}
                  className="brutal-card bg-white p-3.5 border-2 border-black flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf9f5] transition-colors"
                >
                  {/* Left: Thumbnail & Song Title & Tags */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    {/* Cover art thumbnail */}
                    <div 
                      onClick={() => onOpenRepo(repo)}
                      className={`w-12 h-12 flex-shrink-0 bg-gradient-to-br ${meta.bg} border-2 border-black shadow-brutal-sm cursor-pointer flex items-center justify-center text-white`}
                    >
                      <Disc3 className="w-6 h-6 text-[#d7ff3b]" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div 
                        onClick={() => onOpenRepo(repo)}
                        className="font-bold text-base text-black font-sans truncate hover:underline cursor-pointer"
                      >
                        {meta.label || repo.name}
                      </div>

                      {/* Genre pills */}
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                        {(meta.tags || [repo.genre]).map((t, tIdx) => (
                          <span key={tIdx} className="bg-[#ede8dc] border border-black px-1.5 py-0.2 font-bold text-neutral-800">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Center: Waveform preview simulation */}
                  <div className="hidden md:flex items-center space-x-0.5 px-3 h-8 w-28 flex-shrink-0">
                    {[12, 28, 45, 80, 50, 95, 60, 30, 75, 90, 40, 20, 65, 85, 30].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-black rounded-none"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>

                  {/* Collaborator Avatars */}
                  <div className="flex -space-x-1.5 flex-shrink-0">
                    {(meta.collabs || ['vikash']).slice(0, 3).map((collab, cIdx) => (
                      <div
                        key={cIdx}
                        className="w-6 h-6 rounded-full border border-black bg-neutral-200 flex items-center justify-center text-[10px] font-bold text-black font-mono shadow-sm"
                        title={`@${collab}`}
                      >
                        {collab[0].toUpperCase()}
                      </div>
                    ))}
                    {(meta.collabs || []).length > 3 && (
                      <div className="w-6 h-6 rounded-full border border-black bg-black text-[#d7ff3b] flex items-center justify-center text-[9px] font-bold font-mono">
                        +{meta.collabs.length - 3}
                      </div>
                    )}
                  </div>

                  {/* Metadata updated info */}
                  <div className="text-[10px] font-mono text-neutral-500 whitespace-nowrap hidden sm:block">
                    {meta.updated}
                  </div>

                  {/* Action Open Button */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => onOpenRepo(repo)}
                      className="brutal-btn bg-white hover:bg-[#d7ff3b] px-3 py-1.5 text-xs font-mono font-bold flex items-center space-x-1 border-2 border-black"
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
          <div className="brutal-card bg-white p-4 border-2 border-black space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-bold text-sm font-sans tracking-tight text-black">
                Recent Activity
              </h3>
              <button className="text-neutral-500 hover:text-black font-bold flex items-center space-x-0.5 text-[11px]">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 5).map((act, idx) => {
                const colors = [
                  'bg-purple-100 text-purple-900 border-purple-500',
                  'bg-emerald-100 text-emerald-900 border-emerald-500',
                  'bg-amber-100 text-amber-900 border-amber-500',
                  'bg-blue-100 text-blue-900 border-blue-500',
                  'bg-rose-100 text-rose-900 border-rose-500'
                ];
                const color = colors[idx % colors.length];

                return (
                  <div key={act._id || idx} className="flex items-start space-x-2.5">
                    {/* Collaborator Initial circle */}
                    <div className="w-7 h-7 rounded-full border border-black bg-neutral-200 flex-shrink-0 flex items-center justify-center font-bold text-xs">
                      {act.user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-neutral-800 text-[11px] leading-snug">
                        <strong className="text-black font-bold">
                          {act.user?.username === 'vikash' ? 'You' : act.user?.displayName || act.user?.username}
                        </strong>{' '}
                        {act.details}
                      </p>
                      <span className="text-[9px] text-neutral-400 block mt-0.5">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions 2x2 Grid matching screenshot */}
          <div className="brutal-card bg-white p-4 border-2 border-black space-y-3 font-mono text-xs">
            <div className="border-b-2 border-black pb-2">
              <h3 className="font-bold text-sm font-sans tracking-tight text-black">
                Quick Actions
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Action 1: New Repository */}
              <button
                onClick={onOpenNewRepoModal}
                className="p-3 border-2 border-black bg-[#faf9f5] hover:bg-[#d7ff3b] transition-all text-center flex flex-col items-center justify-center space-y-1.5 group shadow-brutal-sm"
              >
                <div className="w-7 h-7 bg-emerald-100 border border-black flex items-center justify-center text-emerald-900 group-hover:bg-black group-hover:text-[#d7ff3b]">
                  <Music className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[11px] text-black">New Repository</span>
              </button>

              {/* Action 2: Invite Collaborators */}
              <button
                onClick={onInviteModal}
                className="p-3 border-2 border-black bg-[#faf9f5] hover:bg-[#d7ff3b] transition-all text-center flex flex-col items-center justify-center space-y-1.5 group shadow-brutal-sm"
              >
                <div className="w-7 h-7 bg-blue-100 border border-black flex items-center justify-center text-blue-900 group-hover:bg-black group-hover:text-[#d7ff3b]">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[11px] text-black">Invite Collaborators</span>
              </button>

              {/* Action 3: Browse Templates */}
              <button
                onClick={() => alert('Loaded templates: Multi-track Indie Rock, Acoustic Ballad, and Lo-fi Hip Hop stem templates.')}
                className="p-3 border-2 border-black bg-[#faf9f5] hover:bg-[#d7ff3b] transition-all text-center flex flex-col items-center justify-center space-y-1.5 group shadow-brutal-sm"
              >
                <div className="w-7 h-7 bg-purple-100 border border-black flex items-center justify-center text-purple-900 group-hover:bg-black group-hover:text-[#d7ff3b]">
                  <LayoutGrid className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[11px] text-black">Browse Templates</span>
              </button>

              {/* Action 4: View Analytics */}
              <button
                onClick={() => alert('Analytics: Stems tracked: 18 takes across 5 song repositories. 0 conflicts lost.')}
                className="p-3 border-2 border-black bg-[#faf9f5] hover:bg-[#d7ff3b] transition-all text-center flex flex-col items-center justify-center space-y-1.5 group shadow-brutal-sm"
              >
                <div className="w-7 h-7 bg-amber-100 border border-black flex items-center justify-center text-amber-900 group-hover:bg-black group-hover:text-[#d7ff3b]">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[11px] text-black">View Analytics</span>
              </button>

            </div>
          </div>

        </div>

      </div>

      {/* Interactive Watch Demo Modal */}
      {showDemoVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-lg w-full p-6 border-2 border-black space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase tracking-wider text-black">
                [WORKSHOP DEMO] HOW MUSICCOLLAB WORKS
              </span>
              <button 
                onClick={() => setShowDemoVideoModal(false)}
                className="font-bold hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans">
              <div className="p-3 bg-[#ede8dc] border border-black space-y-2">
                <span className="font-bold text-xs font-mono block text-black">1. BRANCHING FOR MUSICIANS</span>
                <p className="text-xs text-neutral-700">
                  Maya records on branch <code className="bg-white px-1 border border-black font-mono">vocals/harmonies</code>. Sid tracks on <code className="bg-white px-1 border border-black font-mono">guitar/solo</code>. The main mix stays clean until reviewed.
                </p>
              </div>

              <div className="p-3 bg-[#ede8dc] border border-black space-y-2">
                <span className="font-bold text-xs font-mono block text-black">2. MULTITRACK STUDIO & TAKES</span>
                <p className="text-xs text-neutral-700">
                  Listen to synchronized stems, toggle Mute/Solo, scrub waveforms, and leave timestamped feedback at exact seconds.
                </p>
              </div>

              <div className="p-3 bg-[#ede8dc] border border-black space-y-2">
                <span className="font-bold text-xs font-mono block text-black">3. PULL REQUESTS & IMMUTABLE COMMITS</span>
                <p className="text-xs text-neutral-700">
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
                className="brutal-btn brutal-btn-acid w-full py-2.5 font-bold shadow-brutal text-sm"
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
