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
  Sparkles,
  Heart
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
    { id: 'tracks', label: 'Multitrack Studio', icon: Music },
    { id: 'lyrics', label: 'Lyrics Editor', icon: FileText },
    { id: 'commits', label: 'Commits Log', icon: GitCommit },
    { id: 'pulls', label: 'Pull Requests', icon: GitPullRequest },
    { id: 'branches', label: 'Branches', icon: GitBranch },
    { id: 'settings', label: 'Collaborators & Access', icon: Settings },
    { id: 'recovery', label: 'Trash & Audit', icon: Trash2 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb Nav */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={onBackToDashboard}
          className="hover:text-[#a84c26] flex items-center space-x-1.5 font-medium text-[#7a7e85] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Songs</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[#8c9099] font-mono text-[11px]">ROLE:</span>
          <span className="bg-[#fff7ed] text-[#9a3412] px-2.5 py-0.5 rounded-full font-bold uppercase text-[11px] border border-[#fed7aa]">
            {userRole}
          </span>
        </div>
      </div>

      {/* Main Repository Header Card */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-5">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#ece8e1] pb-5">
          
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-mono">
              <span className="text-[#8c9099]">@{repoData.owner?.username || 'vikash'}</span>
              <span className="text-neutral-300">/</span>
              <span className="text-[#1c1e21] font-bold">{repoData.slug}</span>
              <span className="bg-[#f0ede6] text-[#555962] px-2 py-0.5 rounded-full uppercase text-[10px] font-medium">
                {repoData.visibility}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1c1e21] font-sans">
              {repoData.name}
            </h1>

            {repoData.description && (
              <p className="text-xs sm:text-sm text-[#5b5f69] max-w-2xl leading-relaxed pt-0.5">
                {repoData.description}
              </p>
            )}
          </div>

          {/* Key musical parameters pills */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="bg-[#f8f6f2] border border-[#e4dfd6] px-3.5 py-2 rounded-2xl text-center min-w-20 shadow-sm">
              <span className="text-[10px] text-[#8c9099] block font-bold">KEY</span>
              <span className="font-bold text-sm text-[#1c1e21]">{repoData.keySignature}</span>
            </div>

            <div className="bg-[#f8f6f2] border border-[#e4dfd6] px-3.5 py-2 rounded-2xl text-center min-w-20 shadow-sm">
              <span className="text-[10px] text-[#8c9099] block font-bold">TEMPO</span>
              <span className="font-bold text-sm text-[#1c1e21]">{repoData.bpm} BPM</span>
            </div>

            <div className="bg-[#f8f6f2] border border-[#e4dfd6] px-3.5 py-2 rounded-2xl text-center min-w-20 shadow-sm">
              <span className="text-[10px] text-[#8c9099] block font-bold">METER</span>
              <span className="font-bold text-sm text-[#1c1e21]">{repoData.timeSignature}</span>
            </div>

            <div className="bg-gradient-to-r from-[#a84c26] to-[#87381a] text-white px-4 py-2 rounded-2xl text-center min-w-24 shadow-copper">
              <span className="text-[10px] text-[#f5be57] block font-bold uppercase">STATUS</span>
              <span className="font-bold text-sm uppercase">{repoData.status}</span>
            </div>
          </div>

        </div>

        {/* Branch Selector & Active Workspace Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          
          <div className="flex items-center space-x-2.5">
            <span className="text-[#7a7e85] font-medium font-mono">BRANCH:</span>
            
            <div className="relative">
              <button
                onClick={() => setShowBranchMenu(!showBranchMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full border border-[#e2ded5] bg-[#f8f6f2] hover:bg-[#f3efe9] font-semibold text-[#1c1e21] transition-all shadow-sm"
              >
                <GitBranch className="w-3.5 h-3.5 text-[#a84c26]" />
                <span>{currentBranch}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8c9099]" />
              </button>

              {showBranchMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-soft-lg border border-[#e2ded5] z-40 p-2 text-xs">
                  <div className="font-bold uppercase text-[10px] text-[#8c9099] px-2.5 py-1.5 border-b border-[#ece8e1] mb-1 font-mono">
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
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl border flex items-center justify-between transition-colors ${
                          currentBranch === b.name 
                            ? 'bg-[#fff7ed] border-[#fed7aa] text-[#9a3412] font-bold' 
                            : 'bg-white hover:bg-[#f5f2ec] border-transparent text-[#2b2d30]'
                        }`}
                      >
                        <span>{b.name}</span>
                        {b.name === (repoData.defaultBranch || 'main') && (
                          <span className="text-[9px] bg-[#1c1e21] text-white px-1.5 py-0.2 rounded-full">default</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {currentBranch === (repoData.defaultBranch || 'main') ? (
              <span className="bg-[#f0f9f4] text-[#059669] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Protected Branch</span>
              </span>
            ) : (
              <span className="bg-[#f0ede6] text-[#555962] px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono">
                Independent Contributor Branch
              </span>
            )}
          </div>

          <div className="text-[11px] text-[#8c9099] font-mono">
            Song ID: <code className="bg-[#f0ede6] px-2 py-0.5 rounded-md text-[#3a3d44]">{repoData._id}</code>
          </div>

        </div>

      </div>

      {/* Workshop Navigation Tabs as Elegant Pills */}
      <div className="flex overflow-x-auto pb-1 gap-2 text-xs font-sans">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-bold rounded-full flex items-center space-x-2 whitespace-nowrap transition-all ${
                isActive 
                  ? 'studio-btn-primary shadow-sm' 
                  : 'bg-white text-[#555962] hover:bg-[#ede8dc] border border-[#e4dfd6]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#e5a83b]' : 'text-[#7a7e85]'}`} />
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
