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
  Check,
  ChevronRight
} from 'lucide-react';

export const PullRequestWorkspace = ({ repo, currentBranch, userRole }) => {
  const { user } = useAuth();
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePR, setActivePR] = useState(null);
  const [prDetails, setPrDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('open');

  const [showNewPRModal, setShowNewPRModal] = useState(false);
  const [branches, setBranches] = useState([]);
  const [newPRData, setNewPRData] = useState({
    title: '',
    description: '',
    sourceBranch: '',
    targetBranch: repo.defaultBranch || 'main'
  });
  const [submittingPR, setSubmittingPR] = useState(false);

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
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e8e4dc] shadow-soft flex flex-wrap items-center justify-between gap-4">
        
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 text-xs font-sans">
          {['open', 'merged', 'closed', 'all'].map(st => (
            <button
              key={st}
              onClick={() => { setFilterStatus(st); setActivePR(null); }}
              className={`px-3.5 py-1.5 rounded-full uppercase font-medium transition-all ${
                filterStatus === st 
                  ? 'bg-[#1c1e21] text-white shadow-sm' 
                  : 'bg-[#f5f2ec] text-[#555962] hover:bg-[#ede8dc]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNewPRModal(true)}
          className="studio-btn-amber px-4 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New Pull Request</span>
        </button>

      </div>

      {/* Main PR List / Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: PR List */}
        <div className="lg:col-span-5 space-y-3 text-xs">
          {loading ? (
            <div className="bg-white p-8 rounded-3xl border border-[#e8e4dc] text-center text-[#7a7e85] font-mono">
              [SCANNING PULL REQUESTS...]
            </div>
          ) : prs.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#e8e4dc] text-center space-y-2 shadow-soft">
              <GitPullRequest className="w-6 h-6 mx-auto text-[#a84c26]" />
              <p className="font-bold text-sm text-[#1c1e21]">No {filterStatus} pull requests found.</p>
              <p className="text-[#7a7e85] text-xs">
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
                  className={`p-4 rounded-2xl cursor-pointer transition-all border space-y-2 shadow-sm ${
                    isSelected 
                      ? 'bg-[#fff7ed] border-[#fed7aa] shadow-md ring-2 ring-[#a84c26]/20' 
                      : 'bg-white border-[#e8e4dc] hover:border-[#a84c26]/40 hover:bg-[#fbfaf8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1c1e21] font-mono">
                      #{pr.prNumber}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      pr.status === 'open' ? 'bg-[#f0f9f4] text-[#059669]' :
                      pr.status === 'merged' ? 'bg-[#faf5ff] text-[#7c3aed]' : 'bg-[#f0ede6] text-[#555962]'
                    }`}>
                      {pr.status}
                    </span>
                  </div>

                  <h4 className="font-sans font-bold text-base text-[#1c1e21] leading-snug">
                    {pr.title}
                  </h4>

                  <div className="flex items-center space-x-1.5 text-xs text-[#7a7e85] font-mono">
                    <span className="bg-[#f0ede6] px-2 py-0.5 rounded-md font-semibold text-[#1c1e21]">
                      {pr.sourceBranch}
                    </span>
                    <span>→</span>
                    <span className="bg-[#f0ede6] px-2 py-0.5 rounded-md font-semibold text-[#1c1e21]">
                      {pr.targetBranch}
                    </span>
                  </div>

                  {hasConflicts && (
                    <div className="bg-red-50 border border-red-200 p-1.5 rounded-xl text-red-800 font-bold text-[10px] flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Has Unresolved Conflicts</span>
                    </div>
                  )}

                  <div className="text-[10px] text-[#8c9099] pt-1 border-t border-[#ece8e1] flex justify-between font-mono">
                    <span>Opened by @{pr.author?.username}</span>
                    <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Pull Request Detail */}
        <div className="lg:col-span-7">
          {activePR ? (
            <div className="bg-white p-6 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-5 text-xs font-sans">
              
              {/* PR Header */}
              <div className="border-b border-[#ece8e1] pb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="bg-[#1c1e21] text-[#f5be57] font-bold px-2.5 py-0.5 rounded-md text-xs">
                      PR #{activePR.prNumber}
                    </span>
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                      activePR.status === 'open' ? 'bg-[#f0f9f4] text-[#059669]' :
                      activePR.status === 'merged' ? 'bg-[#faf5ff] text-[#7c3aed]' : 'bg-[#f0ede6] text-[#555962]'
                    }`}>
                      {activePR.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#8c9099] font-mono">
                    {new Date(activePR.createdAt).toLocaleString()}
                  </div>
                </div>

                <h3 className="font-sans font-bold text-2xl text-[#1c1e21]">
                  {activePR.title}
                </h3>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <span className="text-[#7a7e85]">Merge</span>
                  <span className="bg-[#f0ede6] px-2 py-0.5 rounded-md font-semibold text-[#1c1e21]">
                    {activePR.sourceBranch}
                  </span>
                  <span>into</span>
                  <span className="bg-[#f0ede6] px-2 py-0.5 rounded-md font-semibold text-[#1c1e21]">
                    {activePR.targetBranch}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#f8f5ee] p-4 rounded-2xl border border-[#ece8e1] space-y-1">
                <span className="font-bold text-[10px] text-[#7a7e85] uppercase font-mono block">
                  PROPOSED CHANGES & NOTES
                </span>
                <p className="text-sm text-[#3a3d44] leading-relaxed">
                  {activePR.description || 'No detailed description provided.'}
                </p>
                <div className="text-[10px] text-[#7a7e85] font-mono pt-1">
                  SUBMITTED BY: @{activePR.author?.username} ({activePR.author?.displayName})
                </div>
              </div>

              {/* Diff Inspection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-bold border-b border-[#ece8e1] pb-1.5 font-mono">
                  <span className="text-xs text-[#1c1e21]">DIFF & IMPACT ANALYSIS</span>
                  <div className="flex items-center space-x-2 text-[10px]">
                    {prDetails?.diffSummary?.hasConflicts ? (
                      <span className="bg-red-100 text-red-800 border border-red-300 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Conflict Detected</span>
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Able to Merge Cleanly</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Lyrics Diff */}
                {prDetails?.lyricsDiff && prDetails.lyricsDiff.length > 0 ? (
                  <div className="space-y-1">
                    <span className="font-bold text-[10px] text-[#7a7e85] font-mono">LYRICS DIFF:</span>
                    <div className="max-h-48 overflow-y-auto border border-[#e8e4dc] rounded-2xl font-mono text-[11px] divide-y divide-[#ece8e1] bg-[#fbfaf8]">
                      {prDetails.lyricsDiff.map((d, dIdx) => (
                        <div 
                          key={dIdx} 
                          className={`p-2 flex items-start space-x-2 ${
                            d.type === 'added' ? 'bg-emerald-50 text-emerald-950 font-medium' :
                            d.type === 'removed' ? 'bg-red-50 text-red-950 line-through' :
                            d.type === 'modified' ? 'bg-amber-50 text-amber-950 font-medium' :
                            'text-neutral-700'
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
                  <div className="p-3 border border-[#e8e4dc] rounded-2xl bg-[#f8f6f2] text-[#7a7e85] text-xs">
                    No textual lyrics changes detected between these branches.
                  </div>
                )}

                {/* Audio Stems Diff */}
                {prDetails?.trackComparison && (
                  <div className="space-y-1 pt-1">
                    <span className="font-bold text-[10px] text-[#7a7e85] font-mono">AUDIO STEMS DELTA:</span>
                    <div className="border border-[#e8e4dc] rounded-2xl p-3 bg-white space-y-1 text-xs">
                      {prDetails.trackComparison.addedTracks?.length > 0 && (
                        <div>
                          <span className="text-[#059669] font-bold">+ New Tracks: </span>
                          {prDetails.trackComparison.addedTracks.map(t => t.trackName).join(', ')}
                        </div>
                      )}
                      {prDetails.trackComparison.modifiedTracks?.length > 0 && (
                        <div>
                          <span className="text-[#2563eb] font-bold">~ Modified Takes: </span>
                          {prDetails.trackComparison.modifiedTracks.map(t => `${t.trackName} (${t.sourceTakesCount} takes)`).join(', ')}
                        </div>
                      )}
                      {prDetails.trackComparison.addedTracks?.length === 0 && prDetails.trackComparison.modifiedTracks?.length === 0 && (
                        <div className="text-[#7a7e85]">Audio track configurations match.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Review Submissions */}
              <div className="border-t border-[#ece8e1] pt-3.5 space-y-3">
                <span className="font-bold uppercase tracking-wider block font-mono text-xs text-[#1c1e21]">
                  COLLABORATOR REVIEWS ({activePR.reviewers?.length || 0})
                </span>

                <div className="space-y-2">
                  {activePR.reviewers?.length === 0 ? (
                    <div className="text-[#7a7e85] text-xs">
                      No reviews submitted yet. Maintainers and reviewers can approve or request changes below.
                    </div>
                  ) : (
                    activePR.reviewers.map((r, idx) => (
                      <div key={idx} className="p-3 rounded-2xl border border-[#e8e4dc] bg-[#f8f6f2] flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          {r.status === 'approved' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <span className="font-bold text-[#1c1e21]">@{r.user?.username}</span>
                          <span className="text-[#7a7e85]">({r.status.replace('_', ' ')})</span>
                        </div>
                        {r.note && <span className="italic text-[#7a7e85] text-[11px]">"{r.note}"</span>}
                      </div>
                    ))
                  )}
                </div>

                {/* Review Form */}
                {activePR.status === 'open' && (
                  <div className="bg-[#f8f5ee] p-3.5 rounded-2xl border border-[#ece8e1] space-y-2.5">
                    <span className="font-bold block text-xs text-[#1c1e21]">SUBMIT PEER REVIEW:</span>
                    <input
                      type="text"
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      placeholder="Feedback note (e.g. Harmonies sound balanced, timing is tight)"
                      className="studio-input text-xs w-full"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubmitReview('approved')}
                        disabled={actionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                      >
                        ✓ Approve Changes
                      </button>
                      <button
                        onClick={() => handleSubmitReview('changes_requested')}
                        disabled={actionLoading}
                        className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm"
                      >
                        Request Revision
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Merge Actions */}
              {activePR.status === 'open' && (
                <div className="border-t border-[#ece8e1] pt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-[#7a7e85] font-mono">
                    Target: <strong>{activePR.targetBranch}</strong>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleClosePR}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-full border border-[#e2ded5] text-[#555962] hover:bg-[#ede8dc] text-xs font-semibold"
                    >
                      Close PR
                    </button>

                    <button
                      onClick={handleMergePR}
                      disabled={actionLoading || prDetails?.diffSummary?.hasConflicts}
                      className="studio-btn-amber px-5 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-copper"
                    >
                      <GitMerge className="w-4 h-4" />
                      <span>Confirm Merge into {activePR.targetBranch}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Discussion Thread */}
              <div className="border-t border-[#ece8e1] pt-3.5 space-y-3">
                <span className="font-bold uppercase tracking-wider block font-mono text-xs text-[#1c1e21]">
                  DISCUSSION THREAD ({prComments.length})
                </span>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {prComments.map(c => (
                    <div key={c._id} className="p-2.5 rounded-2xl border border-[#e8e4dc] bg-[#fbfaf8] text-xs">
                      <div className="font-bold text-[#1c1e21] flex justify-between">
                        <span>@{c.author?.username}</span>
                        <span className="text-[10px] text-[#8c9099] font-mono">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[#4b4f57] mt-1">{c.content}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handlePostPRComment} className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Leave comment on this PR..."
                    className="studio-input text-xs flex-1"
                  />
                  <button
                    type="submit"
                    className="studio-btn-primary px-4 py-1.5 text-xs font-bold"
                  >
                    Reply
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-[#e8e4dc] text-center font-sans text-xs text-[#7a7e85] shadow-soft">
              Select any pull request on the left to review stems delta, check lyrics conflict status, approve changes, or merge into main.
            </div>
          )}
        </div>

      </div>

      {/* New PR Modal */}
      {showNewPRModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                CREATE PULL REQUEST
              </span>
              <button 
                onClick={() => setShowNewPRModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePR} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">SOURCE (HEAD)</label>
                  <select
                    value={newPRData.sourceBranch}
                    onChange={e => setNewPRData({ ...newPRData, sourceBranch: e.target.value })}
                    className="studio-input w-full bg-white font-mono"
                  >
                    {branches.map(b => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">TARGET (BASE)</label>
                  <select
                    value={newPRData.targetBranch}
                    onChange={e => setNewPRData({ ...newPRData, targetBranch: e.target.value })}
                    className="studio-input w-full bg-white font-mono"
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
                  className="studio-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">DESCRIPTION</label>
                <textarea
                  rows={3}
                  value={newPRData.description}
                  onChange={e => setNewPRData({ ...newPRData, description: e.target.value })}
                  placeholder="Explain what was recorded or edited..."
                  className="studio-input w-full"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingPR}
                  className="studio-btn-amber w-full py-2.5 font-bold shadow-copper text-sm"
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
