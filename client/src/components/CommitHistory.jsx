import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  GitCommit, 
  RotateCcw, 
  History, 
  Check, 
  FileText, 
  Music, 
  ArrowLeft, 
  Clock, 
  ShieldAlert, 
  Eye,
  GitBranch,
  Layers
} from 'lucide-react';

export const CommitHistory = ({ repo, currentBranch, userRole }) => {
  const { user } = useAuth();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [commitDetails, setCommitDetails] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCommits();
  }, [repo._id, currentBranch]);

  const loadCommits = async () => {
    setLoading(true);
    try {
      const data = await api.getCommits(repo._id, currentBranch);
      setCommits(data.commits || []);
    } catch (err) {
      console.error('Failed to load commits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectCommit = async (commit) => {
    setSelectedCommit(commit);
    setInspecting(true);
    try {
      const data = await api.getCommit(repo._id, commit.commitHash);
      setCommitDetails(data);
    } catch (err) {
      alert('Failed to load commit details: ' + err.message);
    } finally {
      setInspecting(false);
    }
  };

  const handleRevertCommit = async (commitHash) => {
    if (!confirm(`Revert commit [${commitHash}]? This safely records a new revert commit without deleting history.`)) return;
    setActionLoading(true);
    try {
      const res = await api.revertCommit(repo._id, commitHash);
      alert(res.message);
      setSelectedCommit(null);
      await loadCommits();
    } catch (err) {
      alert('Revert failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreCommit = async (commitHash) => {
    if (!confirm(`Restore repository state to commit [${commitHash}] on branch ${currentBranch}? This records a new restore commit.`)) return;
    setActionLoading(true);
    try {
      const res = await api.restoreCommit(repo._id, commitHash, currentBranch);
      alert(res.message);
      setSelectedCommit(null);
      await loadCommits();
    } catch (err) {
      alert('Restore failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Strip */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e8e4dc] shadow-soft flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-4 h-4 text-[#a84c26]" />
          <span className="font-bold text-[#1c1e21] uppercase">
            VERSION LOG: {commits.length} COMMITS RECORDED
          </span>
          <span className="text-neutral-400">•</span>
          <span className="bg-[#f0ede6] text-[#4b4f57] px-2.5 py-0.5 rounded-full text-[11px]">
            BRANCH: {currentBranch}
          </span>
        </div>

        <button
          onClick={loadCommits}
          className="text-[#a84c26] hover:underline font-bold"
        >
          REFRESH LOG
        </button>
      </div>

      {/* Main Commit Graph & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chronological Commits List */}
        <div className="lg:col-span-6 space-y-3 font-mono text-xs">
          {loading ? (
            <div className="bg-white p-8 rounded-3xl border border-[#e8e4dc] text-center text-[#7a7e85]">
              [TRAVERSING COMMIT GRAPH...]
            </div>
          ) : commits.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#e8e4dc] text-center text-[#7a7e85]">
              No commits found on branch "{currentBranch}".
            </div>
          ) : (
            commits.map((commit) => {
              const isSelected = selectedCommit?.commitHash === commit.commitHash;

              return (
                <div
                  key={commit._id || commit.commitHash}
                  onClick={() => handleInspectCommit(commit)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border shadow-sm ${
                    isSelected 
                      ? 'bg-[#fff7ed] border-[#fed7aa] shadow-md ring-2 ring-[#a84c26]/20' 
                      : 'bg-white border-[#e8e4dc] hover:border-[#a84c26]/40 hover:bg-[#fbfaf8]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="bg-[#1c1e21] text-[#f5be57] px-2 py-0.5 rounded-md text-[11px] font-bold">
                        {commit.commitHash}
                      </span>
                      <span className="text-[11px] text-[#7a7e85]">
                        @{commit.author?.username || 'vikash'}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#8c9099]">
                      {new Date(commit.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-bold text-sm text-[#1c1e21] font-sans leading-snug">
                    {commit.message}
                  </p>

                  {/* Changes badges */}
                  <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-[#ece8e1] text-[10px]">
                    {commit.changes?.lyricsChanged && (
                      <span className="bg-[#f0ede6] text-[#4a4d54] px-2 py-0.5 rounded-full font-medium">
                        Lyrics Diff
                      </span>
                    )}
                    {commit.changes?.addedTakes?.length > 0 && (
                      <span className="bg-[#ffedd5] text-[#9a3412] px-2 py-0.5 rounded-full font-medium">
                        +{commit.changes.addedTakes.length} Takes Added
                      </span>
                    )}
                    {commit.changes?.revertedFromCommit && (
                      <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                        Reverts [{commit.changes.revertedFromCommit}]
                      </span>
                    )}
                    {commit.changes?.restoredFromCommit && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                        Restores [{commit.changes.restoredFromCommit}]
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Version Inspector */}
        <div className="lg:col-span-6">
          {selectedCommit ? (
            <div className="bg-white p-6 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-4 text-xs sticky top-24">
              
              <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
                <div>
                  <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono block">
                    COMMIT [{selectedCommit.commitHash}]
                  </span>
                  <span className="text-[11px] text-[#8c9099] font-mono">
                    Committed on {new Date(selectedCommit.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRevertCommit(selectedCommit.commitHash)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 rounded-full border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold"
                    title="Safely record a new revert commit"
                  >
                    Revert
                  </button>
                  <button
                    onClick={() => handleRestoreCommit(selectedCommit.commitHash)}
                    disabled={actionLoading}
                    className="studio-btn-amber px-3.5 py-1.5 text-xs font-bold shadow-sm"
                    title="Restore repository state to this snapshot"
                  >
                    Restore
                  </button>
                </div>
              </div>

              {/* Message */}
              <div className="bg-[#f8f5ee] p-3.5 rounded-2xl border border-[#ece8e1] space-y-1">
                <span className="text-[10px] text-[#7a7e85] font-bold font-mono block">COMMIT MESSAGE</span>
                <p className="font-sans font-bold text-sm text-[#1c1e21]">
                  {selectedCommit.message}
                </p>
                <div className="text-[10px] text-[#7a7e85] font-mono pt-1">
                  AUTHOR: @{selectedCommit.author?.username} ({selectedCommit.author?.displayName})
                </div>
              </div>

              {/* Lyrics Diff View */}
              {commitDetails?.lyricsDiff && commitDetails.lyricsDiff.length > 0 ? (
                <div className="space-y-2">
                  <span className="font-bold text-[#1c1e21] uppercase text-[11px] font-mono block">
                    LYRICS DIFF AGAINST PARENT COMMIT
                  </span>

                  <div className="max-h-60 overflow-y-auto border border-[#e8e4dc] rounded-2xl font-mono text-xs divide-y divide-[#ece8e1] bg-[#fbfaf8]">
                    {commitDetails.lyricsDiff.map((d, dIdx) => (
                      <div 
                        key={dIdx} 
                        className={`p-2 flex items-start space-x-2 ${
                          d.type === 'added' ? 'bg-emerald-50 text-emerald-950 font-medium' :
                          d.type === 'removed' ? 'bg-red-50 text-red-950 line-through' :
                          d.type === 'modified' ? 'bg-amber-50 text-amber-950 font-medium' :
                          'text-neutral-700'
                        }`}
                      >
                        <span className="w-4 font-bold select-none text-center">
                          {d.type === 'added' ? '+' : d.type === 'removed' ? '-' : d.type === 'modified' ? '~' : ' '}
                        </span>
                        <span className="flex-1 whitespace-pre-wrap">
                          {d.compareText !== null ? d.compareText : d.baseText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border border-[#e8e4dc] p-3 rounded-2xl bg-[#f8f6f2] text-[#7a7e85] text-xs">
                  No textual lyrics changes recorded in this commit diff.
                </div>
              )}

              {/* Track Snapshot */}
              {selectedCommit.snapshot?.tracks && selectedCommit.snapshot.tracks.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-[#1c1e21] uppercase text-[11px] font-mono block">
                    AUDIO STEMS SNAPSHOT ({selectedCommit.snapshot.tracks.length} STEMS)
                  </span>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedCommit.snapshot.tracks.map((t, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl border border-[#e8e4dc] bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Music className="w-3.5 h-3.5 text-[#a84c26]" />
                          <span className="font-bold text-[#1c1e21]">{t.trackName}</span>
                        </div>
                        <span className="bg-[#f0ede6] text-[#4a4d54] px-2 py-0.5 rounded-full text-[10px] font-mono">
                          {t.label || `Take ${t.takeNumber}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-[#e8e4dc] text-center font-sans text-xs text-[#7a7e85] shadow-soft">
              Select any commit from the left to inspect its lyrics diff, stems snapshot, or trigger a clean rollback.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
