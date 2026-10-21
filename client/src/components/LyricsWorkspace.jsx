import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Save, 
  GitCommit, 
  History, 
  MessageSquare, 
  AlertTriangle, 
  Check, 
  Clock, 
  User, 
  Plus, 
  Columns, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const LyricsWorkspace = ({ repo, currentBranch, userRole }) => {
  const { user } = useAuth();
  const [lyrics, setLyrics] = useState(null);
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('ALL SAVED');
  const [lastSavedTime, setLastSavedTime] = useState(null);
  
  // Commit modal
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [committing, setCommitting] = useState(false);

  // Line comments drawer
  const [comments, setComments] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [commentInput, setCommentInput] = useState('');

  // Conflict Resolution state
  const [conflictData, setConflictData] = useState(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [manualResolutionText, setManualResolutionText] = useState('');

  const debounceTimer = useRef(null);

  useEffect(() => {
    loadLyrics();
    loadComments();
  }, [repo._id, currentBranch]);

  const loadLyrics = async () => {
    setLoading(true);
    try {
      const data = await api.getLyrics(repo._id, currentBranch);
      setLyrics(data.lyrics);
      const text = data.lyrics?.draft?.rawText || data.lyrics?.rawText || '';
      setRawText(text);
      setLastSavedTime(data.lyrics?.draft?.lastSavedAt || null);
      setSaveStatus('ALL SAVED');
    } catch (err) {
      console.error('Failed to load lyrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(repo._id, { resourceType: 'lyrics_line' });
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to load line comments:', err);
    }
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setRawText(newText);
    setSaveStatus('UNSAVED CHANGES');

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setSaveStatus('SAVING...');
      try {
        const result = await api.autosaveDraft(repo._id, currentBranch, newText, lyrics?.version);
        if (result.isConflict) {
          setSaveStatus('CONFLICT DETECTED');
          setConflictData(result.data);
          setManualResolutionText(result.data.mergedPreview || newText);
          setShowConflictModal(true);
        } else {
          setSaveStatus('ALL SAVED');
          setLastSavedTime(new Date());
        }
      } catch (err) {
        setSaveStatus('AUTOSAVE PAUSED');
      }
    }, 1200);
  };

  const handleCommitLyrics = async (e) => {
    e.preventDefault();
    if (!commitMessage.trim()) return;
    setCommitting(true);

    try {
      await api.commitLyrics(repo._id, currentBranch, commitMessage.trim(), rawText);
      setShowCommitModal(false);
      setCommitMessage('');
      await loadLyrics();
      alert('Lyrics committed to branch history successfully!');
    } catch (err) {
      alert('Commit failed: ' + err.message);
    } finally {
      setCommitting(false);
    }
  };

  const handleResolveConflict = async () => {
    try {
      await api.resolveLyricsConflict(
        repo._id, 
        currentBranch, 
        manualResolutionText, 
        `Resolve lyrics edit conflict between collaborators`
      );
      setShowConflictModal(false);
      setConflictData(null);
      await loadLyrics();
      alert('Conflict resolved and committed safely to history!');
    } catch (err) {
      alert('Failed to resolve: ' + err.message);
    }
  };

  const insertSectionTag = (tag) => {
    const insertion = `\n\n[${tag}]\n`;
    setRawText(prev => prev + insertion);
    setSaveStatus('UNSAVED CHANGES');
  };

  const handlePostLineComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedLineId) return;

    try {
      const res = await api.postComment(repo._id, {
        resourceType: 'lyrics_line',
        lineId: selectedLineId,
        content: commentInput.trim()
      });
      setComments(prev => [...prev, res.comment]);
      setCommentInput('');
    } catch (err) {
      alert('Failed to post line comment: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#e8e4dc] shadow-soft flex flex-wrap items-center justify-between gap-4">
        
        {/* Save Status & Branch */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              saveStatus === 'ALL SAVED' ? 'bg-[#059669]' :
              saveStatus === 'SAVING...' ? 'bg-[#e5a83b] animate-spin' :
              saveStatus === 'CONFLICT DETECTED' ? 'bg-red-500 animate-pulse' : 'bg-[#ea580c]'
            }`}></span>
            <span className="font-semibold text-[#1c1e21]">{saveStatus}</span>
          </div>

          {lastSavedTime && (
            <span className="text-[#8c9099] text-[11px] font-mono hidden sm:inline">
              (Draft rev #{lyrics?.version || 1} at {new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          )}

          <span className="bg-[#f0ede6] text-[#4b4f57] px-2.5 py-0.5 rounded-full font-mono text-[11px]">
            BRANCH: {currentBranch}
          </span>
        </div>

        {/* Quick Section Inserts & Commit Button */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#8c9099] text-[11px] font-mono hidden lg:inline">INSERT:</span>
          {['Intro', 'Verse 1', 'Chorus', 'Bridge', 'Outro'].map(sec => (
            <button
              key={sec}
              onClick={() => insertSectionTag(sec)}
              className="bg-[#f5f2ec] hover:bg-[#ede8dc] text-[#3a3d44] px-2.5 py-1 rounded-full font-medium text-[11px] transition-colors"
            >
              + [{sec}]
            </button>
          ))}

          <button
            onClick={() => {
              setCommitMessage(`Update lyrics for ${currentBranch}`);
              setShowCommitModal(true);
            }}
            className="studio-btn-amber px-4 py-2 font-bold flex items-center space-x-1.5 ml-2 shadow-sm"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit Lyrics</span>
          </button>
        </div>

      </div>

      {/* Editor & Section Map Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Textarea Editor */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3 text-xs">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                LYRICS REVISION STACK
              </span>
              <span className="text-[11px] text-[#8c9099]">
                Use [Section] headers for structure
              </span>
            </div>

            <textarea
              rows={18}
              value={rawText}
              onChange={handleTextChange}
              placeholder="Write song lyrics here. For example:&#10;&#10;[Intro]&#10;Gentle guitar strums...&#10;&#10;[Verse 1]&#10;Khidki pe bachi hai dhoop thodi si...&#10;&#10;[Chorus]&#10;Adhoori kahani, adhoore se hum..."
              className="w-full font-mono text-sm leading-relaxed border border-[#e4dfd6] rounded-2xl p-4 bg-[#fbfaf8] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#a84c26]/20 resize-y min-h-[420px] text-[#1c1e21]"
            />

            <div className="flex justify-between items-center text-[10px] font-mono text-[#8c9099] pt-1">
              <span>LINES: {rawText.split('\n').length}</span>
              <span>CHARACTERS: {rawText.length}</span>
              <span>AUTOSAVES PER STROKE</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Contributor Attribution & Line Comments */}
        <div className="lg:col-span-4 space-y-5">
          
          <div className="bg-white p-5 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-3 text-xs">
            <div className="border-b border-[#ece8e1] pb-2 font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
              SECTIONS & ATTRIBUTIONS
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto">
              {lyrics?.sections && lyrics.sections.length > 0 ? (
                lyrics.sections.map(sec => (
                  <div key={sec.sectionId} className="border border-[#e8e4dc] rounded-2xl p-3 bg-[#f8f6f2]">
                    <div className="flex items-center justify-between font-bold text-[#1c1e21] border-b border-[#ece8e1] pb-1.5 mb-1.5">
                      <span>[{sec.label}]</span>
                      <span className="text-[10px] text-[#8c9099] font-mono">{sec.lines?.length || 0} lines</span>
                    </div>

                    <div className="space-y-1">
                      {(sec.lines || []).slice(0, 3).map((l, lIdx) => (
                        <div 
                          key={l.lineId || lIdx}
                          onClick={() => setSelectedLineId(l.lineId)}
                          className={`p-1.5 rounded-lg text-[11px] truncate cursor-pointer transition-colors ${
                            selectedLineId === l.lineId 
                              ? 'bg-[#fff7ed] text-[#9a3412] font-semibold border border-[#fed7aa]' 
                              : 'hover:bg-[#ede8dc] text-[#4b4f57]'
                          }`}
                        >
                          <span className="text-[#a0a4ad] mr-1.5 font-mono">L{lIdx + 1}:</span>
                          <span>{l.text || '(empty line)'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[#7a7e85] text-xs italic">
                  Sections will populate automatically from your [Header] tags.
                </div>
              )}
            </div>
          </div>

          {/* Line Comments Drawer */}
          <div className="bg-white p-5 rounded-3xl border border-[#e8e4dc] shadow-soft space-y-3 text-xs">
            <div className="border-b border-[#ece8e1] pb-2 font-bold uppercase tracking-wider text-[#1c1e21] font-mono flex items-center justify-between">
              <span>LINE CRITIQUE</span>
              <MessageSquare className="w-4 h-4 text-[#a84c26]" />
            </div>

            {selectedLineId ? (
              <div className="space-y-3">
                <div className="text-[11px] bg-[#f5f2ec] p-2 rounded-xl text-[#4a4d54] font-mono">
                  ACTIVE LINE: <strong>{selectedLineId}</strong>
                </div>

                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {comments.filter(c => c.lineId === selectedLineId).length === 0 ? (
                    <p className="text-[#8c9099] text-[11px]">No comments on this line yet.</p>
                  ) : (
                    comments.filter(c => c.lineId === selectedLineId).map(c => (
                      <div key={c._id} className="p-2.5 rounded-xl border border-[#e8e4dc] bg-[#fbfaf8] text-[11px]">
                        <div className="font-bold text-[#1c1e21] flex justify-between">
                          <span>@{c.author?.username}</span>
                          <span className="text-[#8c9099] font-mono text-[10px]">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[#4b4f57] mt-1">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostLineComment} className="space-y-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    placeholder="Suggest alternate rhyme or phrasing..."
                    className="studio-input text-xs w-full py-2"
                  />
                  <button
                    type="submit"
                    className="studio-btn-amber w-full py-2 font-bold text-xs shadow-sm"
                  >
                    Post Line Critique
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-[#7a7e85] text-xs">
                Click on any section line above to review or leave line-level lyric critique.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Commit Lyrics Modal */}
      {showCommitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                RECORD LYRICS VERSION
              </span>
              <button 
                onClick={() => setShowCommitModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCommitLyrics} className="space-y-3.5">
              <div>
                <label className="block font-bold mb-1">COMMIT MESSAGE *</label>
                <input
                  type="text"
                  required
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="e.g. Updated chorus lyrics & added Bridge rhyme scheme"
                  className="studio-input w-full"
                />
              </div>

              <div className="bg-[#f8f5ee] p-3 rounded-2xl border border-[#ece8e1] text-[11px] space-y-1 font-mono">
                <div>BRANCH: <strong className="text-[#1c1e21]">{currentBranch}</strong></div>
                <div>AUTHOR: <strong className="text-[#1c1e21]">@{user?.username}</strong></div>
                <div className="text-[#7a7e85]">A permanent git-style SHA hash will be generated for this lyric snapshot.</div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={committing}
                  className="studio-btn-amber w-full py-2.5 font-bold shadow-copper text-sm"
                >
                  {committing ? 'GENERATING COMMIT HASH...' : 'COMMIT LYRICS NOW'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simultaneous Conflict Resolution Modal */}
      {showConflictModal && conflictData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3 bg-red-50 p-3 rounded-2xl">
              <div className="flex items-center space-x-2 text-red-900 font-bold">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>SIMULTANEOUS EDIT CONFLICT DETECTED</span>
              </div>
            </div>

            <p className="text-[#4b4f57] leading-relaxed">
              Another collaborator updated this branch while you were editing. Review both versions and edit the final merged text below. Neither contributor's work is discarded.
            </p>

            <div className="space-y-2">
              <label className="block font-bold text-[#1c1e21]">RESOLVED LYRICS VERSION (EDIT TO COMBINE):</label>
              <textarea
                rows={10}
                value={manualResolutionText}
                onChange={e => setManualResolutionText(e.target.value)}
                className="studio-input w-full font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConflictModal(false)}
                className="px-4 py-2 rounded-full border border-[#e2ded5] text-[#555962] hover:bg-[#ede8dc]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveConflict}
                className="studio-btn-amber px-5 py-2 font-bold shadow-copper"
              >
                Confirm Conflict Resolution & Commit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
