import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  FolderPlus, 
  Search, 
  GitBranch, 
  Disc3, 
  Clock, 
  Users, 
  Music, 
  ShieldCheck, 
  Filter, 
  Layers,
  ArrowUpRight,
  GitPullRequest,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const Dashboard = ({ onSelectRepo }) => {
  const { user } = useAuth();
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'owned', 'shared'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRepoData, setNewRepoData] = useState({
    name: '',
    description: '',
    genre: 'Indie Rock',
    bpm: 120,
    keySignature: 'C Major',
    timeSignature: '4/4',
    visibility: 'public'
  });
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    loadRepositories();
  }, []);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const data = await api.getRepos();
      setRepos(data.repositories || []);
    } catch (err) {
      console.error('Failed to load repos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRepo = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    try {
      const created = await api.createRepo(newRepoData);
      setShowCreateModal(false);
      setNewRepoData({
        name: '',
        description: '',
        genre: 'Indie Rock',
        bpm: 120,
        keySignature: 'C Major',
        timeSignature: '4/4',
        visibility: 'public'
      });
      await loadRepositories();
      if (onSelectRepo) {
        onSelectRepo(created.repository);
      }
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // Filter logic
  const filteredRepos = repos.filter(repo => {
    const matchesSearch = 
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (repo.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = filterGenre === 'all' || repo.genre === filterGenre;

    const isOwner = repo.owner?._id === user?.id || repo.owner === user?.id || repo.myRole === 'owner';
    const matchesTab = 
      filterTab === 'all' ? true :
      filterTab === 'owned' ? isOwner :
      !isOwner;

    return matchesSearch && matchesGenre && matchesTab;
  });

  const ownedCount = repos.filter(r => r.owner?._id === user?.id || r.owner === user?.id || r.myRole === 'owner').length;
  const sharedCount = repos.length - ownedCount;

  // Extract unique genres for filter dropdown
  const allGenres = ['all', ...Array.from(new Set(repos.map(r => r.genre).filter(Boolean)))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider bg-[#d7ff3b] border border-black px-2 py-0.5">
              WORKBENCH
            </span>
            <span className="text-xs font-mono text-neutral-600">
              LOGGED AS: @{user?.username} ({user?.primaryRole})
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
            Song Repositories
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="brutal-btn brutal-btn-acid px-5 py-2.5 text-sm font-bold flex items-center space-x-2 self-start shadow-brutal"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Song Repository</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="brutal-card p-4 bg-white">
          <span className="text-neutral-500 font-bold block mb-1">TOTAL REPOSITORIES</span>
          <span className="text-2xl font-bold font-sans">{repos.length}</span>
        </div>
        <div className="brutal-card p-4 bg-white">
          <span className="text-neutral-500 font-bold block mb-1">PROJECTS OWNED</span>
          <span className="text-2xl font-bold font-sans text-neutral-900">{ownedCount}</span>
        </div>
        <div className="brutal-card p-4 bg-white">
          <span className="text-neutral-500 font-bold block mb-1">COLLABORATIONS</span>
          <span className="text-2xl font-bold font-sans text-[#0055ff]">{sharedCount}</span>
        </div>
        <div className="brutal-card p-4 bg-white">
          <span className="text-neutral-500 font-bold block mb-1">ENVIRONMENT</span>
          <span className="text-sm font-bold text-emerald-700 flex items-center space-x-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>PCM 44.1kHz / Git Sync</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-white border-2 border-black">
        
        {/* Tab Filters */}
        <div className="flex items-center space-x-1 font-mono text-xs font-bold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 border border-black ${
              filterTab === 'all' ? 'bg-black text-[#d7ff3b]' : 'bg-[#faf9f5] hover:bg-[#ede8dc]'
            }`}
          >
            ALL PROJECTS ({repos.length})
          </button>
          <button
            onClick={() => setFilterTab('owned')}
            className={`px-3 py-1.5 border border-black ${
              filterTab === 'owned' ? 'bg-black text-[#d7ff3b]' : 'bg-[#faf9f5] hover:bg-[#ede8dc]'
            }`}
          >
            I OWN ({ownedCount})
          </button>
          <button
            onClick={() => setFilterTab('shared')}
            className={`px-3 py-1.5 border border-black ${
              filterTab === 'shared' ? 'bg-black text-[#d7ff3b]' : 'bg-[#faf9f5] hover:bg-[#ede8dc]'
            }`}
          >
            SHARED WITH ME ({sharedCount})
          </button>
        </div>

        {/* Search input & Genre filter */}
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search songs, slugs..."
              className="brutal-input text-xs pl-8 py-1.5 w-full font-mono"
            />
          </div>

          <div className="flex items-center space-x-1 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-neutral-600" />
            <select
              value={filterGenre}
              onChange={e => setFilterGenre(e.target.value)}
              className="brutal-input text-xs py-1.5 font-mono bg-white"
            >
              {allGenres.map(g => (
                <option key={g} value={g}>
                  {g === 'all' ? 'All Genres' : g}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Repositories List */}
      {loading ? (
        <div className="brutal-card p-12 text-center bg-white">
          <div className="font-mono text-xs font-bold animate-pulse">
            [ACCESSING REPOSITORY REGISTRY...]
          </div>
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="brutal-card p-12 text-center bg-white space-y-4">
          <div className="w-12 h-12 border-2 border-black bg-[#ede8dc] mx-auto flex items-center justify-center font-bold">
            <Music className="w-6 h-6 text-neutral-700" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-sans">No matching song projects found.</h3>
            <p className="text-xs text-neutral-600 font-mono max-w-sm mx-auto">
              {searchQuery || filterGenre !== 'all' 
                ? 'Try adjusting your search query or genre filter.'
                : 'Create your first song repository to start tracking lyrics and stems.'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="brutal-btn brutal-btn-acid px-4 py-2 text-xs font-bold inline-flex items-center space-x-1"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Song</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map(repo => {
            const isOwner = repo.owner?._id === user?.id || repo.owner === user?.id || repo.myRole === 'owner';
            const ownerName = repo.owner?.username || 'vikash';

            return (
              <div 
                key={repo._id}
                onClick={() => onSelectRepo(repo)}
                className="brutal-card bg-white p-5 cursor-pointer hover:bg-[#faf9f5] transition-all group flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Tags */}
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-neutral-500 font-medium">
                      @{ownerName}
                    </span>
                    <span className={`technical-badge ${isOwner ? 'bg-[#d7ff3b]' : 'bg-[#ede8dc]'}`}>
                      {isOwner ? 'OWNER' : (repo.myRole || 'COLLABORATOR').toUpperCase()}
                    </span>
                  </div>

                  {/* Title & Slug */}
                  <h3 className="text-xl font-bold font-sans tracking-tight group-hover:text-black group-hover:underline flex items-center justify-between">
                    <span>{repo.name}</span>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-black transition-colors" />
                  </h3>
                  <div className="font-mono text-xs text-neutral-500 mt-0.5">
                    /{repo.slug}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-neutral-700 mt-3 line-clamp-2 leading-relaxed">
                    {repo.description || 'No description provided for this song project.'}
                  </p>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t-2 border-black space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="bg-[#ede8dc] px-1.5 py-0.5 border border-black font-bold">
                      {repo.genre}
                    </span>
                    <span className="text-neutral-600">
                      {repo.keySignature} • {repo.bpm} BPM
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                    <div className="flex items-center space-x-1">
                      <GitBranch className="w-3 h-3 text-neutral-700" />
                      <span>{repo.defaultBranch || 'main'}</span>
                    </div>
                    <span>
                      Updated {new Date(repo.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Repository Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-lg w-full p-6 border-2 border-black">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-700">
                [01] INITIALIZE NEW SONG REPOSITORY
              </span>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="font-mono text-sm font-bold hover:text-red-600"
              >
                ✕ CLOSE
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-2 bg-red-100 border border-red-600 font-mono text-xs text-red-900 font-bold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateRepo} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block font-bold mb-1">SONG NAME *</label>
                <input
                  type="text"
                  required
                  value={newRepoData.name}
                  onChange={e => setNewRepoData({ ...newRepoData, name: e.target.value })}
                  placeholder="e.g. Midnight Horizon"
                  className="brutal-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">DESCRIPTION & CREATIVE VISION</label>
                <textarea
                  rows={2}
                  value={newRepoData.description}
                  onChange={e => setNewRepoData({ ...newRepoData, description: e.target.value })}
                  placeholder="Atmospheric indie rock track with acoustic intro and heavy chorus..."
                  className="brutal-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">GENRE</label>
                  <input
                    type="text"
                    value={newRepoData.genre}
                    onChange={e => setNewRepoData({ ...newRepoData, genre: e.target.value })}
                    placeholder="Alternative Rock"
                    className="brutal-input w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">KEY SIGNATURE</label>
                  <input
                    type="text"
                    value={newRepoData.keySignature}
                    onChange={e => setNewRepoData({ ...newRepoData, keySignature: e.target.value })}
                    placeholder="E Minor"
                    className="brutal-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">TEMPO (BPM)</label>
                  <input
                    type="number"
                    min={30}
                    max={280}
                    value={newRepoData.bpm}
                    onChange={e => setNewRepoData({ ...newRepoData, bpm: Number(e.target.value) })}
                    className="brutal-input w-full"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">TIME SIGNATURE</label>
                  <input
                    type="text"
                    value={newRepoData.timeSignature}
                    onChange={e => setNewRepoData({ ...newRepoData, timeSignature: e.target.value })}
                    placeholder="4/4"
                    className="brutal-input w-full"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={creating}
                  className="brutal-btn brutal-btn-acid w-full py-3 text-sm font-bold shadow-brutal"
                >
                  {creating ? 'INITIALIZING MAIN BRANCH...' : 'CREATE SONG REPOSITORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
