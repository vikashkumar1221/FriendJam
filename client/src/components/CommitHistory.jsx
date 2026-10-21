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
      <div className="brutal-card bg-white p-4 border-2 border-black flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-4 h-4 text-black" />
          <span className="font-bold uppercase tracking-wider">
            VERSION LOG: {commits.length} COMMITS RECORDED
          </span>
          <span className="text-neutral-500">•</span>
          <span className="technical-badge bg-[#ede8dc]">BRANCH: {currentBranch}</span>
        </div>

        <button
          onClick={loadCommits}
          className="hover:underline font-bold"
        >
          REFRESH LOG
        </button>
      </div>

      {/* Main Commit Graph & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Chronological Commits List */}
        <div className="lg:col-span-6 space-y-3 font-mono text-xs">
          {loading ? (
            <div className="brutal-card p-8 text-center bg-white">
              [TRAVERSING COMMIT DAG...]
            </div>
          ) : commits.length === 0 ? (
            <div className="brutal-card p-8 text-center bg-white">
              No commits found on branch "{currentBranch}".
            </div>
          ) : (
            commits.map((commit, idx) => {
              const isSelected = selectedCommit?.commitHash === commit.commitHash;

              return (
                <div
                  key={commit._id || commit.commitHash}
                  onClick={() => handleInspectCommit(commit)}
                  className={`brutal-card p-4 cursor-pointer transition-all border-2 border-black ${
                    isSelected ? 'bg-[#d7ff3b]' : 'bg-white hover:bg-[#faf9f5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="bg-black text-[#d7ff3b] px-1.5 py-0.5 text-[11px] font-bold">
                        {commit.commitHash}
                      </span>
                      <span className="text-[10px] text-neutral-600">
                        @{commit.author?.username || 'vikash'}
                      </span>
                    </div>

                    <span className="text-[10px] text-neutral-500">
                      {new Date(commit.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="font-bold text-sm text-black font-sans leading-snug">
                    {commit.message}
                  </p>

                  {/* Changes badges */}
                  <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-black/20 text-[10px]">
                    {commit.changes?.lyricsChanged && (
                      <span className="bg-[#ede8dc] border border-black px-1.5 py-0.2">
                        Lyrics Diff
                      </span>
                    )}
                    {commit.changes?.addedTakes?.length > 0 && (
                      <span className="bg-orange-200 border border-black px-1.5 py-0.2">
                        +{commit.changes.addedTakes.length} Takes Added
                      </span>
                    )}
                    {commit.changes?.revertedFromCommit && (
                      <span className="bg-red-200 text-red-900 border border-black px-1.5 py-0.2 font-bold">
                        Reverts [{commit.changes.revertedFromCommit}]
                      </span>
                    )}
                    {commit.changes?.restoredFromCommit && (
                      <span className="bg-cyan-200 text-cyan-900 border border-black px-1.5 py-0.2 font-bold">
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
            <div className="brutal-card bg-white p-5 border-2 border-black space-y-4 font-mono text-xs sticky top-24">
              
              <div className="flex items-center justify-between border-b-2 border-black pb-3">
                <div>
                  <span className="font-bold uppercase tracking-wider text-black block">
                    [COMMIT INSPECTOR] {selectedCommit.commitHash}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Committed on {new Date(selectedCommit.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRevertCommit(selectedCommit.commitHash)}
                    disabled={actionLoading}
                    className="brutal-btn bg-white hover:bg-red-50 text-red-700 px-2.5 py-1 text-xs font-bold"
                    title="Safely record a new revert commit"
                  >
                    Revert
                  </button>
                  <button
                    onClick={() => handleRestoreCommit(selectedCommit.commitHash)}
                    disabled={actionLoading}
                    className="brutal-btn brutal-btn-acid px-3 py-1 text-xs font-bold"
                    title="Restore repository state to this snapshot"
                  >
                    Restore
                  </button>
                </div>
              </div>

              {/* Message */}
              <div className="bg-[#faf9f5] p-3 border border-black space-y-1">
                <span className="text-[10px] text-neutral-500 font-bold block">COMMIT MESSAGE</span>
                <p className="font-sans font-bold text-sm text-black">
                  {selectedCommit.message}
                </p>
                <div className="text-[10px] text-neutral-600 pt-1">
                  AUTHOR: @{selectedCommit.author?.username} ({selectedCommit.author?.displayName})
                </div>
              </div>

              {/* Lyrics Diff View */}
              {commitDetails?.lyricsDiff && commitDetails.lyricsDiff.length > 0 ? (
                <div className="space-y-2">
                  <span className="font-bold text-black uppercase text-[11px] block">
                    [LYRICS DIFF AGAINST PARENT COMMIT]
                  </span>

                  <div className="max-h-60 overflow-y-auto border-2 border-black font-mono text-xs divide-y divide-neutral-200">
                    {commitDetails.lyricsDiff.map((d, dIdx) => (
                      <div 
                        key={dIdx} 
                        className={`p-1.5 flex items-start space-x-2 ${
                          d.type === 'added' ? 'bg-emerald-100 text-emerald-950 font-medium' :
                          d.type === 'removed' ? 'bg-red-100 text-red-950 line-through' :
                          d.type === 'modified' ? 'bg-yellow-100 text-yellow-950 font-medium' :
                          'bg-white text-neutral-700'
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
                <div className="border border-neutral-300 p-3 bg-[#faf9f5] text-neutral-600 text-xs">
                  No textual lyrics changes recorded in this commit diff.
                </div>
              )}

              {/* Track Snapshot in this Commit */}
              {selectedCommit.snapshot?.tracks && selectedCommit.snapshot.tracks.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-black uppercase text-[11px] block">
                    [AUDIO STEMS SNAPSHOT] ({selectedCommit.snapshot.tracks.length} ACTIVE STEMS)
                  </span>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedCommit.snapshot.tracks.map((t, idx) => (
                      <div key={idx} className="p-2 border border-black bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <Music className="w-3.5 h-3.5 text-black" />
                          <span className="font-bold">{t.trackName}</span>
                        </div>
                        <span className="bg-[#ede8dc] px-1.5 py-0.5 border border-black text-[10px]">
                          {t.label || `Take ${t.takeNumber}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="brutal-card p-12 text-center bg-white font-mono text-xs text-neutral-500">
              Select any commit from the left column to inspect its lyrics diff, stems snapshot, or trigger a clean rollback.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
