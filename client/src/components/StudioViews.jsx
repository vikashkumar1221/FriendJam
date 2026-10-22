import React, { useState } from 'react';
import { 
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
  Plus,
  GitBranch,
  Music,
  Clock,
  CheckCircle,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Sliders,
  Volume2,
  Download,
  Star
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/* 1. SONGS & REPOSITORIES VIEW                                               */
/* -------------------------------------------------------------------------- */
export const SongsRepositoryView = ({ allRepos, onOpenRepo, onOpenNewRepoModal }) => {
  const [filterGenre, setFilterGenre] = useState('all');
  const [search, setSearch] = useState('');

  const genres = ['all', 'Indie Rock', 'Sufi Rock', 'Acoustic / Indie', 'Fusion Rock', 'Lo-Fi'];

  const filtered = allRepos.filter(r => {
    const matchGenre = filterGenre === 'all' || r.genre?.toLowerCase() === filterGenre.toLowerCase();
    const matchSearch = !search || 
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.genre?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
            Song Repositories
          </h1>
          <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
            Browse all version-controlled musical projects, stems, and collaborator branches.
          </p>
        </div>

        <button
          onClick={onOpenNewRepoModal}
          className="studio-btn-amber px-5 py-2.5 font-bold text-xs flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Song Repository</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="studio-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#9ba0a9] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search songs, genres, descriptions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#f5f3ef] border border-transparent focus:border-[#a84c26] text-xs font-medium focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setFilterGenre(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterGenre === g 
                  ? 'bg-[#232528] text-white shadow-sm' 
                  : 'bg-[#f5f3ef] text-[#7c8088] hover:bg-[#ede8dc] hover:text-[#1c1e21]'
              }`}
            >
              {g === 'all' ? 'All Genres' : g}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Songs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(repo => (
          <div
            key={repo._id}
            onClick={() => onOpenRepo(repo)}
            className="studio-card p-5 cursor-pointer hover:-translate-y-1 hover:shadow-card transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#a84c26] to-[#e5a83b] flex items-center justify-center text-white shadow-sm">
                  <Music className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#f5f3ef] text-[#4b4f57]">
                  {repo.genre || 'Indie'}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-[#1c1e21] group-hover:text-[#a84c26] transition-colors">
                  {repo.name}
                </h3>
                <p className="text-xs text-[#7c8088] line-clamp-2 mt-1 leading-relaxed">
                  {repo.description || 'Collaborative multitrack repository with live stems and version control.'}
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2 text-[11px] font-mono text-[#7c8088]">
                <span>{repo.bpm || 120} BPM</span>
                <span>•</span>
                <span>{repo.keySignature || 'C Major'}</span>
                <span>•</span>
                <span>{repo.timeSignature || '4/4'}</span>
              </div>
            </div>

            <div className="pt-5 border-t border-[#f0ece4] mt-5 flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs text-[#4b4f57]">
                <GitBranch className="w-3.5 h-3.5 text-[#a84c26]" />
                <span className="font-semibold">main</span>
              </div>
              <span className="text-xs font-bold text-[#a84c26] group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. COLLABORATIONS & BANDS VIEW                                             */
/* -------------------------------------------------------------------------- */
export const CollaborationsView = ({ allRepos, onOpenRepo, onInviteModal }) => {
  const musicians = [
    { name: 'Vikash', role: 'Producer & Lead Guitarist', handle: 'vikash', status: 'Online', repos: 5, avatar: 'V', color: 'from-[#a84c26] to-[#e5a83b]' },
    { name: 'Neha', role: 'Lyricist & Composer', handle: 'neha', status: 'In Studio', repos: 4, avatar: 'N', color: 'from-[#6366f1] to-[#8b5cf6]' },
    { name: 'Maya Vocals', role: 'Lead Vocalist', handle: 'maya-vocals', status: 'Recording', repos: 3, avatar: 'M', color: 'from-[#ec4899] to-[#f43f5e]' },
    { name: 'Sid Guitar', role: 'Acoustic & Rhythm Guitar', handle: 'sid-guitar', status: 'Online', repos: 3, avatar: 'S', color: 'from-[#0ea5e9] to-[#06b6d4]' },
    { name: 'Arjun Drums', role: 'Percussionist & Drummer', handle: 'arjun-drums', status: 'Offline', repos: 2, avatar: 'A', color: 'from-[#10b981] to-[#059669]' },
    { name: 'Rohan', role: 'Mixing & Mastering Engineer', handle: 'rohan', status: 'Idle', repos: 3, avatar: 'R', color: 'from-[#f59e0b] to-[#d97706]' }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
            Band & Collaborator Roster
          </h1>
          <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
            Active bandmates contributing vocal tracks, rhythm stems, guitar takes, and lyrics revisions.
          </p>
        </div>

        <button
          onClick={onInviteModal}
          className="studio-btn-amber px-5 py-2.5 font-bold text-xs flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Band Member</span>
        </button>
      </div>

      {/* Musician Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {musicians.map(m => (
          <div key={m.handle} className="studio-card p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} text-white font-extrabold flex items-center justify-center text-lg shadow-sm`}>
                  {m.avatar}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#1c1e21]">{m.name}</h3>
                  <p className="text-xs text-[#a84c26] font-medium">{m.role}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                m.status === 'Online' || m.status === 'In Studio' || m.status === 'Recording'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#f5f3ef] text-[#7c8088]'
              }`}>
                {m.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#fbfaf8] border border-[#ece8e1] flex items-center justify-between text-xs font-mono">
              <span className="text-[#7c8088]">Handle: @{m.handle}</span>
              <span className="font-bold text-[#1c1e21]">{m.repos} active songs</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#7c8088]">Protected Branch Permissions: Active</span>
              <button 
                onClick={() => onOpenRepo(allRepos[0])}
                className="text-xs font-bold text-[#a84c26] hover:underline"
              >
                View Stems &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. ARTISTS DIRECTORY VIEW                                                  */
/* -------------------------------------------------------------------------- */
export const ArtistsDirectoryView = ({ allRepos, onOpenRepo }) => {
  const artists = [
    { name: 'Vikash Sharma', handle: '@vikash', bio: 'Alternative rock producer and multi-instrumentalist based in New Delhi.', tracks: 8, followers: '1.4k', genre: 'Indie Rock' },
    { name: 'Maya Vocals', handle: '@maya-vocals', bio: 'Soulful classical & contemporary vocalist. Specializes in harmonies and acoustic runs.', tracks: 5, followers: '3.2k', genre: 'Sufi / Indie' },
    { name: 'Sid Guitars', handle: '@sid-guitar', bio: 'Fingerstyle acoustic and overdriven electric lead tracks.', tracks: 6, followers: '890', genre: 'Acoustic Folk' },
    { name: 'Arjun Beats', handle: '@arjun-drums', bio: 'Live acoustic drums, cajon, and electronic polyrhythmic grooves.', tracks: 4, followers: '1.1k', genre: 'Percussion / Rock' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
          Featured Artists & Producers
        </h1>
        <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
          Explore independent songwriters and audio engineers collaborating on open-source songs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {artists.map(artist => (
          <div key={artist.handle} className="studio-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-lg text-[#1c1e21]">{artist.name}</h3>
                  <span className="text-xs font-mono text-[#a84c26]">{artist.handle}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#f5f3ef] text-[#4b4f57]">
                  {artist.genre}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4b4f57] leading-relaxed">
                {artist.bio}
              </p>
            </div>

            <div className="pt-4 border-t border-[#f0ece4] flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs font-mono text-[#7c8088]">
                <span>{artist.tracks} Tracks</span>
                <span>•</span>
                <span>{artist.followers} Collaborators</span>
              </div>
              <button 
                onClick={() => onOpenRepo(allRepos[0])}
                className="studio-btn-primary px-4 py-2 font-bold text-xs"
              >
                Listen to Works
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. FAVORITE SONGS & LIKED STEMS VIEW                                       */
/* -------------------------------------------------------------------------- */
export const LikedSongsView = ({ allRepos, onOpenRepo }) => {
  const [playingTrack, setPlayingTrack] = useState(null);

  const likedTracks = [
    { title: 'Adhoori Kahani - Lead Vocal Take 03', artist: 'Maya Vocals', duration: '3:42', key: 'C Major', bpm: 120, repo: allRepos[0] },
    { title: 'Raat Ke Safar - Overdrive Lead Guitar', artist: 'Sid Guitar', duration: '4:15', key: 'E Minor', bpm: 110, repo: allRepos[1] || allRepos[0] },
    { title: 'Laal Dhun - Tabla & Cajon Percussion', artist: 'Arjun Drums', duration: '3:50', key: 'D Minor', bpm: 95, repo: allRepos[2] || allRepos[0] },
    { title: 'Sheher Se Door - Fingerstyle Acoustic', artist: 'Vikash', duration: '2:58', key: 'G Major', bpm: 88, repo: allRepos[3] || allRepos[0] },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
          Favorite Tracks & Starred Takes
        </h1>
        <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
          High-fidelity takes and stems you have starred for quick review and auditioning.
        </p>
      </div>

      <div className="studio-card divide-y divide-[#f0ece4] overflow-hidden">
        {likedTracks.map((item, idx) => (
          <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors">
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <button
                onClick={() => setPlayingTrack(playingTrack === idx ? null : idx)}
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 ${
                  playingTrack === idx 
                    ? 'bg-[#a84c26] text-white' 
                    : 'bg-[#f5f3ef] text-[#1c1e21] hover:bg-[#ede8dc]'
                }`}
              >
                {playingTrack === idx ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="min-w-0">
                <h4 className="font-bold text-sm text-[#1c1e21] truncate">{item.title}</h4>
                <p className="text-xs text-[#7c8088] mt-0.5">{item.artist} • {item.bpm} BPM • {item.key}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="font-mono text-xs text-[#7c8088] hidden sm:inline">{item.duration}</span>
              <button 
                onClick={() => onOpenRepo(item.repo)}
                className="studio-btn-primary px-3 py-1.5 text-xs font-bold"
              >
                Open Studio
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. TEMPLATES VIEW                                                          */
/* -------------------------------------------------------------------------- */
export const TemplatesView = ({ onOpenNewRepoModal }) => {
  const templates = [
    {
      title: 'Indie Rock 4-Piece Band',
      tracks: ['Lead Vocal', 'Electric Guitar (Overdrive)', 'Bass Guitar', 'Acoustic Drums'],
      bpm: 124,
      desc: 'Pre-configured 4-stem template with high-headroom bus routing and basic lyrics verse-chorus structure.'
    },
    {
      title: 'Acoustic Singer-Songwriter',
      tracks: ['Lead Vocal', 'Vocal Harmonies', 'Acoustic Guitar L/R', 'Warm Bass Pad'],
      bpm: 92,
      desc: 'Optimized for intimate acoustic ballads with dedicated vocal take comparison slots.'
    },
    {
      title: 'Lo-Fi Chill & Hip-Hop',
      tracks: ['Lo-Fi Drum Kit', 'Rhodes Piano', 'Sub Bass 808', 'Ambient Foley'],
      bpm: 84,
      desc: 'Groove-centric layout with swing-quantized percussion channels and warm saturation master chain.'
    },
    {
      title: 'Cinematic Orchestral',
      tracks: ['String Ensemble', 'Brass Horns', 'Timpani & Percussion', 'Piano Lead'],
      bpm: 110,
      desc: 'Multi-layered acoustic orchestral arrangement with dynamic headroom for expressive scoring.'
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
            Arrangement Templates
          </h1>
          <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
            Kickstart a new song with pre-arranged multitrack stems, BPM metronome, and lyrics framework.
          </p>
        </div>

        <button
          onClick={onOpenNewRepoModal}
          className="studio-btn-amber px-5 py-2.5 font-bold text-xs flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Blank Repo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {templates.map((tpl, idx) => (
          <div key={idx} className="studio-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#1c1e21]">{tpl.title}</h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#f5f3ef] text-[#4b4f57]">
                  {tpl.bpm} BPM
                </span>
              </div>
              <p className="text-xs text-[#7c8088] leading-relaxed">{tpl.desc}</p>

              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono font-bold text-[#a84c26] uppercase">Pre-configured Stems:</span>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.tracks.map((t, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-[#fbfaf8] border border-[#ece8e1] text-[#4b4f57]">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#f0ece4]">
              <button
                onClick={onOpenNewRepoModal}
                className="studio-btn-primary w-full py-2.5 font-bold text-xs flex items-center justify-center space-x-2"
              >
                <span>Use This Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 6. SHARED WITH ME VIEW                                                     */
/* -------------------------------------------------------------------------- */
export const SharedWithMeView = ({ allRepos, onOpenRepo }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
          Shared with Me
        </h1>
        <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
          Songs and collaborative stem branches where you have contributor or review permissions.
        </p>
      </div>

      <div className="space-y-4">
        {allRepos.map((repo, idx) => (
          <div key={repo._id} className="studio-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <h3 className="font-extrabold text-base text-[#1c1e21]">{repo.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#e5a83b]/20 text-[#853718]">
                  CONTRIBUTOR
                </span>
              </div>
              <p className="text-xs text-[#7c8088]">
                Owner: @{repo.owner?.username || 'vikash'} • Last activity: Today • Protected Branch: main
              </p>
            </div>

            <button
              onClick={() => onOpenRepo(repo)}
              className="studio-btn-amber px-4 py-2 font-bold text-xs self-start sm:self-auto"
            >
              Open Workspace
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 7. STUDIO ANALYTICS VIEW                                                   */
/* -------------------------------------------------------------------------- */
export const StudioAnalyticsView = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
          Studio Analytics & Safety Metrics
        </h1>
        <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
          Comprehensive telemetry on commit integrity, audio take isolation, and branching velocity.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="studio-card p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#7c8088] uppercase">Data Loss Prevention</span>
          <p className="text-3xl font-extrabold text-emerald-600">100%</p>
          <p className="text-xs text-[#4b4f57]">0 overwritten takes or audio blobs</p>
        </div>

        <div className="studio-card p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#7c8088] uppercase">Protected Branches</span>
          <p className="text-3xl font-extrabold text-[#a84c26]">100%</p>
          <p className="text-xs text-[#4b4f57]">Main branch locked with pull requests</p>
        </div>

        <div className="studio-card p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#7c8088] uppercase">Active Takes in Cloud</span>
          <p className="text-3xl font-extrabold text-[#1c1e21]">18</p>
          <p className="text-xs text-[#4b4f57]">Durable 44.1kHz audio stems</p>
        </div>

        <div className="studio-card p-5 space-y-1">
          <span className="text-[11px] font-mono text-[#7c8088] uppercase">Merge Success Rate</span>
          <p className="text-3xl font-extrabold text-[#e5a83b]">98.4%</p>
          <p className="text-xs text-[#4b4f57]">Line diff 3-way conflict resolution</p>
        </div>
      </div>

      {/* Commit Velocity Card */}
      <div className="studio-card p-6 space-y-4">
        <h3 className="font-extrabold text-base text-[#1c1e21]">Weekly Commit & Take Velocity</h3>
        <p className="text-xs text-[#7c8088]">
          Activity frequency across vocalist, guitar, drums, and lyrics revision branches.
        </p>
        
        {/* Visual Bar Graph */}
        <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-[#ece8e1] pb-2">
          {[
            { day: 'Mon', height: '60%', commits: 8 },
            { day: 'Tue', height: '85%', commits: 14 },
            { day: 'Wed', height: '40%', commits: 5 },
            { day: 'Thu', height: '95%', commits: 18 },
            { day: 'Fri', height: '75%', commits: 12 },
            { day: 'Sat', height: '100%', commits: 22 },
            { day: 'Sun', height: '70%', commits: 11 },
          ].map((bar, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="text-[10px] font-mono font-bold text-[#a84c26] opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.commits}
              </span>
              <div 
                className="w-full max-w-[48px] rounded-t-xl bg-gradient-to-t from-[#a84c26] to-[#e5a83b] transition-all hover:brightness-110"
                style={{ height: bar.height }}
              />
              <span className="text-xs font-mono text-[#7c8088]">{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 8. SETTINGS VIEW                                                           */
/* -------------------------------------------------------------------------- */
export const StudioSettingsView = () => {
  const [sampleRate, setSampleRate] = useState('44100');
  const [bufferSize, setBufferSize] = useState('512');
  const [autoSaveLyrics, setAutoSaveLyrics] = useState(true);
  const [protectMain, setProtectMain] = useState(true);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
          Studio Preferences & Audio Configuration
        </h1>
        <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
          Adjust Web Audio engine settings, branch protection rules, and version control limits.
        </p>
      </div>

      <div className="studio-card p-6 space-y-6">
        <h3 className="font-extrabold text-base text-[#1c1e21] border-b border-[#ece8e1] pb-3">
          Web Audio Playback Engine
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1c1e21]">SAMPLE RATE (HZ)</label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value)}
              className="studio-input w-full text-xs"
            >
              <option value="44100">44,100 Hz (CD Standard Studio Quality)</option>
              <option value="48000">48,000 Hz (Broadcast & Video Standard)</option>
              <option value="96000">96,000 Hz (High Resolution Master)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1c1e21]">BUFFER SIZE (LATENCY)</label>
            <select
              value={bufferSize}
              onChange={(e) => setBufferSize(e.target.value)}
              className="studio-input w-full text-xs"
            >
              <option value="256">256 samples (Ultra Low Latency)</option>
              <option value="512">512 samples (Balanced Performance)</option>
              <option value="1024">1024 samples (Maximum Track Stability)</option>
            </select>
          </div>
        </div>

        <h3 className="font-extrabold text-base text-[#1c1e21] border-b border-[#ece8e1] pb-3 pt-4">
          Repository Safety Policies
        </h3>

        <div className="space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={protectMain}
              onChange={(e) => setProtectMain(e.target.checked)}
              className="w-4 h-4 accent-[#a84c26] rounded"
            />
            <div>
              <span className="font-bold text-xs text-[#1c1e21] block">Enforce Pull Request Review on 'main'</span>
              <span className="text-xs text-[#7c8088]">Requires at least 1 approval before merging contributor stems into the approved song.</span>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSaveLyrics}
              onChange={(e) => setAutoSaveLyrics(e.target.checked)}
              className="w-4 h-4 accent-[#a84c26] rounded"
            />
            <div>
              <span className="font-bold text-xs text-[#1c1e21] block">Real-time Lyrics Autosave & Conflict Alerts</span>
              <span className="text-xs text-[#7c8088]">Automatically drafts lyrics changes and warns immediately if another lyricist writes to the same section.</span>
            </div>
          </label>
        </div>

        <div className="pt-4 border-t border-[#ece8e1]">
          <button 
            onClick={() => alert('Studio preferences saved successfully!')}
            className="studio-btn-amber px-6 py-2.5 font-bold text-xs"
          >
            Save Studio Settings
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 9. HELP & WORKFLOW GUIDE                                                   */
/* -------------------------------------------------------------------------- */
export const StudioHelpView = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1e21] tracking-tight">
          Musician's Guide to Version Control
        </h1>
        <p className="text-xs sm:text-sm text-[#7c8088] mt-1">
          Learn how GitHub branching, commit diffs, and pull requests work for songs, audio takes, and lyrics.
        </p>
      </div>

      <div className="space-y-4">
        <div className="studio-card p-6 space-y-2">
          <h3 className="font-extrabold text-base text-[#1c1e21] flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-[#a84c26]" />
            <span>1. What is Branching in Music?</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#4b4f57] leading-relaxed">
            In FriendJam, the <code>main</code> branch represents the official, approved mix of your song. When a singer wants to record an alternative hook or a guitarist wants to experiment with a solo, they create an isolated branch (e.g. <code>vocals/singer-name</code>). Their recordings never overwrite or disturb <code>main</code> until a pull request is submitted and approved.
          </p>
        </div>

        <div className="studio-card p-6 space-y-2">
          <h3 className="font-extrabold text-base text-[#1c1e21] flex items-center space-x-2">
            <Music className="w-4 h-4 text-[#a84c26]" />
            <span>2. How Audio Takes Work (Never Overwritten)</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#4b4f57] leading-relaxed">
            Every audio file uploaded is immutably stored in object storage with a unique cryptographic take ID. If you upload a new take to a track, your previous take remains preserved forever. You can compare takes, switch between them with one click, or restore any deleted take from the Recoverable Trash Bin.
          </p>
        </div>

        <div className="studio-card p-6 space-y-2">
          <h3 className="font-extrabold text-base text-[#1c1e21] flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#a84c26]" />
            <span>3. Resolving Lyrics Conflicts</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#4b4f57] leading-relaxed">
            If two songwriters edit different lines (e.g. one edits Verse 1 and another writes Verse 2), FriendJam automatically 3-way merges both changes without conflict. If both songwriters edit the exact same line simultaneously, our interactive side-by-side conflict resolver shows both versions and lets you choose or combine them without losing words.
          </p>
        </div>

        <div className="studio-card p-6 space-y-2">
          <h3 className="font-extrabold text-base text-[#1c1e21] flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-[#a84c26]" />
            <span>4. Submitting a Pull Request (PR)</span>
          </h3>
          <p className="text-xs sm:text-sm text-[#4b4f57] leading-relaxed">
            When your branch has the perfect take or updated lyrics, open a Pull Request to <code>main</code>. The repo owner and band maintainers can audition your stems, compare waveforms, read lyrics diffs, request changes, or approve the merge into the master song.
          </p>
        </div>
      </div>
    </div>
  );
};
