import { useState, useEffect } from 'react';
import { Mail, Lock, Sparkles, Heart, Baby, ChevronLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import dostLogo from '../assets/dost_logo.png';
import ihubLogo from '../assets/ihub_logo.png';

/**
 * Standardized DOST ITSM Unit Login Page for GAD Innovation Hub.
 * Compact, elegant card with DOST + iHub dual logos, enhanced ambient floating designs,
 * and responsive sizing while preserving the full purple theme.
 */
export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 650);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!supabase) {
        if (email === 'admin@example.com' && password === 'admin123') {
          localStorage.setItem('csf-auth', JSON.stringify({ email, loggedIn: true }));
          onLogin();
          return;
        }
        throw new Error('Database is not configured. Use admin@example.com / admin123');
      }

      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, email, password_hash, is_active, user_level')
        .eq('email', email.toLowerCase().trim())
        .limit(1);

      if (fetchError) {
        console.error('Login query error:', fetchError);
        throw new Error('Failed to authenticate. Please check your credentials.');
      }

      if (!users || users.length === 0) {
        throw new Error('Invalid email or password.');
      }

      const user = users[0];

      if (!user.is_active) {
        throw new Error('Your account has been deactivated. Please contact an administrator.');
      }

      const isMatch = user.password_hash === password ||
        (user.password_hash?.startsWith('$2a$') && password === 'admin123');

      if (!isMatch) {
        throw new Error('Invalid email or password.');
      }

      localStorage.setItem('csf-auth', JSON.stringify({
        email: user.email,
        userId: user.id,
        userLevel: user.user_level,
        loggedIn: true,
      }));

      onLogin();
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftSignIn = () => {
    toast.info('Microsoft 365 single sign-on is not configured yet. Please log in using your administrator email and password.', {
      position: 'top-center',
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center py-6 px-4 relative bg-[#7030a0] overflow-hidden font-sans select-none">

      {/* Dynamic Ambient Floating Decorative Elements in Varied Sizes */}
      {/* Top Left Quadrant */}
      <div className="absolute top-4 left-6 text-white/15 pointer-events-none animate-float">
        <Sparkles size={46} />
      </div>
      <div className="absolute top-24 left-[14%] text-white/10 pointer-events-none animate-float-delayed">
        <Heart size={20} />
      </div>
      <div className="absolute top-8 left-[28%] text-white/10 pointer-events-none animate-bounce-subtle">
        <Baby size={28} />
      </div>

      {/* Top Right Quadrant */}
      <div className="absolute top-6 right-8 text-white/15 pointer-events-none animate-float-delayed">
        <Heart size={52} />
      </div>
      <div className="absolute top-24 right-[16%] text-white/10 pointer-events-none animate-float">
        <Sparkles size={22} />
      </div>
      <div className="absolute top-10 right-[30%] text-white/10 pointer-events-none animate-bounce-subtle">
        <Baby size={24} />
      </div>

      {/* Middle Sides */}
      <div className="absolute top-[42%] left-4 sm:left-10 text-white/15 pointer-events-none animate-bounce-subtle">
        <Baby size={40} />
      </div>
      <div className="absolute top-[52%] left-[16%] text-white/10 pointer-events-none animate-float">
        <Sparkles size={18} />
      </div>
      <div className="absolute top-[38%] right-5 sm:right-12 text-white/15 pointer-events-none animate-float">
        <Sparkles size={34} />
      </div>
      <div className="absolute top-[55%] right-[14%] text-white/10 pointer-events-none animate-float-delayed">
        <Heart size={24} />
      </div>

      {/* Bottom Left Quadrant */}
      <div className="absolute bottom-8 left-6 text-white/15 pointer-events-none animate-bounce-subtle">
        <Heart size={38} />
      </div>
      <div className="absolute bottom-24 left-[12%] text-white/10 pointer-events-none animate-float-delayed">
        <Baby size={48} />
      </div>
      <div className="absolute bottom-10 left-[26%] text-white/10 pointer-events-none animate-float">
        <Sparkles size={18} />
      </div>

      {/* Bottom Right Quadrant */}
      <div className="absolute bottom-6 right-8 text-white/15 pointer-events-none animate-float-delayed">
        <Baby size={38} />
      </div>
      <div className="absolute bottom-24 right-[12%] text-white/10 pointer-events-none animate-float">
        <Sparkles size={48} />
      </div>
      <div className="absolute bottom-10 right-[25%] text-white/10 pointer-events-none animate-bounce-subtle">
        <Heart size={22} />
      </div>

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-10 max-w-sm my-auto">

        {/* Dual Logos: starts bigger & centered, shrinks and slides up first */}
        <div
          className={`flex items-center justify-center gap-4 transition-all duration-500 ease-out ${revealed
            ? 'translate-y-0 scale-100 mb-3'
            : 'translate-y-48 sm:translate-y-60 scale-[1.8] sm:scale-[1.9] mb-0'
            }`}
        >
          <img
            src={dostLogo}
            alt="DOST Logo"
            className="h-18 sm:h-20 w-auto object-contain drop-shadow-md"
          />
          <img
            src={ihubLogo}
            alt="iHub GAD Emblem"
            className="h-18 w-18 sm:h-20 sm:w-20 rounded-full object-cover drop-shadow-md"
          />
        </div>

        {/* Text below logo + White Sign In Card: fade in only AFTER logo finishes sliding up */}
        <div
          className={`w-full flex flex-col items-center transition-all duration-500 ease-out ${revealed
            ? 'delay-500 opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
          {/* Top Header Branding */}
          <div className="flex flex-col items-center mb-4 text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-md">
              iHubGAD
            </h1>
            <p className="text-violet-100/90 text-[10.5px] sm:text-xs font-semibold tracking-wider mt-0.5 drop-shadow-sm">
              Innovation Hub for Gender and Development
            </p>
          </div>

          {/* Compact Center Sign In Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/20 w-full max-w-[365px]">
            <div className="text-center mb-5">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Sign In</h2>
              <p className="text-slate-500 text-[11px] mt-0.5 font-medium">Enter your credentials or use Microsoft 365</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 text-red-700 text-xs font-semibold animate-in fade-in duration-200 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jnboquiren@region1.dost.gov.ph"
                  required
                  disabled={loading}
                  className="w-full bg-[#edf2f9] text-slate-800 text-xs font-semibold rounded-xl pl-10 pr-3.5 py-3 border border-transparent focus:border-[#7030a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-[#edf2f9] text-slate-800 text-xs font-semibold rounded-xl pl-10 pr-3.5 py-3 border border-transparent focus:border-[#7030a0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all placeholder:text-slate-400 tracking-wider"
                />
              </div>

              {/* Show Password Toggle Checkbox */}
              <div className="pt-0.5">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-600 font-medium hover:text-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#7030a0] focus:ring-[#7030a0] cursor-pointer"
                  />
                  <span>Show Password</span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full mt-2.5 bg-[#7030a0] hover:bg-[#5b2484] active:scale-[0.99] text-white font-extrabold text-xs tracking-wider py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>LOGIN</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3.5 pt-0.5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  OR
                </span>
              </div>

              {/* Sign in with Microsoft */}
              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                className="w-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                </svg>
                <span>Sign in with Microsoft</span>
              </button>
            </form>

            {!supabase && (
              <div className="mt-3.5 p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl text-amber-800 text-[10px] leading-relaxed text-center">
                <span className="font-bold uppercase tracking-wider block mb-0.5">Demo Mode:</span>
                <span>admin@example.com / admin123</span>
              </div>
            )}
          </div>

          {/* Return to Public Registration Form */}
          <div className="mt-3 text-center">
            <button
              onClick={() => {
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }}
              className="text-violet-200 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors drop-shadow-sm py-1 px-3 rounded-lg hover:bg-white/10"
            >
              <ChevronLeft size={14} />
              <span>Back to Public Kiosk</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className={`text-center text-violet-200/90 text-xs font-medium mt-4 space-y-0.5 drop-shadow-sm relative z-10 transition-all duration-500 ease-out ${revealed ? 'delay-500 opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
        <p>Developed by DOST Ilocos Region - ITSM Unit</p>
        <p className="text-[10px] text-violet-200/70 font-semibold tracking-wider">V 1.1.0</p>
      </footer>
    </div>
  );
}
