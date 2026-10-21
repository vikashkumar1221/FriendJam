import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  Check, 
  ArrowRight, 
  Disc3, 
  Music, 
  Sparkles,
  AlertCircle,
  Lock,
  Mail,
  User,
  ShieldCheck
} from 'lucide-react';

export const AuthPage = ({ onEnterGuest }) => {
  const { login, register, switchDemoAccount } = useAuth();
  const [authMode, setAuthMode] = useState('register'); // 'register' or 'login'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    login: '',
    username: '',
    email: '',
    displayName: '',
    password: '',
    agreeTerms: true,
    agreeMarketing: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        if (!formData.login || !formData.password) {
          throw new Error('Please enter both username/email and password.');
        }
        await login(formData.login, formData.password);
      } else {
        if (!formData.email || !formData.password || !formData.username || !formData.displayName) {
          throw new Error('Please fill in all required fields.');
        }
        if (!formData.agreeTerms) {
          throw new Error('Please accept the Terms of Service to continue.');
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName,
          primaryRole: 'Songwriter / Producer'
        });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (username) => {
    setError('');
    setDemoLoading(username);
    try {
      await switchDemoAccount(username);
    } catch (err) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setDemoLoading('');
    }
  };

  const demoMusicians = [
    { username: 'vikash', name: 'Vikash', role: 'Songwriter & Producer' },
    { username: 'neha', name: 'Neha', role: 'Vocalist & Producer' },
    { username: 'maya-vocals', name: 'Maya', role: 'Lead Vocalist' },
    { username: 'sid-guitar', name: 'Sid', role: 'Guitarist' },
    { username: 'arjun-drums', name: 'Arjun', role: 'Drummer' },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0d0e11] text-white flex flex-col lg:flex-row font-sans selection:bg-[#20c9b0] selection:text-black">
      
      {/* ========================================================================= */}
      {/* LEFT HALF: LANDR-Inspired Hero Visual & Value Proposition                 */}
      {/* ========================================================================= */}
      <div className="relative w-full lg:w-1/2 min-h-[460px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden bg-[#111215]">
        
        {/* Background atmospheric image with dark cinematic overlays */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1600&auto=format&fit=crop')`
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0d0e11] via-[#0d0e11]/70 to-[#0d0e11]/80" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#0d0e11]/80 via-transparent to-[#0d0e11]" />

        {/* Top: Logo & Brand Mark */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center">
            <span className="flex items-end space-x-0.5 h-4">
              <span className="w-0.5 h-2.5 bg-[#20c9b0] rounded-full"></span>
              <span className="w-0.5 h-4 bg-white rounded-full"></span>
              <span className="w-0.5 h-3 bg-[#e5a83b] rounded-full"></span>
              <span className="w-0.5 h-4 bg-[#20c9b0] rounded-full"></span>
            </span>
          </div>
          <div>
            <span className="font-extrabold tracking-widest text-sm uppercase block text-white font-mono">
              MUSICCOLLAB
            </span>
            <span className="text-[9px] font-mono tracking-wider text-[#20c9b0] uppercase block">
              STUDIO NETWORK
            </span>
          </div>
        </div>

        {/* Center: Punchy Headline and Colored Feature Dots (Direct LANDR Reference) */}
        <div className="relative z-10 max-w-xl my-8 lg:my-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
            Hits don't just 'happen'. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#20c9b0]">
              But when they do, they happen here.
            </span>
          </h1>

          {/* LANDR-style Bullet points with vibrant colored dots */}
          <ul className="space-y-3.5 text-xs sm:text-sm text-neutral-300 font-normal leading-relaxed pt-2">
            <li className="flex items-start space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] mt-1.5 flex-shrink-0 shadow-[0_0_8px_#f97316]" />
              <span>Create with a bank of exclusive, multitrack stems and version-controlled takes</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899] mt-1.5 flex-shrink-0 shadow-[0_0_8px_#ec4899]" />
              <span>Collab in real-time with peers or pros in high-quality synchronized audio sessions</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7] mt-1.5 flex-shrink-0 shadow-[0_0_8px_#a855f7]" />
              <span>Never overwrite audio: branch guitar takes, vocal stems, and synchronized lyrics</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6] mt-1.5 flex-shrink-0 shadow-[0_0_8px_#14b8a6]" />
              <span>Review pull requests, merge branch takes, and track your release metrics</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308] mt-1.5 flex-shrink-0 shadow-[0_0_8px_#eab308]" />
              <span>Gain instant access to audio templates, stem diffs, and lossless master playback</span>
            </li>
          </ul>
        </div>

        {/* Bottom: Trusted by the best in the game */}
        <div className="relative z-10 pt-6 border-t border-white/10 space-y-3">
          <p className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
            Trusted by the best in the game
          </p>
          <div className="flex flex-wrap items-center gap-6 text-neutral-400 text-xs font-mono font-bold opacity-80">
            <span className="hover:text-white transition-colors">WARNER RECORDS</span>
            <span className="hover:text-white transition-colors">ATLANTIC MUSIC</span>
            <span className="hover:text-white transition-colors">ABBEY ROAD STUDIOS</span>
            <span className="hover:text-white transition-colors">UNIVERSAL AUDIO</span>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT HALF: LANDR-Inspired Clean Modern Dark Auth Form                     */}
      {/* ========================================================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-[#0c0d10]">
        
        <div className="w-full max-w-md space-y-6">
          
          {/* Header */}
          <div className="space-y-1 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              {authMode === 'register' ? 'Sign up for free' : 'Log in to MusicCollab'}
            </h2>
            <p className="text-xs text-neutral-400">
              {authMode === 'register' 
                ? 'Join thousands of musicians collaborating on stems and takes' 
                : 'Welcome back! Enter your credentials to access your studio'}
            </p>
          </div>

          {/* Social Continue with buttons matching LANDR */}
          <div className="space-y-2">
            <p className="text-[11px] text-neutral-400 font-medium text-center">Continue with</p>
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Google */}
              <button
                type="button"
                onClick={() => handleDemoLogin('vikash')}
                className="h-11 rounded-xl bg-[#17191e] hover:bg-[#20232a] border border-[#262830] hover:border-[#383c48] flex items-center justify-center transition-all group"
                title="Continue with Google"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </button>

              {/* Facebook / GitHub */}
              <button
                type="button"
                onClick={() => handleDemoLogin('neha')}
                className="h-11 rounded-xl bg-[#17191e] hover:bg-[#20232a] border border-[#262830] hover:border-[#383c48] flex items-center justify-center transition-all"
                title="Continue with Facebook"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleDemoLogin('maya-vocals')}
                className="h-11 rounded-xl bg-[#17191e] hover:bg-[#20232a] border border-[#262830] hover:border-[#383c48] flex items-center justify-center transition-all"
                title="Continue with Apple"
              >
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.77 1.04-1.85.93-2.93-.9.04-2 .6-2.65 1.37-.57.66-1.07 1.76-.94 2.81 1.01.08 2.04-.49 2.66-1.25z"/>
                </svg>
              </button>

            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#23252c] w-full" />
            <span className="bg-[#0c0d10] px-3 text-[11px] font-mono text-neutral-500 uppercase">
              {authMode === 'register' ? 'or by email' : 'or with username / email'}
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            
            {/* If Register: Email */}
            {authMode === 'register' && (
              <div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-[#17191e] border border-[#2a2c34] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-xs"
                />
              </div>
            )}

            {/* If Register: First Name / Display Name */}
            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="First name / Display"
                  className="w-full px-4 py-3 bg-[#17191e] border border-[#2a2c34] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-xs"
                />
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Username (e.g. maya)"
                  className="w-full px-4 py-3 bg-[#17191e] border border-[#2a2c34] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-xs"
                />
              </div>
            )}

            {/* If Login: Username or Email */}
            {authMode === 'login' && (
              <div>
                <input
                  type="text"
                  required
                  value={formData.login}
                  onChange={e => setFormData({ ...formData, login: e.target.value })}
                  placeholder="Email or username"
                  className="w-full px-4 py-3 bg-[#17191e] border border-[#2a2c34] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-xs"
                />
              </div>
            )}

            {/* Password Field with Eye Toggle (from LANDR) */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password"
                className="w-full pl-4 pr-11 py-3 bg-[#17191e] border border-[#2a2c34] focus:border-[#20c9b0] focus:ring-1 focus:ring-[#20c9b0] rounded-xl text-white placeholder-neutral-500 outline-none transition-all text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-neutral-400 hover:text-white transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Checkboxes (from LANDR) */}
            {authMode === 'register' && (
              <div className="space-y-2.5 pt-1 text-[11px] text-neutral-400">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })}
                    className="mt-0.5 rounded bg-[#17191e] border-[#2a2c34] text-[#20c9b0] focus:ring-0"
                  />
                  <span>
                    I agree to the <a href="#" className="underline text-neutral-300 hover:text-white">Terms of Service</a> and <a href="#" className="underline text-neutral-300 hover:text-white">Privacy Policy</a>
                  </span>
                </label>

                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeMarketing}
                    onChange={e => setFormData({ ...formData, agreeMarketing: e.target.checked })}
                    className="mt-0.5 rounded bg-[#17191e] border-[#2a2c34] text-[#20c9b0] focus:ring-0"
                  />
                  <span>
                    I agree to receive music tips, exclusive stem releases, and MusicCollab studio updates
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button (LANDR Cyan-Teal button) */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-[#20c9b0] hover:bg-[#1bb59e] text-[#0a1f1b] font-extrabold text-sm transition-all hover:scale-[1.01] shadow-lg shadow-[#20c9b0]/20 flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Processing...' : 'Continue'}</span>
                {!loading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
              </button>
            </div>

          </form>

          {/* Quick Demo Musician Login Section for Instant Testing */}
          <div className="pt-3 border-t border-[#1e2027] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-500">
              <span>Quick 1-Click Demo Logins</span>
              <span>Password123!</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {demoMusicians.map(p => (
                <button
                  key={p.username}
                  type="button"
                  onClick={() => handleDemoLogin(p.username)}
                  disabled={demoLoading === p.username}
                  className="px-2.5 py-1.5 rounded-lg bg-[#17191e] hover:bg-[#262933] border border-[#2a2c34] text-[11px] font-mono text-neutral-300 hover:text-white transition-colors flex items-center space-x-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20c9b0]" />
                  <span>@{p.username}</span>
                  {demoLoading === p.username && <span className="animate-spin text-[9px]">●</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Switch between Sign Up and Log In */}
          <div className="text-center text-xs text-neutral-400 pt-2">
            {authMode === 'register' ? (
              <p>
                Already have a MusicCollab account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setError(''); }}
                  className="text-white underline font-semibold hover:text-[#20c9b0] transition-colors"
                >
                  Log In
                </button>
              </p>
            ) : (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setError(''); }}
                  className="text-white underline font-semibold hover:text-[#20c9b0] transition-colors"
                >
                  Sign up for free
                </button>
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
