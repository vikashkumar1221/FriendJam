import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  GitPullRequest, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  MessageSquare, 
  GitMerge, 
  Plus, 
  ArrowRight, 
  FileText, 
  Music,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';

export const PullRequestWorkspace = ({ repo, currentBranch, userRole }) => {
  const { user } = useAuth();
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePR, setActivePR] = useState(null);
  const [prDetails, setPrDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('open'); // 'open', 'merged', 'closed', 'all'

  // New PR Modal
  const [showNewPRModal, setShowNewPRModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [newPRData, setNewPRData] = useState({
    title: '',
    description: '',
    sourceBranch: '',
    targetBranch: repo.defaultBranch || 'main'
  });
  const [submittingPR, setSubmittingPR] = useState(false);

  // Review & Comments
  const [reviewNote, setReviewNote] = useState('');
  const [prComments, setPrComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPullRequests();
    loadBranches();
  }, [repo._id, filterStatus]);

  const loadPullRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getPullRequests(repo._id, filterStatus);
      setPrs(data.pullRequests || []);
    } catch (err) {
      console.error('Failed to load PRs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const data = await api.getBranches(repo._id);
      setBranches(data.branches || []);
      if (data.branches?.length > 1) {
        const nonMain = data.branches.find(b => b.name !== (repo.defaultBranch || 'main'));
        if (nonMain) {
          setNewPRData(prev => ({ ...prev, sourceBranch: nonMain.name }));
        }
      }
    } catch {
      // ignore
    }
  };

  const openPRDetails = async (pr) => {
    setActivePR(pr);
    setDetailsLoading(true);
    try {
      const data = await api.getPullRequest(repo._id, pr.prNumber);
      setPrDetails(data);
      const commentsData = await api.getComments(repo._id, {
        resourceType: 'pull_request',
        resourceId: String(pr.prNumber)
      });
      setPrComments(commentsData.comments || []);
    } catch (err) {
      alert('Failed to load pull request: ' + err.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCreatePR = async (e) => {
    e.preventDefault();
    if (!newPRData.title.trim() || !newPRData.sourceBranch) return;
    setSubmittingPR(true);

    try {
      const res = await api.createPullRequest(repo._id, newPRData);
      setShowNewPRModal(false);
      setNewPRData({
        title: '',
        description: '',
        sourceBranch: '',
        targetBranch: repo.defaultBranch || 'main'
      });
      await loadPullRequests();
      openPRDetails(res.pullRequest);
    } catch (err) {
      alert('Failed to open pull request: ' + err.message);
    } finally {
      setSubmittingPR(false);
    }
  };

  const handleSubmitReview = async (status) => {
    if (!activePR) return;
    setActionLoading(true);

    try {
      const res = await api.submitReview(repo._id, activePR.prNumber, status, reviewNote);
      alert(res.message);
      setReviewNote('');
      openPRDetails(res.pullRequest);
    } catch (err) {
      alert('Review submission failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMergePR = async () => {
    if (!activePR) return;
    if (!confirm(`Merge PR #${activePR.prNumber} into ${activePR.targetBranch}? This will combine stems & lyrics into ${activePR.targetBranch}.`)) return;

    setActionLoading(true);
    try {
      const res = await api.mergePullRequest(repo._id, activePR.prNumber);
      alert(res.message);
      await loadPullRequests();
      openPRDetails(res.pullRequest);
    } catch (err) {
      alert('Merge failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClosePR = async () => {
    if (!activePR) return;
    if (!confirm(`Close PR #${activePR.prNumber} without merging?`)) return;

    setActionLoading(true);
    try {
      const res = await api.closePullRequest(repo._id, activePR.prNumber);
      alert(res.message);
      await loadPullRequests();
      openPRDetails(res.pullRequest);
    } catch (err) {
      alert('Close failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostPRComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activePR) return;

    try {
      const res = await api.postComment(repo._id, {
        resourceType: 'pull_request',
        resourceId: String(activePR.prNumber),
        content: newComment.trim()
      });
      setPrComments(prev => [...prev, res.comment]);
      setNewComment('');
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="brutal-card bg-white p-4 border-2 border-black flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Filters */}
        <div className="flex items-center space-x-1 font-mono text-xs font-bold">
          {['open', 'merged', 'closed', 'all'].map(st => (
            <button
              key={st}
              onClick={() => { setFilterStatus(st); setActivePR(null); }}
              className={`px-3 py-1.5 border border-black uppercase ${
                filterStatus === st ? 'bg-black text-[#d7ff3b]' : 'bg-[#faf9f5] hover:bg-[#ede8dc]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNewPRModal(true)}
          className="brutal-btn brutal-btn-acid px-4 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-brutal-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Pull Request</span>
        </button>

      </div>

      {/* Main PR List / Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: PR List */}
        <div className="lg:col-span-5 space-y-3 font-mono text-xs">
          {loading ? (
            <div className="brutal-card p-8 text-center bg-white">
              [SCANNING PULL REQUEST REPOSITORY...]
            </div>
          ) : prs.length === 0 ? (
            <div className="brutal-card p-8 text-center bg-white space-y-2">
              <GitPullRequest className="w-6 h-6 mx-auto text-neutral-400" />
              <p className="font-bold text-sm">No {filterStatus} pull requests found.</p>
              <p className="text-neutral-500 text-[11px]">
                Open a new PR to propose merging lyrics or audio takes from a branch into main.
              </p>
            </div>
          ) : (
            prs.map(pr => {
              const isSelected = activePR?.prNumber === pr.prNumber;
              const hasConflicts = pr.diffSummary?.hasConflicts;

              return (
                <div
                  key={pr._id}
                  onClick={() => openPRDetails(pr)}
                  className={`brutal-card p-4 cursor-pointer transition-all border-2 border-black space-y-2 ${
                    isSelected ? 'bg-[#d7ff3b]' : 'bg-white hover:bg-[#faf9f5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black">
                      #{pr.prNumber}
                    </span>
                    <span className={`technical-badge uppercase text-[10px] ${
                      pr.status === 'open' ? 'bg-emerald-300' :
                      pr.status === 'merged' ? 'bg-purple-300 text-purple-950' : 'bg-neutral-300'
                    }`}>
                      {pr.status}
                    </span>
                  </div>

                  <h4 className="font-sans font-bold text-base text-black leading-snug">
                    {pr.title}
                  </h4>

                  <div className="flex items-center space-x-1.5 text-[11px] text-neutral-600">
                    <span className="bg-[#ede8dc] border border-black px-1.5 py-0.2 font-bold text-black">
                      {pr.sourceBranch}
                    </span>
                    <span>→</span>
                    <span className="bg-[#ede8dc] border border-black px-1.5 py-0.2 font-bold text-black">
                      {pr.targetBranch}
                    </span>
                  </div>

                  {hasConflicts && (
                    <div className="bg-red-100 border border-red-500 p-1 text-red-800 font-bold text-[10px] flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Has Unresolved Conflicts</span>
                    </div>
                  )}

                  <div className="text-[10px] text-neutral-500 pt-1 border-t border-black/10 flex justify-between">
                    <span>Opened by @{pr.author?.username}</span>
                    <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Pull Request Detail Inspection */}
        <div className="lg:col-span-7">
          {activePR ? (
            <div className="brutal-card bg-white p-5 border-2 border-black space-y-5 font-mono text-xs">
              
              {/* PR Header */}
              <div className="border-b-2 border-black pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="bg-black text-[#d7ff3b] font-bold px-2 py-0.5 text-sm">
                      PR #{activePR.prNumber}
                    </span>
                    <span className={`technical-badge uppercase font-bold text-xs ${
                      activePR.status === 'open' ? 'bg-emerald-300' :
                      activePR.status === 'merged' ? 'bg-purple-300' : 'bg-neutral-300'
                    }`}>
                      {activePR.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-500">
                    {new Date(activePR.createdAt).toLocaleString()}
                  </div>
                </div>

                <h3 className="font-sans font-bold text-2xl text-black">
                  {activePR.title}
                </h3>

                <div className="flex items-center space-x-2 text-xs">
                  <span>Proposing merge from</span>
                  <span className="bg-[#ede8dc] px-2 py-0.5 border border-black font-bold">
                    {activePR.sourceBranch}
                  </span>
                  <span>into</span>
                  <span className="bg-[#ede8dc] px-2 py-0.5 border border-black font-bold">
                    {activePR.targetBranch}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#faf9f5] p-3 border border-black space-y-1">
                <span className="font-bold text-[10px] text-neutral-500 uppercase block">
                  PROPOSED CHANGES & NOTES
                </span>
                <p className="font-sans text-sm text-neutral-800 leading-relaxed">
                  {activePR.description || 'No detailed description provided.'}
                </p>
                <div className="text-[10px] text-neutral-600 pt-1">
                  SUBMITTED BY: @{activePR.author?.username} ({activePR.author?.displayName})
                </div>
              </div>

              {/* Diff Inspection Tabs: Lyrics & Stems */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-bold border-b-2 border-black pb-1">
                  <span>[DIFF & IMPACT ANALYSIS]</span>
                  <div className="flex items-center space-x-2 text-[10px]">
                    {prDetails?.diffSummary?.hasConflicts ? (
                      <span className="bg-red-200 text-red-900 border border-red-600 px-1.5 py-0.5 font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Conflict Detected</span>
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-600 px-1.5 py-0.5 font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Able to Merge Cleanly</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Lyrics Diff */}
                {prDetails?.lyricsDiff && prDetails.lyricsDiff.length > 0 ? (
                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-neutral-600">LYRICS DIFF:</span>
                    <div className="max-h-48 overflow-y-auto border border-black font-mono text-[11px] divide-y divide-neutral-200">
                      {prDetails.lyricsDiff.map((d, dIdx) => (
                        <div 
                          key={dIdx} 
                          className={`p-1 flex items-start space-x-2 ${
                            d.type === 'added' ? 'bg-emerald-100 text-emerald-950 font-medium' :
                            d.type === 'removed' ? 'bg-red-100 text-red-950 line-through' :
                            d.type === 'modified' ? 'bg-yellow-100 text-yellow-950 font-medium' :
                            'bg-white text-neutral-700'
                          }`}
                        >
                          <span className="w-4 text-center font-bold">
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
                  <div className="p-2 border border-neutral-300 bg-[#faf9f5] text-neutral-600 text-[11px]">
                    No textual lyrics changes detected between these branches.
                  </div>
                )}

                {/* Audio Stems Diff */}
                {prDetails?.trackComparison && (
                  <div className="space-y-1 pt-1">
                    <span className="font-bold text-[10px] text-neutral-600">AUDIO STEMS DELTA:</span>
                    <div className="border border-black p-2 bg-white space-y-1 text-[11px]">
                      {prDetails.trackComparison.addedTracks?.length > 0 && (
                        <div>
                          <span className="text-emerald-700 font-bold">+ New Tracks: </span>
                          {prDetails.trackComparison.addedTracks.map(t => t.trackName).join(', ')}
                        </div>
                      )}
                      {prDetails.trackComparison.modifiedTracks?.length > 0 && (
                        <div>
                          <span className="text-blue-700 font-bold">~ Modified Takes: </span>
                          {prDetails.trackComparison.modifiedTracks.map(t => `${t.trackName} (${t.sourceTakesCount} takes)`).join(', ')}
                        </div>
                      )}
                      {prDetails.trackComparison.addedTracks?.length === 0 && prDetails.trackComparison.modifiedTracks?.length === 0 && (
                        <div className="text-neutral-500">Audio track configurations match.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Review Submissions & Status */}
              <div className="border-t-2 border-black pt-3 space-y-3">
                <span className="font-bold uppercase tracking-wider block">
                  [COLLABORATOR REVIEWS] ({activePR.reviewers?.length || 0})
                </span>

                <div className="space-y-1.5">
                  {activePR.reviewers?.length === 0 ? (
                    <div className="text-neutral-500 text-[11px]">
                      No reviews submitted yet. Maintainers and reviewers can approve or request changes below.
                    </div>
                  ) : (
                    activePR.reviewers.map((r, idx) => (
                      <div key={idx} className="p-2 border border-black bg-[#faf9f5] flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {r.status === 'approved' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-bold">@{r.user?.username}</span>
                          <span className="text-neutral-600">({r.status.replace('_', ' ')})</span>
                        </div>
                        {r.note && <span className="italic text-neutral-500 text-[11px]">"{r.note}"</span>}
                      </div>
                    ))
                  )}
                </div>

                {/* Review Form if open */}
                {activePR.status === 'open' && (
                  <div className="bg-[#ede8dc] p-3 border border-black space-y-2">
                    <span className="font-bold block text-[11px]">SUBMIT PEER REVIEW:</span>
                    <input
                      type="text"
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      placeholder="Feedback note (e.g. Harmonies sound balanced, timing is tight)"
                      className="brutal-input text-xs w-full py-1.5"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubmitReview('approved')}
                        disabled={actionLoading}
                        className="brutal-btn bg-emerald-400 hover:bg-emerald-300 text-black px-3 py-1 text-xs font-bold"
                      >
                        ✓ Approve Changes
                      </button>
                      <button
                        onClick={() => handleSubmitReview('changes_requested')}
                        disabled={actionLoading}
                        className="brutal-btn bg-red-400 hover:bg-red-300 text-black px-3 py-1 text-xs font-bold"
                      >
                        Request Revision
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Merge Actions */}
              {activePR.status === 'open' && (
                <div className="border-t-2 border-black pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-neutral-600">
                    Target branch: <strong>{activePR.targetBranch}</strong>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleClosePR}
                      disabled={actionLoading}
                      className="brutal-btn bg-white hover:bg-neutral-100 px-3 py-2 text-xs font-bold"
                    >
                      Close PR
                    </button>

                    <button
                      onClick={handleMergePR}
                      disabled={actionLoading || prDetails?.diffSummary?.hasConflicts}
                      className="brutal-btn brutal-btn-acid px-5 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-brutal-sm"
                    >
                      <GitMerge className="w-4 h-4" />
                      <span>Confirm Merge into {activePR.targetBranch}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Discussion Thread */}
              <div className="border-t-2 border-black pt-3 space-y-3">
                <span className="font-bold uppercase tracking-wider block">
                  [DISCUSSION THREAD] ({prComments.length})
                </span>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {prComments.map(c => (
                    <div key={c._id} className="p-2 border border-black bg-[#faf9f5] text-xs">
                      <div className="font-bold flex justify-between">
                        <span>@{c.author?.username}</span>
                        <span className="text-[10px] text-neutral-400">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-neutral-700 mt-1">{c.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostPRComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Leave comment on this PR..."
                    className="brutal-input text-xs flex-1 py-1.5"
                  />
                  <button
                    type="submit"
                    className="brutal-btn brutal-btn-acid px-3 py-1.5 text-xs font-bold"
                  >
                    Reply
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="brutal-card p-12 text-center bg-white font-mono text-xs text-neutral-500">
              Select any pull request on the left to review stems delta, check lyrics conflict status, approve changes, or merge into main.
            </div>
          )}
        </div>

      </div>

      {/* New PR Modal */}
      {showNewPRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-md w-full p-6 border-2 border-black space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase tracking-wider text-black">
                [PROPOSAL] CREATE PULL REQUEST
              </span>
              <button 
                onClick={() => setShowNewPRModal(false)}
                className="font-bold hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">SOURCE BRANCH (HEAD)</label>
                  <select
                    value={newPRData.sourceBranch}
                    onChange={e => setNewPRData({ ...newPRData, sourceBranch: e.target.value })}
                    className="brutal-input w-full bg-white font-mono"
                  >
                    {branches.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">TARGET BRANCH (BASE)</label>
                  <select
                    value={newPRData.targetBranch}
                    onChange={e => setNewPRData({ ...newPRData, targetBranch: e.target.value })}
                    className="brutal-input w-full bg-white font-mono"
                  >
                    {branches.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">PULL REQUEST TITLE *</label>
                <input
                  type="text"
                  required
                  value={newPRData.title}
                  onChange={e => setNewPRData({ ...newPRData, title: e.target.value })}
                  placeholder="e.g. Add backing vocal harmonies to Chorus"
                  className="brutal-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">DESCRIPTION & MOTIVATION</label>
                <textarea
                  rows={3}
                  value={newPRData.description}
                  onChange={e => setNewPRData({ ...newPRData, description: e.target.value })}
                  placeholder="Explain what was recorded or edited..."
                  className="brutal-input w-full"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingPR}
                  className="brutal-btn brutal-btn-acid w-full py-2.5 font-bold shadow-brutal text-sm"
                >
                  {submittingPR ? 'COMPUTING DIFF & OPENING...' : 'OPEN PULL REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
