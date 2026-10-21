import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Plus, 
  Upload, 
  MessageSquare, 
  Download, 
  Trash2, 
  Check, 
  Clock, 
  Sliders, 
  Radio, 
  Headphones,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export const MultitrackStudio = ({ repo, currentBranch, userRole }) => {
  const { user } = useAuth();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(16);
  const [masterVolume, setMasterVolume] = useState(90);
  const [comments, setComments] = useState([]);
  
  // Modals & Panels
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [targetTrack, setTargetTrack] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [takeLabel, setTakeLabel] = useState('');
  const [takeNote, setTakeNote] = useState('');
  const [uploading, setUploading] = useState(false);

  // New Track modal
  const [showNewTrackModal, setShowNewTrackModal] = useState(false);
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackCategory, setNewTrackCategory] = useState('vocals');

  // Timestamp comment modal
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentTimestamp, setCommentTimestamp] = useState(0);
  const [commentTrack, setCommentTrack] = useState(null);
  const [commentText, setCommentText] = useState('');

  const audioRefs = useRef(new Map());
  const timerRef = useRef(null);

  useEffect(() => {
    loadTracks();
    loadComments();
    return () => {
      stopPlayback();
    };
  }, [repo._id, currentBranch]);

  const loadTracks = async () => {
    setLoading(true);
    try {
      const data = await api.getTracks(repo._id, currentBranch);
      setTracks(data.tracks || []);
      let maxDur = 16;
      (data.tracks || []).forEach(t => {
        const active = t.takes.find(tk => tk.takeId === t.activeTakeId) || t.takes[0];
        if (active && active.duration > maxDur) maxDur = active.duration;
      });
      setDuration(maxDur);
    } catch (err) {
      console.error('Failed to load tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getComments(repo._id, { resourceType: 'audio_timestamp' });
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  const startPlayback = () => {
    setIsPlaying(true);
    const hasSolo = tracks.some(t => t.isSolo);

    tracks.forEach(t => {
      const el = audioRefs.current.get(t._id);
      if (el) {
        el.currentTime = currentTime;
        const shouldPlay = !t.isMuted && (!hasSolo || t.isSolo);
        el.volume = shouldPlay ? (t.volume / 100) * (masterVolume / 100) : 0;
        el.play().catch(e => console.warn('Audio play notice:', e.message));
      }
    });

    timerRef.current = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          stopPlayback();
          return 0;
        }
        return Number((prev + 0.1).toFixed(2));
      });
    }, 100);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
    audioRefs.current.forEach(el => {
      if (el) el.pause();
    });
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
    setCurrentTime(0);
    audioRefs.current.forEach(el => {
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    });
  };

  const seekTo = (seconds) => {
    const clamped = Math.max(0, Math.min(duration, seconds));
    setCurrentTime(clamped);
    audioRefs.current.forEach(el => {
      if (el) el.currentTime = clamped;
    });
  };

  const handleToggleMute = async (track) => {
    const updatedMute = !track.isMuted;
    setTracks(prev => prev.map(t => t._id === track._id ? { ...t, isMuted: updatedMute } : t));
    await api.updateTrackMix(repo._id, track._id, { isMuted: updatedMute });

    const el = audioRefs.current.get(track._id);
    if (el) {
      el.volume = updatedMute ? 0 : (track.volume / 100) * (masterVolume / 100);
    }
  };

  const handleToggleSolo = async (track) => {
    const updatedSolo = !track.isSolo;
    setTracks(prev => {
      const next = prev.map(t => t._id === track._id ? { ...t, isSolo: updatedSolo } : t);
      const anySolo = next.some(t => t.isSolo);
      next.forEach(t => {
        const el = audioRefs.current.get(t._id);
        if (el) {
          const active = !t.isMuted && (!anySolo || t.isSolo);
          el.volume = active ? (t.volume / 100) * (masterVolume / 100) : 0;
        }
      });
      return next;
    });
    await api.updateTrackMix(repo._id, track._id, { isSolo: updatedSolo });
  };

  const handleVolumeChange = async (track, val) => {
    setTracks(prev => prev.map(t => t._id === track._id ? { ...t, volume: val } : t));
    const el = audioRefs.current.get(track._id);
    if (el && !track.isMuted) {
      el.volume = (val / 100) * (masterVolume / 100);
    }
    await api.updateTrackMix(repo._id, track._id, { volume: val });
  };

  const handlePanChange = async (track, val) => {
    setTracks(prev => prev.map(t => t._id === track._id ? { ...t, pan: val } : t));
    await api.updateTrackMix(repo._id, track._id, { pan: val });
  };

  const handleSwitchTake = async (track, takeId) => {
    try {
      const res = await api.switchActiveTake(repo._id, track._id, takeId);
      setTracks(prev => prev.map(t => t._id === track._id ? res.track : t));
    } catch (err) {
      alert('Failed to switch take: ' + err.message);
    }
  };

  const handleDeleteTrack = async (track) => {
    if (!confirm(`Move track "${track.trackName}" to trash? You can restore it anytime.`)) return;
    try {
      await api.deleteTrack(repo._id, track._id);
      setTracks(prev => prev.filter(t => t._id !== track._id));
    } catch (err) {
      alert('Failed to delete track: ' + err.message);
    }
  };

  const handleUploadTake = async (e) => {
    e.preventDefault();
    if (!uploadFile || !targetTrack) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('audio', uploadFile);
      if (takeLabel) formData.append('label', takeLabel);
      if (takeNote) formData.append('notes', takeNote);

      await api.uploadTake(repo._id, targetTrack._id, formData);
      setShowUploadModal(false);
      setUploadFile(null);
      setTakeLabel('');
      setTakeNote('');
      await loadTracks();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateTrack = async (e) => {
    e.preventDefault();
    if (!newTrackName.trim()) return;

    try {
      await api.createTrack(repo._id, newTrackName.trim(), newTrackCategory, currentBranch);
      setShowNewTrackModal(false);
      setNewTrackName('');
      await loadTracks();
    } catch (err) {
      alert('Failed to create track: ' + err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await api.postComment(repo._id, {
        resourceType: 'audio_timestamp',
        trackId: commentTrack?._id,
        timestampSeconds: commentTimestamp,
        content: commentText.trim()
      });
      setComments(prev => [...prev, res.comment]);
      setShowCommentModal(false);
      setCommentText('');
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}.${ms}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Sleek Dark Basalt Master Transport Bar matching Dribbble Floating Player */}
      <div className="bg-[#1e2023] text-white p-4 sm:p-5 rounded-3xl shadow-player border border-[#2b2e34] sticky top-20 z-30 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Playback Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-[#e5a83b] hover:bg-[#f5be57] text-[#1c1e21] flex items-center justify-center font-bold shadow-copper transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-[#1c1e21]" /> : <Play className="w-4 h-4 fill-[#1c1e21] ml-0.5" />}
            </button>

            <button
              onClick={stopPlayback}
              className="w-8 h-8 rounded-full bg-[#2d3036] hover:bg-[#383b42] text-white flex items-center justify-center transition-colors"
              title="Stop"
            >
              <Square className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => seekTo(0)}
              className="w-8 h-8 rounded-full bg-[#2d3036] hover:bg-[#383b42] text-white flex items-center justify-center transition-colors"
              title="Rewind to start"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Timecode Readout */}
            <div className="bg-[#141518] border border-[#2d3036] px-3.5 py-1.5 rounded-full font-mono text-xs text-[#f5be57] font-bold tracking-wider shadow-inner">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Master Volume & Info */}
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-2 bg-[#141518] px-3 py-1.5 rounded-full border border-[#2d3036]">
              <Volume2 className="w-3.5 h-3.5 text-[#8c9099]" />
              <span className="text-[10px] text-neutral-400">MASTER</span>
              <input
                type="range"
                min="0"
                max="100"
                value={masterVolume}
                onChange={e => {
                  const val = Number(e.target.value);
                  setMasterVolume(val);
                  tracks.forEach(t => {
                    const el = audioRefs.current.get(t._id);
                    if (el && !t.isMuted) el.volume = (t.volume / 100) * (val / 100);
                  });
                }}
                className="w-20 accent-[#e5a83b] h-1.5 bg-[#383b42] rounded-full cursor-pointer"
              />
              <span className="w-6 text-right text-[10px] text-white">{masterVolume}%</span>
            </div>

            <div className="hidden lg:flex items-center space-x-2 text-neutral-400 text-[11px]">
              <span>TEMPO: <strong className="text-white">{repo.bpm} BPM</strong></span>
              <span>•</span>
              <span>KEY: <strong className="text-white">{repo.keySignature}</strong></span>
            </div>

            <button
              onClick={() => setShowNewTrackModal(true)}
              className="studio-btn-amber px-3.5 py-1.5 text-xs font-bold font-sans flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Add Track Stem</span>
            </button>
          </div>

        </div>

        {/* Amber Waveform Scrubber Timeline */}
        <div className="pt-1">
          <div 
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = clickX / rect.width;
              seekTo(ratio * duration);
            }}
            className="h-5 bg-[#141518] rounded-xl border border-[#2d3036] relative cursor-pointer overflow-hidden group"
          >
            {/* Progress fill */}
            <div 
              className="h-full bg-[#e5a83b]/30 border-r-2 border-[#e5a83b] transition-all"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />

            {/* Playhead marker */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-[#e5a83b] shadow-[0_0_10px_#e5a83b]"
              style={{ left: `${(currentTime / duration) * 100}%` }}
            />

            {/* Timestamp comment flags */}
            {comments.map((c, idx) => {
              if (c.timestampSeconds === null) return null;
              const pct = (c.timestampSeconds / duration) * 100;
              return (
                <div
                  key={c._id || idx}
                  className="absolute top-0 w-2.5 h-full bg-[#f97316] hover:scale-125 z-10 cursor-help"
                  style={{ left: `${pct}%` }}
                  title={`${c.author?.username || 'User'} at ${formatTime(c.timestampSeconds)}: "${c.content}"`}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1 px-1">
            <span>00:00.0</span>
            <span>00:04.0</span>
            <span>00:08.0</span>
            <span>00:12.0</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

      </div>

      {/* Multitrack Stems Matrix */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e8e4dc] text-center text-xs font-mono text-[#7a7e85]">
          [LOADING TRACK STEMS AND AUDIO PEAKS...]
        </div>
      ) : tracks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e8e4dc] text-center space-y-3 font-sans shadow-soft">
          <Headphones className="w-8 h-8 mx-auto text-[#a84c26]" />
          <h3 className="font-bold text-base text-[#1c1e21]">No audio tracks recorded yet on branch "{currentBranch}".</h3>
          <p className="text-xs text-[#7a7e85] max-w-md mx-auto">
            Upload your first WAV/MP3 track stem to begin multitrack collaboration.
          </p>
          <button
            onClick={() => setShowNewTrackModal(true)}
            className="studio-btn-amber px-4 py-2 text-xs font-bold inline-flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Track</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map(track => {
            const activeTake = track.takes.find(t => t.takeId === track.activeTakeId) || track.takes[0];
            const takesCount = track.takes.length;
            const trackComments = comments.filter(c => c.trackId === track._id);

            return (
              <div 
                key={track._id}
                className={`bg-white p-5 rounded-3xl border border-[#e8e4dc] shadow-soft transition-all ${
                  track.isMuted ? 'opacity-50 bg-[#faf8f5]' : track.isSolo ? 'ring-2 ring-[#a84c26]' : ''
                }`}
              >
                {/* Audio Element */}
                {activeTake && (
                  <audio
                    ref={el => {
                      if (el) audioRefs.current.set(track._id, el);
                      else audioRefs.current.delete(track._id);
                    }}
                    src={activeTake.audioUrl}
                    preload="auto"
                  />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                  
                  {/* Left Column: Track Info & Mix Controls */}
                  <div className="lg:col-span-4 space-y-3 border-b lg:border-b-0 lg:border-r border-[#ece8e1] pb-4 lg:pb-0 lg:pr-5">
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#a84c26] inline-block"></span>
                        <span className="font-bold font-sans text-base text-[#1c1e21]">{track.trackName}</span>
                      </div>
                      <span className="bg-[#f0ede6] text-[#555962] text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-medium">
                        {track.category}
                      </span>
                    </div>

                    {/* Active Take Dropdown & Add Take Button */}
                    <div className="flex items-center space-x-2 text-xs">
                      <select
                        value={track.activeTakeId || (activeTake ? activeTake.takeId : '')}
                        onChange={e => handleSwitchTake(track, e.target.value)}
                        className="studio-input py-1.5 px-2.5 text-xs font-mono flex-1 bg-[#f5f2ec] rounded-xl text-[#1c1e21]"
                      >
                        {track.takes.map(tk => (
                          <option key={tk.takeId} value={tk.takeId}>
                            {tk.label} ({tk.duration}s)
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          setTargetTrack(track);
                          setTakeLabel(`Take 0${takesCount + 1}`);
                          setShowUploadModal(true);
                        }}
                        className="studio-btn-amber px-2.5 py-1.5 text-xs font-bold flex items-center space-x-1"
                        title="Upload a new take"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Take</span>
                      </button>
                    </div>

                    {/* Mute, Solo, Volume, Pan */}
                    <div className="flex items-center space-x-2.5 pt-1 text-xs">
                      <button
                        onClick={() => handleToggleMute(track)}
                        className={`w-7 h-7 rounded-full font-bold transition-all text-xs flex items-center justify-center ${
                          track.isMuted ? 'bg-red-600 text-white shadow-sm' : 'bg-[#f0ede6] text-[#4a4d54] hover:bg-[#e4dfd6]'
                        }`}
                        title="Mute track"
                      >
                        M
                      </button>

                      <button
                        onClick={() => handleToggleSolo(track)}
                        className={`w-7 h-7 rounded-full font-bold transition-all text-xs flex items-center justify-center ${
                          track.isSolo ? 'bg-[#2563eb] text-white shadow-sm' : 'bg-[#f0ede6] text-[#4a4d54] hover:bg-[#e4dfd6]'
                        }`}
                        title="Solo track"
                      >
                        S
                      </button>

                      {/* Volume Slider */}
                      <div className="flex items-center space-x-1.5 flex-1">
                        <span className="text-[10px] text-[#8c9099] font-mono">VOL</span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={track.volume}
                          onChange={e => handleVolumeChange(track, Number(e.target.value))}
                          className="w-full accent-[#a84c26] h-1.5 bg-[#e4dfd6] rounded-full cursor-pointer"
                        />
                        <span className="text-[10px] w-6 text-right font-mono text-[#555962]">{track.volume}</span>
                      </div>

                      {/* Pan Slider */}
                      <div className="flex items-center space-x-1 w-20">
                        <span className="text-[10px] text-[#8c9099] font-mono">PAN</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={track.pan}
                          onChange={e => handlePanChange(track, Number(e.target.value))}
                          className="w-full accent-[#a84c26] h-1.5 bg-[#e4dfd6] rounded-full cursor-pointer"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Waveform Canvas & Annotations */}
                  <div className="lg:col-span-8 space-y-2">
                    
                    {/* Golden Amber Waveform Canvas from Dribbble shot */}
                    <div 
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const pct = clickX / rect.width;
                        const targetSecs = Number((pct * duration).toFixed(2));
                        seekTo(targetSecs);

                        setCommentTrack(track);
                        setCommentTimestamp(targetSecs);
                        setShowCommentModal(true);
                      }}
                      className="h-20 bg-[#f8f6f2] rounded-2xl border border-[#e4dfd6] relative overflow-hidden cursor-crosshair group hover:border-[#a84c26]/50 transition-colors"
                      title="Click anywhere to seek or leave a critique note"
                    >
                      {/* Playhead bar */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-[#1c1e21] z-20"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />

                      {/* Amber Waveform Bars */}
                      <div className="h-full w-full flex items-center justify-between px-2">
                        {((activeTake && activeTake.waveformData) || Array.from({ length: 80 }, (_, i) => Math.sin(i * 0.2) * 0.4 + 0.5)).map((val, idx) => {
                          const heightPct = Math.max(12, Math.min(100, Math.round(val * 100)));
                          const isPlayed = ((idx / 80) * duration) <= currentTime;
                          return (
                            <div
                              key={idx}
                              className={`w-1 rounded-full transition-colors ${
                                isPlayed ? 'bg-[#a84c26]' : 'bg-[#e5a83b] opacity-70 group-hover:opacity-90'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          );
                        })}
                      </div>

                      {/* Timestamp comment flags */}
                      {trackComments.map((c, idx) => {
                        const pct = (c.timestampSeconds / duration) * 100;
                        return (
                          <div
                            key={c._id || idx}
                            className="absolute top-2 z-30 bg-[#ea580c] text-white text-[9px] font-mono px-2 py-0.5 rounded-full shadow-sm"
                            style={{ left: `${pct}%` }}
                            title={`@${c.author?.username}: ${c.content}`}
                          >
                            💬 {formatTime(c.timestampSeconds)}
                          </div>
                        );
                      })}
                    </div>

                    {/* Metadata & Actions Strip */}
                    <div className="flex items-center justify-between text-[11px] text-[#7a7e85]">
                      <div className="flex items-center space-x-3">
                        <span>ACTIVE: <strong className="text-[#1c1e21]">{activeTake?.label || 'Take 1'}</strong></span>
                        <span>•</span>
                        <span>BY: <strong className="text-[#1c1e21]">@{activeTake?.uploadedBy?.username || 'vikash'}</strong></span>
                        {activeTake?.notes && (
                          <span className="italic truncate max-w-xs text-neutral-500">"{activeTake.notes}"</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3">
                        {activeTake && (
                          <a
                            href={activeTake.audioUrl}
                            download={activeTake.originalFileName || `${track.trackName}.wav`}
                            className="hover:text-[#a84c26] font-semibold flex items-center space-x-1"
                            title="Export raw stem WAV"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download WAV</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleDeleteTrack(track)}
                          className="hover:text-red-700 text-[#a0a4ad] p-1"
                          title="Soft delete track to trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Upload Take Modal */}
      {showUploadModal && targetTrack && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                [RECORDING VAULT] UPLOAD NEW TAKE
              </span>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f8f5ee] p-3 rounded-2xl border border-[#ece8e1] space-y-1">
              <div>TRACK: <strong className="text-[#1c1e21]">{targetTrack.trackName}</strong> [{targetTrack.category}]</div>
              <div className="text-[10px] text-neutral-500">Previous takes will NEVER be overwritten. Every take gets a unique version hash.</div>
            </div>

            <form onSubmit={handleUploadTake} className="space-y-3.5">
              <div>
                <label className="block font-bold mb-1">SELECT AUDIO FILE (.WAV, .MP3, .FLAC)</label>
                <input
                  type="file"
                  required
                  accept="audio/*"
                  onChange={e => setUploadFile(e.target.files[0])}
                  className="studio-input w-full p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">TAKE LABEL</label>
                <input
                  type="text"
                  value={takeLabel}
                  onChange={e => setTakeLabel(e.target.value)}
                  placeholder="e.g. Take 02 (Neumann U87 Re-take)"
                  className="studio-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">SESSION NOTES</label>
                <textarea
                  rows={2}
                  value={takeNote}
                  onChange={e => setTakeNote(e.target.value)}
                  placeholder="Lowered gain by 2dB. Added plate reverb send."
                  className="studio-input w-full"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={uploading || !uploadFile}
                  className="studio-btn-amber w-full py-2.5 font-bold shadow-copper text-sm"
                >
                  {uploading ? 'PROCESSING WAVEFORM & STORING...' : 'COMMIT & UPLOAD TAKE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Track Stem Modal */}
      {showNewTrackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-3">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                ADD TRACK STEM
              </span>
              <button 
                onClick={() => setShowNewTrackModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrack} className="space-y-3.5">
              <div>
                <label className="block font-bold mb-1">TRACK STEM NAME *</label>
                <input
                  type="text"
                  required
                  value={newTrackName}
                  onChange={e => setNewTrackName(e.target.value)}
                  placeholder="e.g. Lead Guitar Solo, Synth Arp, Backing Vocals"
                  className="studio-input w-full"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">CATEGORY</label>
                <select
                  value={newTrackCategory}
                  onChange={e => setNewTrackCategory(e.target.value)}
                  className="studio-input w-full bg-white"
                >
                  <option value="vocals">Vocals</option>
                  <option value="guitar">Guitar</option>
                  <option value="bass">Bass</option>
                  <option value="drums">Drums & Percussion</option>
                  <option value="keys">Keys & Synthesizers</option>
                  <option value="instruments">Acoustic / Orchestral</option>
                  <option value="master">Master Bus</option>
                  <option value="other">Other Stem</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="studio-btn-amber w-full py-2.5 font-bold shadow-copper text-sm"
                >
                  CREATE STEM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timestamp Comment Modal */}
      {showCommentModal && commentTrack && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-player border border-[#e2ded5] space-y-3 text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#ece8e1] pb-2">
              <span className="font-bold uppercase tracking-wider text-[#1c1e21] font-mono">
                TIMECODE CRITIQUE AT {formatTime(commentTimestamp)}
              </span>
              <button 
                onClick={() => setShowCommentModal(false)}
                className="text-neutral-500 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#f8f5ee] p-2.5 rounded-xl border border-[#ece8e1]">
              TRACK: <strong>{commentTrack.trackName}</strong>
            </div>

            <form onSubmit={handleAddComment} className="space-y-3">
              <div>
                <label className="block font-bold mb-1">OBSERVATION / MIX CRITIQUE</label>
                <textarea
                  rows={3}
                  required
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="e.g. Pitch is slightly sharp on this note, let's punch in Take 2 here."
                  className="studio-input w-full"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCommentModal(false)}
                  className="px-4 py-1.5 rounded-full border border-[#e2ded5] text-[#555962] hover:bg-[#ede8dc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="studio-btn-amber px-4 py-1.5 font-bold"
                >
                  Post Comment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
