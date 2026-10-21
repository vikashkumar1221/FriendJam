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
  const [saveStatus, setSaveStatus] = useState('ALL SAVED'); // 'ALL SAVED', 'SAVING...', 'UNSAVED CHANGES', 'CONFLICT'
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

  // Autosave text modifications with debounce
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

  // Commit changes
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

  // Resolve conflict manually
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

  // Insert section template
  const insertSectionTag = (tag) => {
    const insertion = `\n\n[${tag}]\n`;
    setRawText(prev => prev + insertion);
    setSaveStatus('UNSAVED CHANGES');
  };

  // Add line comment
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
      <div className="brutal-card bg-white p-4 border-2 border-black flex flex-wrap items-center justify-between gap-4">
        
        {/* Save Status & Branch */}
        <div className="flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2.5 h-2.5 ${
              saveStatus === 'ALL SAVED' ? 'bg-emerald-500' :
              saveStatus === 'SAVING...' ? 'bg-yellow-400 animate-spin' :
              saveStatus === 'CONFLICT DETECTED' ? 'bg-red-500 animate-pulse' : 'bg-orange-400'
            }`}></span>
            <span className="font-bold">{saveStatus}</span>
          </div>

          {lastSavedTime && (
            <span className="text-neutral-500 text-[10px] hidden sm:inline">
              (Draft rev #{lyrics?.version || 1} at {new Date(lastSavedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          )}

          <span className="technical-badge bg-[#ede8dc]">
            BRANCH: {currentBranch}
          </span>
        </div>

        {/* Quick Section Inserts & Commit Button */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="text-neutral-500 text-[10px] hidden lg:inline">INSERT:</span>
          {['Intro', 'Verse 1', 'Chorus', 'Bridge', 'Outro'].map(sec => (
            <button
              key={sec}
              onClick={() => insertSectionTag(sec)}
              className="bg-[#faf9f5] border border-black px-2 py-1 font-bold text-[10px] hover:bg-[#d7ff3b]"
            >
              + [{sec}]
            </button>
          ))}

          <button
            onClick={() => {
              setCommitMessage(`Update lyrics for ${currentBranch}`);
              setShowCommitModal(true);
            }}
            className="brutal-btn brutal-btn-acid px-3 py-1.5 text-xs font-bold flex items-center space-x-1 ml-2"
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Commit Lyrics</span>
          </button>
        </div>

      </div>

      {/* Editor & Line Attribution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Textarea Editor */}
        <div className="lg:col-span-8 space-y-4">
          <div className="brutal-card bg-white p-5 border-2 border-black space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 font-mono text-xs">
              <span className="font-bold uppercase tracking-wider text-black">
                [01] LYRICS EDITOR & RAW STRUCTURE
              </span>
              <span className="text-[10px] text-neutral-500">
                Use [Section] headers for musical organization
              </span>
            </div>

            <textarea
              rows={18}
              value={rawText}
              onChange={handleTextChange}
              placeholder="Write song lyrics here. For example:&#10;&#10;[Intro]&#10;Gentle guitar strums...&#10;&#10;[Verse 1]&#10;The city wakes up in slow motion...&#10;&#10;[Chorus]&#10;Adhoori kahani, adhoore se hum..."
              className="w-full font-mono text-sm leading-relaxed border-2 border-black p-4 bg-[#faf9f5] focus:bg-white focus:outline-none resize-y min-h-[400px]"
            />

            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 pt-1">
              <span>LINES: {rawText.split('\n').length}</span>
              <span>CHARACTERS: {rawText.length}</span>
              <span>AUTOSAVES TO DRAFT BUFFER PER STROKE</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Contributor Attribution & Section Map */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="brutal-card bg-white p-4 border-2 border-black space-y-3 font-mono text-xs">
            <div className="border-b-2 border-black pb-2 font-bold uppercase tracking-wider text-black">
              [02] SECTIONS & ATTRIBUTIONS
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {lyrics?.sections && lyrics.sections.length > 0 ? (
                lyrics.sections.map(sec => (
                  <div key={sec.sectionId} className="border border-black p-2 bg-[#faf9f5]">
                    <div className="flex items-center justify-between font-bold text-black border-b border-neutral-300 pb-1 mb-1.5">
                      <span>[{sec.label}]</span>
                      <span className="text-[10px] text-neutral-500">{sec.lines?.length || 0} lines</span>
                    </div>

                    <div className="space-y-1">
                      {(sec.lines || []).slice(0, 3).map((l, lIdx) => (
                        <div 
                          key={l.lineId || lIdx}
                          onClick={() => setSelectedLineId(l.lineId)}
                          className={`p-1 text-[11px] truncate cursor-pointer hover:bg-[#ede8dc] ${
                            selectedLineId === l.lineId ? 'bg-[#d7ff3b] font-bold border border-black' : ''
                          }`}
                        >
                          <span className="text-neutral-400 mr-1.5">L{lIdx + 1}:</span>
                          <span>{l.text || '(empty line)'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-neutral-500 text-xs italic">
                  Sections will populate automatically from your [Header] tags.
                </div>
              )}
            </div>
          </div>

          {/* Line Comments Drawer */}
          <div className="brutal-card bg-white p-4 border-2 border-black space-y-3 font-mono text-xs">
            <div className="border-b-2 border-black pb-2 font-bold uppercase tracking-wider text-black flex items-center justify-between">
              <span>[03] LINE COMMENTS</span>
              <MessageSquare className="w-3.5 h-3.5" />
            </div>

            {selectedLineId ? (
              <div className="space-y-3">
                <div className="text-[11px] bg-[#ede8dc] p-1.5 border border-black">
                  ACTIVE LINE ID: <strong>{selectedLineId}</strong>
                </div>

                {/* List comments on this line */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {comments.filter(c => c.lineId === selectedLineId).length === 0 ? (
                    <p className="text-neutral-500 text-[10px]">No comments on this line yet.</p>
                  ) : (
                    comments.filter(c => c.lineId === selectedLineId).map(c => (
                      <div key={c._id} className="p-2 border border-black bg-[#faf9f5] text-[10px]">
                        <div className="font-bold text-black flex justify-between">
                          <span>@{c.author?.username}</span>
                          <span className="text-neutral-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-neutral-700 mt-1">{c.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handlePostLineComment} className="space-y-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={e => setCommentInput(e.target.value)}
                    placeholder="Suggest alternate rhyme or phrase..."
                    className="brutal-input text-xs w-full py-1.5"
                  />
                  <button
                    type="submit"
                    className="brutal-btn brutal-btn-acid w-full py-1.5 font-bold text-xs"
                  >
                    Post Line Comment
                  </button>
                </form>
              </div>
            ) : (
              <p className="text-neutral-500 text-[11px]">
                Click on any section line above to review or add line-level lyric critique.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Commit Lyrics Modal */}
      {showCommitModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-md w-full p-6 border-2 border-black space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <span className="font-bold uppercase tracking-wider text-black">
                [COMMIT TO REPOSITORY] RECORD LYRICS VERSION
              </span>
              <button 
                onClick={() => setShowCommitModal(false)}
                className="font-bold hover:text-red-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCommitLyrics} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">COMMIT MESSAGE *</label>
                <input
                  type="text"
                  required
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="e.g. Updated chorus lyrics & added Bridge rhyme scheme"
                  className="brutal-input w-full"
                />
              </div>

              <div className="bg-[#ede8dc] p-2 border border-black text-[11px] space-y-1">
                <div>BRANCH: <strong>{currentBranch}</strong></div>
                <div>AUTHOR: <strong>@{user?.username}</strong></div>
                <div className="text-neutral-600">A permanent git-style SHA hash will be generated for this lyric snapshot.</div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={committing}
                  className="brutal-btn brutal-btn-acid w-full py-2.5 font-bold shadow-brutal text-sm"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="brutal-card bg-white max-w-2xl w-full p-6 border-2 border-black space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 bg-red-100 p-2">
              <div className="flex items-center space-x-2 text-red-900 font-bold">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>SIMULTANEOUS EDIT CONFLICT DETECTED</span>
              </div>
            </div>

            <p className="text-neutral-700 leading-relaxed">
              Another collaborator updated this branch while you were editing. 
              MusicCollab protects both contributors' work: review the changes side-by-side below and confirm the final merged text.
            </p>

            <div className="space-y-2">
              <label className="block font-bold">RESOLVED LYRICS VERSION (EDIT TO COMBINE):</label>
              <textarea
                rows={10}
                value={manualResolutionText}
                onChange={e => setManualResolutionText(e.target.value)}
                className="brutal-input w-full font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConflictModal(false)}
                className="brutal-btn bg-white px-4 py-2 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveConflict}
                className="brutal-btn brutal-btn-acid px-5 py-2 font-bold"
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
