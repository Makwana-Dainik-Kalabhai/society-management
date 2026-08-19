import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Shield, User, Lock, Mail, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { loginUser, verifyOTPLogin } from '../../redux/slices/authSlice';
import { authAPI } from '../../api/authAPI';
import { DEMO_ACCOUNTS } from '../../components/common/DemoBanner';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please enter both email and password');
    }

    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.fullName}!`);
      redirectBasedOnRole(result.payload.user.role);
    } else {
      toast.error(result.payload || 'Invalid credentials');
    }
  };

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      return toast.error('Please enter a valid 10-digit mobile number');
    }

    setRequestingOtp(true);
    try {
      const res = await authAPI.otpLogin({ mobileNumber });
      setOtpSent(true);
      toast.success(res.data.message || 'OTP sent! (Use demo: 123456)', { duration: 6000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the 6-digit OTP');

    const result = await dispatch(verifyOTPLogin({ mobileNumber, otp }));
    if (verifyOTPLogin.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.fullName}!`);
      redirectBasedOnRole(result.payload.user.role);
    } else {
      toast.error(result.payload || 'Invalid OTP');
    }
  };

  const handleDemoLogin = async (account) => {
    setEmail(account.email);
    setPassword('password123');
    const result = await dispatch(loginUser({ email: account.email, password: 'password123' }));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Signed in as ${account.name}!`);
      redirectBasedOnRole(result.payload.user.role);
    }
  };

  const redirectBasedOnRole = (role) => {
    if (role === 'main_admin') navigate('/admin/dashboard');
    else if (role === 'society_admin') navigate('/society/dashboard');
    else navigate('/member/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 items-center justify-center text-white shadow-xl shadow-brand-500/30 mb-4">
          <Building2 size={30} />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">SocietyHub</h2>
        <p className="mt-2 text-sm text-slate-400">Smart Residential Community & Society Management System</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        {/* Main Card */}
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-3xl p-6 sm:p-8">
          
          {/* Quick Demo 1-Click Role Logins */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Instant 1-Click Test Drive</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {DEMO_ACCOUNTS.slice(0, 3).map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleDemoLogin(acc)}
                    className="text-left p-3 rounded-xl bg-slate-700/40 hover:bg-slate-700/80 border border-slate-600/50 hover:border-indigo-400/60 transition-all group flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${acc.color} text-white shadow-sm`}>
                        <Icon size={14} />
                      </div>
                      <span className="font-bold text-xs text-white group-hover:text-indigo-300 transition-colors">{acc.name.split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block">{acc.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-800 px-3 text-slate-400 font-semibold">Or Sign In with Credentials</span></div>
          </div>

          {/* Auth Tab Switcher */}
          <div className="flex rounded-xl bg-slate-900/60 p-1 mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'password' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${authMode === 'otp' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Mobile OTP Login
            </button>
          </div>

          {authMode === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@gmail.com"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all mt-6 text-sm"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleVerifyOTP : (e) => { e.preventDefault(); handleSendOTP(); }} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Registered Mobile Number</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9876543210"
                    disabled={otpSent}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:opacity-60"
                  />
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Enter 6-Digit OTP</label>
                    <span className="text-[11px] text-amber-400 font-mono">Demo OTP: 123456</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    required
                    className="block w-full px-3 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-center tracking-widest text-lg font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={requestingOtp || loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2 transition-all mt-6 text-sm"
              >
                {requestingOtp ? 'Sending OTP...' : otpSent ? 'Verify OTP & Enter' : 'Get Verification Code'}
                <ArrowRight size={16} />
              </button>

              {otpSent && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  Didn't receive code?{' '}
                  <button type="button" onClick={() => setOtpSent(false)} className="text-indigo-400 hover:underline">Change Number</button>
                </p>
              )}
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-xs text-slate-400">
            Need help accessing your flat account? Contact society security or secretary office.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
