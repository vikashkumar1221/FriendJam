import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { MultitrackStudio } from './MultitrackStudio';
import { LyricsWorkspace } from './LyricsWorkspace';
import { CommitHistory } from './CommitHistory';
import { PullRequestWorkspace } from './PullRequestWorkspace';
import { BranchManager } from './BranchManager';
import { CollaboratorSettings } from './CollaboratorSettings';
import { TrashAuditWorkspace } from './TrashAuditWorkspace';
import { 
  GitBranch, 
  Music, 
  FileText, 
  GitCommit, 
  GitPullRequest, 
  Settings, 
  Trash2, 
  Layers, 
  Sliders, 
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  Disc3,
  Sparkles
} from 'lucide-react';

export const RepositoryView = ({ repo, onBackToDashboard }) => {
  const { user } = useAuth();
  const [currentBranch, setCurrentBranch] = useState(repo.defaultBranch || 'main');
  const [branches, setBranches] = useState([]);
  const [activeTab, setActiveTab] = useState('tracks'); // 'tracks', 'lyrics', 'commits', 'pulls', 'branches', 'settings', 'recovery'
  const [repoData, setRepoData] = useState(repo);
  const [userRole, setUserRole] = useState('viewer');
  const [showBranchMenu, setShowBranchMenu] = useState(false);

  useEffect(() => {
    loadRepoMeta();
  }, [repo._id]);

  const loadRepoMeta = async () => {
    try {
      const data = await api.getRepoBySlug(repo.owner?.username || 'vikash', repo.slug);
      setRepoData(data.repository);
      setUserRole(data.userRole || 'viewer');
      setBranches(data.branches || []);
    } catch (err) {
      console.error('Failed to load repo meta:', err);
    }
  };

  const tabs = [
    { id: 'tracks', label: '[01] MULTITRACK STUDIO', icon: Music },
    { id: 'lyrics', label: '[02] LYRICS EDITOR', icon: FileText },
    { id: 'commits', label: '[03] COMMITS LOG', icon: GitCommit },
    { id: 'pulls', label: '[04] PULL REQUESTS', icon: GitPullRequest },
    { id: 'branches', label: '[05] BRANCHES', icon: GitBranch },
    { id: 'settings', label: '[06] COLLABORATORS & ACCESS', icon: Settings },
    { id: 'recovery', label: '[07] TRASH & AUDIT', icon: Trash2 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Back to Dashboard breadcrumb */}
      <div className="flex items-center justify-between font-mono text-xs">
        <button
          onClick={onBackToDashboard}
          className="hover:underline flex items-center space-x-1 font-bold text-neutral-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO ALL PROJECTS</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-neutral-500">YOUR ROLE IN THIS REPO:</span>
          <span className="bg-[#d7ff3b] text-black px-2 py-0.5 border border-black font-bold uppercase">
            {userRole}
          </span>
        </div>
      </div>

      {/* Main Repository Header Card */}
      <div className="brutal-card bg-white p-5 border-2 border-black space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-black pb-4">
          
          <div className="space-y-1">
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-neutral-500 font-medium">@{repoData.owner?.username || 'vikash'}</span>
              <span className="text-neutral-400">/</span>
              <span className="text-black font-bold">{repoData.slug}</span>
              <span className="technical-badge bg-[#ede8dc] uppercase text-[10px]">
                {repoData.visibility}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black font-sans">
              {repoData.name}
            </h1>

            {repoData.description && (
              <p className="text-xs text-neutral-700 max-w-2xl font-sans leading-relaxed pt-1">
                {repoData.description}
              </p>
            )}
          </div>

          {/* Key musical parameters */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="bg-[#ede8dc] border border-black p-2 text-center min-w-20">
              <span className="text-[10px] text-neutral-500 block">KEY</span>
              <span className="font-bold text-sm text-black">{repoData.keySignature}</span>
            </div>

            <div className="bg-[#ede8dc] border border-black p-2 text-center min-w-20">
              <span className="text-[10px] text-neutral-500 block">TEMPO</span>
              <span className="font-bold text-sm text-black">{repoData.bpm} BPM</span>
            </div>

            <div className="bg-[#ede8dc] border border-black p-2 text-center min-w-20">
              <span className="text-[10px] text-neutral-500 block">METER</span>
              <span className="font-bold text-sm text-black">{repoData.timeSignature}</span>
            </div>

            <div className="bg-black text-[#d7ff3b] border border-black p-2 text-center min-w-24">
              <span className="text-[10px] text-neutral-400 block">STATUS</span>
              <span className="font-bold text-sm uppercase">{repoData.status}</span>
            </div>
          </div>

        </div>

        {/* Branch Selector & Active Workspace Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs pt-1">
          
          <div className="flex items-center space-x-2">
            <span className="text-neutral-500 font-bold">WORKING BRANCH:</span>
            
            <div className="relative">
              <button
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="brutal-btn bg-white px-3 py-1.5 flex items-center space-x-2 font-bold"
              >
                <GitBranch className="w-3.5 h-3.5 text-neutral-700" />
                <span>{currentBranch}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showBranchMenu && (
                <div className="absolute left-0 mt-2 w-64 brutal-card bg-white z-40 p-2 text-xs">
                  <div className="font-bold uppercase text-[10px] text-neutral-500 px-2 py-1 border-b border-black mb-1">
                    Select Branch
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {branches.map(b => (
                      <button
                        key={b.name}
                        onClick={() => {
                          setCurrentBranch(b.name);
                          setShowBranchMenu(false);
                        }}
                        className={`w-full text-left px-2 py-1.5 border flex items-center justify-between ${
                          currentBranch === b.name ? 'bg-[#d7ff3b] border-black font-bold' : 'bg-white hover:bg-neutral-100 border-neutral-300'
                        }`}
                      >
                        <span>{b.name}</span>
                        {b.name === (repoData.defaultBranch || 'main') && (
                          <span className="text-[9px] bg-black text-white px-1">default</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {currentBranch === (repoData.defaultBranch || 'main') ? (
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-600 px-2 py-0.5 text-[10px] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Protected Branch</span>
              </span>
            ) : (
              <span className="bg-[#ede8dc] border border-black px-2 py-0.5 text-[10px] text-neutral-700">
                Independent Branch Workspace
              </span>
            )}
          </div>

          <div className="text-[11px] text-neutral-600">
            Song ID: <code className="bg-[#ede8dc] px-1 py-0.5 border border-black">{repoData._id}</code>
          </div>

        </div>

      </div>

      {/* Workshop Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 font-mono text-xs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-bold border-2 border-black flex items-center space-x-2 whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-black text-[#d7ff3b] shadow-brutal-sm' 
                  : 'bg-white text-black hover:bg-[#ede8dc]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <main className="transition-opacity">
        {activeTab === 'tracks' && (
          <MultitrackStudio 
            repo={repoData} 
            currentBranch={currentBranch} 
            userRole={userRole} 
          />
        )}

        {activeTab === 'lyrics' && (
          <LyricsWorkspace 
            repo={repoData} 
            currentBranch={currentBranch} 
            userRole={userRole} 
          />
        )}

        {activeTab === 'commits' && (
          <CommitHistory 
            repo={repoData} 
            currentBranch={currentBranch} 
            userRole={userRole} 
          />
        )}

        {activeTab === 'pulls' && (
          <PullRequestWorkspace 
            repo={repoData} 
            currentBranch={currentBranch} 
            userRole={userRole} 
          />
        )}

        {activeTab === 'branches' && (
          <BranchManager 
            repo={repoData} 
            currentBranch={currentBranch} 
            onSwitchBranch={b => setCurrentBranch(b)}
            userRole={userRole} 
          />
        )}

        {activeTab === 'settings' && (
          <CollaboratorSettings 
            repo={repoData} 
            onRepoUpdated={r => setRepoData(r)}
            userRole={userRole} 
          />
        )}

        {activeTab === 'recovery' && (
          <TrashAuditWorkspace 
            repo={repoData} 
            userRole={userRole} 
          />
        )}
      </main>

    </div>
  );
};
