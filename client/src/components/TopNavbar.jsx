import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Search, 
  Plus, 
  Bell, 
  ChevronDown, 
  Menu, 
  LogOut, 
  CheckCircle2, 
  SlidersHorizontal,
  Flame,
  Radio
} from 'lucide-react';

export const TopNavbar = ({ onOpenNewRepoModal, onToggleSidebar, onSearch, searchQuery }) => {
  const { user, logout, switchDemoAccount } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('studio-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleSwitchAccount = async (username) => {
    setSwitching(true);
    try {
      await switchDemoAccount(username);
      setShowUserMenu(false);
    } catch (err) {
      alert('Error switching account: ' + err.message);
    } finally {
      setSwitching(false);
    }
  };

  const personas = [
    { u: 'vikash', name: 'Vikash Sharma', role: 'Songwriter & Producer' },
    { u: 'neha', name: 'Neha Sharma', role: 'Vocalist & Producer' },
    { u: 'maya-vocals', name: 'Maya Patel', role: 'Lead Vocalist & Lyricist' },
    { u: 'sid-guitar', name: 'Siddharth Roy', role: 'Lead Guitarist' },
    { u: 'arjun-drums', name: 'Arjun Mehta', role: 'Drummer & Percussionist' },
    { u: 'rohan', name: 'Rohan Verma', role: 'Bass & Arrangement' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#fbfaf8]/90 backdrop-blur-md border-b border-[#e7e2d9] px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      
      {/* Left: Mobile hamburger + Breadcrumb path from Dribbble shot */}
      <div className="flex items-center space-x-3 flex-1 max-w-2xl">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl border border-[#e2ded5] bg-white shadow-sm"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-4 h-4 text-neutral-700" />
        </button>

        {/* Breadcrumb breadcrumb links matching Dribbble shot */}
        <div className="hidden sm:flex items-center space-x-2 text-xs text-[#7a7e85]">
          <span className="hover:text-black cursor-pointer">Artists</span>
          <span>&rsaquo;</span>
          <span className="font-semibold text-[#1c1e21]">Top 2026</span>
        </div>

        {/* Global Pill Search Bar from Dribbble shot */}
        <div className="relative w-full max-w-md ml-2">
          <Search className="w-3.5 h-3.5 text-[#8c9099] absolute left-3.5 top-3" />
          <input
            id="studio-search-input"
            type="text"
            value={searchQuery}
            onChange={e => onSearch && onSearch(e.target.value)}
            placeholder="Search songs, collaborators, genres..."
            className="w-full pl-9 pr-14 py-2 bg-[#f3efe9] rounded-full text-xs text-[#1c1e21] placeholder-[#8c9099] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#a84c26]/20 border border-transparent focus:border-[#e2ded5] transition-all"
          />
          <div className="absolute right-3 top-2 flex items-center space-x-0.5 text-[10px] font-mono text-[#8c9099] bg-[#e8e4dc] px-1.5 py-0.5 rounded-md select-none">
            <span>⌘</span>
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right Action Cluster */}
      <div className="flex items-center space-x-3">
        
        {/* Quick filter pills from Dribbble shot */}
        <div className="hidden xl:flex items-center space-x-2 text-xs text-[#6e7279]">
          <button className="px-3 py-1.5 rounded-full hover:bg-[#ede8dc] transition-colors font-medium">
            New Releases
          </button>
          <button className="px-3 py-1.5 rounded-full hover:bg-[#ede8dc] transition-colors font-medium">
            New Stems
          </button>
          <button className="px-3 py-1.5 rounded-full hover:bg-[#ede8dc] transition-colors font-medium">
            Shuffle Play
          </button>
        </div>

        {/* + New Song Repository Button (Amber-gold pill) */}
        <button
          onClick={onOpenNewRepoModal}
          className="studio-btn-amber px-4 py-2 text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span className="hidden sm:inline">New Song Repository</span>
        </button>

        {/* Notifications Icon with Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-9 h-9 rounded-full border border-[#e4dfd6] bg-white flex items-center justify-center hover:bg-[#f5f2ec] transition-colors relative shadow-sm"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#2b2d30]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#a84c26] border-2 border-white" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-lg border border-[#e2ded5] z-50 p-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#e8e4dc] pb-2 mb-2 px-1">
                <span className="font-bold uppercase tracking-wider text-[11px] text-[#1c1e21]">
                  Activity Feed [{unreadCount} unread]
                </span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#a84c26] underline hover:text-[#6e2b13]"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1.5">
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-neutral-500 text-xs">
                    No new notifications.
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n._id}
                      className={`p-2.5 rounded-xl border text-[11px] ${
                        n.isRead ? 'bg-[#fbfaf8] border-[#ebe6de]' : 'bg-[#fff7ed] border-[#fed7aa]'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between text-[#1c1e21]">
                        <span>{n.title}</span>
                        <span className="text-[9px] text-[#8c9099]">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-neutral-600 mt-0.5">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching Dribbble circle avatar */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-full border border-[#e4dfd6] bg-white hover:bg-[#f5f2ec] transition-all shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#a84c26] to-[#e5a83b] text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {user?.username?.[0]?.toUpperCase() || 'V'}
            </div>

            <div className="text-left hidden md:block">
              <div className="font-bold text-xs leading-none text-[#1c1e21]">
                {user?.displayName || 'Vikash'}
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-[#8c9099]" />
          </button>

          {/* User Persona Switcher & Logout Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-soft-lg border border-[#e2ded5] z-50 p-2.5 text-xs">
              <div className="px-3 py-2 border-b border-[#ece8e1] mb-2 bg-[#f8f5ee] rounded-xl">
                <p className="font-bold uppercase tracking-wider text-[10px] text-[#7a7e85]">
                  Switch Collaborator Persona
                </p>
                <p className="text-[#3b3e44] text-[10px] mt-0.5">
                  Test multi-track permissions & takes:
                </p>
              </div>

              <div className="space-y-1">
                {personas.map(p => (
                  <button
                    key={p.u}
                    onClick={() => handleSwitchAccount(p.u)}
                    disabled={switching}
                    className={`w-full text-left px-3 py-2 rounded-xl border flex items-center justify-between transition-colors ${
                      user?.username === p.u 
                        ? 'bg-[#fff7ed] border-[#fed7aa] text-[#9a3412] font-bold' 
                        : 'bg-white border-transparent hover:bg-[#f5f2ec] text-[#2b2d30]'
                    }`}
                  >
                    <div>
                      <div className="font-bold">@{p.u}</div>
                      <div className="text-[10px] text-[#7a7e85]">{p.role}</div>
                    </div>
                    {user?.username === p.u && <CheckCircle2 className="w-4 h-4 text-[#a84c26]" />}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-[#ece8e1] flex justify-between px-2">
                <span className="text-[10px] text-neutral-400 self-center">
                  Logged in as @{user?.username}
                </span>
                <button
                  onClick={logout}
                  className="text-red-700 hover:text-red-900 font-bold flex items-center space-x-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
