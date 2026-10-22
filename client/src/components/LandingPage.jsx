import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Users, 
  Music, 
  Layers, 
  Search, 
  Menu, 
  X 
} from 'lucide-react';

export const LandingPage = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = (path) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const communityAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80',
  ];

  const featuredArtists = [
    {
      name: 'Arjun Mehta',
      role: 'Producer • Guitarist',
      genre: 'Indie Folk / Rock',
      image: '/images/arjun.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Neha Sharma',
      role: 'Vocalist • Songwriter',
      genre: 'Pop / Soul',
      image: '/images/neha.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80'
    },
    {
      name: 'Rohan Verma',
      role: 'Beatmaker • Producer',
      genre: 'Synthwave / Lo-Fi',
      image: '/images/rohan.jpg',
      fallbackImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const filteredArtists = featuredArtists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white text-[#111111] font-sans antialiased selection:bg-[#20c9b0] selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. NAVBAR (Exact match to screenshot)                                      */}
      {/* ========================================================================= */}
      <header className="w-full bg-white border-b border-[#eaebed] sticky top-0 z-40">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-[68px] flex items-center justify-between">
          
          {/* Left: Brand Logo & Wordmark */}
          <div className="flex items-center space-x-10">
            <button 
              onClick={() => navigateTo('/')}
              className="flex items-center space-x-2 text-left cursor-pointer group"
            >
              {/* Waveform Bar Icon matching screenshot */}
              <div className="flex items-center space-x-[2.5px] h-5">
                <span className="w-[3px] h-3 bg-black rounded-full" />
                <span className="w-[3px] h-5 bg-black rounded-full" />
                <span className="w-[3px] h-3.5 bg-black rounded-full" />
                <span className="w-[3px] h-4.5 bg-black rounded-full" />
              </div>
              <span className="text-lg font-bold tracking-tight text-black font-sans">
                MusicCollab
              </span>
            </button>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center space-x-7">
              <a 
                href="#how-it-works" 
                className="text-[13px] font-medium text-neutral-600 hover:text-black transition-colors"
              >
                Discover
              </a>
              <a 
                href="#how-it-works" 
                className="text-[13px] font-medium text-neutral-600 hover:text-black transition-colors"
              >
                How it works
              </a>
              <a 
                href="#featured-artists" 
                className="text-[13px] font-medium text-neutral-600 hover:text-black transition-colors"
              >
                For Artists
              </a>
              <a 
                href="#featured-artists" 
                className="text-[13px] font-medium text-neutral-600 hover:text-black transition-colors"
              >
                Community
              </a>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="hidden md:flex items-center space-x-5">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-1.5 text-neutral-600 hover:text-black transition-colors cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4 stroke-[2]" />
            </button>

            <button
              onClick={() => navigateTo('/login')}
              className="text-[13px] font-medium text-neutral-800 hover:text-black transition-colors cursor-pointer"
            >
              Log in
            </button>

            <button
              onClick={() => navigateTo('/signup')}
              className="bg-[#20c9b0] hover:bg-[#1db8a4] active:scale-[0.98] text-white font-medium text-[13px] px-5 py-2 rounded-full transition-all cursor-pointer shadow-sm"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-1 text-neutral-700"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 text-neutral-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-200 bg-white px-6 py-4 space-y-3 shadow-md">
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-neutral-700 font-medium py-1"
            >
              Discover
            </a>
            <a 
              href="#how-it-works" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-neutral-700 font-medium py-1"
            >
              How it works
            </a>
            <a 
              href="#featured-artists" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-neutral-700 font-medium py-1"
            >
              For Artists
            </a>
            <a 
              href="#featured-artists" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm text-neutral-700 font-medium py-1"
            >
              Community
            </a>
            <div className="pt-2 border-t border-neutral-100 flex items-center space-x-3">
              <button
                onClick={() => navigateTo('/login')}
                className="flex-1 py-2 text-center text-xs font-semibold border border-neutral-300 rounded-full text-neutral-800"
              >
                Log in
              </button>
              <button
                onClick={() => navigateTo('/signup')}
                className="flex-1 py-2 text-center text-xs font-semibold bg-[#20c9b0] text-white rounded-full"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (Split Layout)                                            */}
      {/* ========================================================================= */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-8 sm:pt-10 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] xl:text-[58px] font-extrabold tracking-tight text-[#111111] leading-[1.06]">
              Make music <br />
              <span className="text-[#20c9b0]">together.</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-[380px] font-normal">
              Find collaborators, build tracks, and bring your next idea to life.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => navigateTo('/signup')}
                className="bg-[#20c9b0] hover:bg-[#1db8a4] active:scale-[0.98] text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-full flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
              >
                <span>Get started free</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              <a
                href="#featured-artists"
                className="border border-neutral-300 hover:border-neutral-800 bg-white hover:bg-neutral-50 text-neutral-800 font-medium text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all cursor-pointer"
              >
                Explore the community
              </a>
            </div>

            {/* Avatars Stack & Community Text */}
            <div className="flex items-center space-x-3 pt-2">
              <div className="flex -space-x-1.5 overflow-hidden">
                {communityAvatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Musician"
                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover"
                  />
                ))}
              </div>
              <p className="text-[11px] text-neutral-500 font-normal leading-snug">
                Join a growing community <br />
                of musicians, producers and creators.
              </p>
            </div>

          </div>

          {/* Right Hero Column (Authentic Studio Photo) */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl overflow-hidden bg-neutral-100 shadow-sm aspect-[16/10] w-full">
              <img
                src="/images/hero_studio.jpg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1600&q=80';
                }}
                alt="Musicians collaborating in music recording studio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THREE-COLUMN FEATURE STRIP                                             */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="border-y border-[#eaebed] py-8 sm:py-9">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            
            {/* Title on the left */}
            <div className="lg:col-span-3">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 leading-snug">
                Everything you need <br className="hidden sm:inline" />
                to create together.
              </h2>
            </div>

            {/* 3 Feature Items */}
            <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 lg:gap-6">
              
              {/* Feature 1: Find collaborators */}
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-neutral-700 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-tight">Find collaborators</h3>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
                    Connect with vocalists, producers, instrumentalists and more.
                  </p>
                </div>
              </div>

              {/* Feature 2: Share tracks */}
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Music className="w-4 h-4 text-neutral-700 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-tight">Share tracks</h3>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
                    Upload ideas, get feedback, and collaborate in real time.
                  </p>
                </div>
              </div>

              {/* Feature 3: Build together */}
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-neutral-700 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 leading-tight">Build together</h3>
                  <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
                    Turn your ideas into finished tracks with the right people.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FEATURED MUSICIANS SECTION (Exact Cards from Screenshot)               */}
      {/* ========================================================================= */}
      <section id="featured-artists" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Column */}
          <div className="lg:col-span-3 space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase block">
              FEATURED ARTISTS
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-950 tracking-tight leading-snug">
              Creators on MusicCollab
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed pt-0.5 max-w-xs">
              Explore independent artists, producers and bands who are collaborating on amazing music.
            </p>
            
            <div className="pt-2">
              <button
                onClick={() => setSearchModalOpen(true)}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#20c9b0] hover:text-[#19a590] transition-colors cursor-pointer"
              >
                <span>Explore artists</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right 3 Photographic Cards */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredArtists.map((artist, i) => (
              <div
                key={i}
                onClick={() => navigateTo('/signup')}
                className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer bg-neutral-900"
              >
                {/* Photo */}
                <img
                  src={artist.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = artist.fallbackImage;
                  }}
                  alt={artist.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Dark gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                {/* Bottom details & arrow */}
                <div className="absolute bottom-0 inset-x-0 p-3.5 flex items-end justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {artist.name}
                    </h4>
                    <p className="text-[11px] text-neutral-300 leading-tight mt-0.5 font-normal">
                      {artist.role}
                    </p>
                  </div>

                  {/* Circular translucent arrow button */}
                  <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm group-hover:bg-[#20c9b0] group-hover:text-black text-white flex items-center justify-center transition-all flex-shrink-0">
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MINIMAL CLEAN FOOTER                                                    */}
      {/* ========================================================================= */}
      <footer className="border-t border-[#eaebed] py-8 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-neutral-700">MusicCollab</span>
            <span>•</span>
            <span>Make music together</span>
          </div>
          <div>
            © 2026 MusicCollab. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 6. DISCOVER SEARCH MODAL                                                  */}
      {/* ========================================================================= */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-neutral-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
              <span className="text-sm font-bold text-neutral-900">Discover Creators & Stems</span>
              <button
                onClick={() => setSearchModalOpen(false)}
                className="text-neutral-400 hover:text-black font-bold p-1"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, instrument, or genre..."
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs sm:text-sm outline-none focus:border-[#20c9b0] focus:bg-white transition-all"
            />

            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {filteredArtists.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No artists found</p>
              ) : (
                filteredArtists.map((artist, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchModalOpen(false);
                      navigateTo('/signup');
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-50 cursor-pointer transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-neutral-900">{artist.name}</p>
                      <p className="text-[11px] text-neutral-500">{artist.role} • {artist.genre}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#20c9b0]">Connect ➔</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
