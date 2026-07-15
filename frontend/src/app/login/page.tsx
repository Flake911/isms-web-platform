'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Eye, EyeOff, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router   = useRouter();
  const { login } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#060B14' }}>

      {/* ══ LEFT — open background with content ══ */}
      <div className="hidden lg:flex lg:w-[58%] flex-col relative overflow-hidden">

        {/* Stars */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {[
            [8,6],[20,15],[38,4],[55,11],[70,6],[84,19],[95,3],[5,32],[25,40],[47,28],
            [62,36],[77,22],[90,38],[13,53],[32,58],[52,50],[72,56],[87,63],[4,68],[22,73],
            [40,78],[57,70],[74,76],[92,68],[10,88],[30,86],[50,90],[66,83],[84,88],[96,80],
            [44,16],[60,26],[23,30],[80,8],[97,28],[2,46],[89,53],[35,66],[63,13],[16,13],
            [45,55],[18,47],[72,40],[30,20],[88,72],[55,82],[10,75],[65,50],[82,30],[40,38],
          ].map(([x, y], i) => (
            <circle key={i} cx={`${x}%`} cy={`${y}%`}
              r={i % 5 === 0 ? 1.4 : i % 3 === 0 ? 1 : 0.6}
              fill="white" opacity={0.08 + (i % 6) * 0.05} />
          ))}
        </svg>

        {/* Blue horizon glow */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '50%', background: 'radial-gradient(ellipse 100% 70% at 50% 120%, rgba(37,99,235,0.28) 0%, rgba(37,99,235,0.08) 45%, transparent 70%)' }} />

        {/* Network SVG */}
        <svg className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '52%', width: '100%' }} viewBox="0 0 560 300" preserveAspectRatio="xMidYMax slice">
          {[
            [50,290,150,230],[150,230,270,255],[270,255,390,205],[390,205,480,248],
            [150,230,210,155],[210,155,320,175],[320,175,390,205],[210,155,150,75],
            [50,290,95,205],[95,205,150,230],[95,205,210,155],[320,175,410,135],
            [410,135,475,165],[410,135,390,55],[270,255,290,300],[50,290,15,248],
            [410,135,480,100],[150,75,210,40],[210,40,320,60],[320,60,410,135],
          ].map(([x1,y1,x2,y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#3B82F6" strokeWidth="0.5" strokeOpacity="0.25" />
          ))}
          {[[50,290],[150,230],[270,255],[390,205],[480,248],[210,155],[320,175],
            [95,205],[410,135],[475,165],[390,55],[150,75],[210,40],[320,60]].map(([cx,cy], i) => (
            <g key={i}>
              <circle cx={cx} cy={cy} r="6" fill="#2563EB" opacity="0.1" />
              <circle cx={cx} cy={cy} r="2.5" fill="#60A5FA" opacity={0.4 + (i % 4) * 0.12} />
            </g>
          ))}
        </svg>

        {/* ── Logo ── */}
        <div className="relative z-10" style={{ padding: '52px 0 0 64px' }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563EB,#4F46E5)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}>
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-white" style={{ fontSize: '28px' }}>Sentra<span style={{ color: '#60A5FA' }}>ISMS</span></span>
          </div>
        </div>

        {/* ── Bottom content ── */}
        <div className="relative z-10 flex-1 flex items-center" style={{ padding: '0 64px 40px' }}>
          <div className="w-full text-center">
            <h1 className="font-extrabold text-white leading-tight tracking-tight mb-4 text-center" style={{ fontSize: '46px' }}>
              Your ISO 27001<br />
              <span style={{ color: '#60A5FA' }}>Command Center</span>
            </h1>
            <p className="mb-10 leading-relaxed text-center w-full" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '15px' }}>
              Centralize, secure, and comply. Manage risks, controls, audits, and compliance — all in one platform.
            </p>
            <div className="flex gap-4 justify-center">
              {[
                { n: '93',   l: 'Annex A Controls', sub: 'ISO 27001:2022' },
                { n: '27+',  l: 'ISMS Modules',     sub: 'Fully integrated' },
                { n: '100%', l: 'ISO Coverage',      sub: 'End-to-end' },
              ].map(f => (
                <div key={f.l} className="rounded-2xl" style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', padding: '16px 20px' }}>
                  <p className="font-extrabold leading-none mb-1" style={{ fontSize: '26px', color: '#60A5FA' }}>{f.n}</p>
                  <p className="font-semibold text-white" style={{ fontSize: '12px' }}>{f.l}</p>
                  <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{f.sub}</p>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 mt-8 justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px rgba(74,222,128,0.8)' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)' }}>All systems operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT — floating card ══ */}
      <div className="flex-1 flex items-center justify-center" style={{ padding: '28px 36px 28px 28px', background: '#060B14' }}>

        <div className="w-full animate-fade-in flex flex-col" style={{ maxWidth: '440px', minHeight: '88vh' }}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#2563EB,#4F46E5)' }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-base">Sentra<span style={{ color: '#60A5FA' }}>ISMS</span></span>
          </div>

          {/* ── Card ── */}
          <div className="flex-1 flex flex-col justify-center rounded-3xl" style={{ background: '#111927', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 32px 80px rgba(0,0,0,0.7)', padding: '56px 48px' }}>

            <h2 className="font-bold text-white tracking-tight mb-2" style={{ fontSize: '38px' }}>Sign in</h2>
            <p className="mb-12" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.35)' }}>Enter your credentials to continue</p>

            {error && (
              <div className="flex items-center gap-3 mb-8 rounded-2xl animate-fade-in" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '14px 18px' }}>
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Email */}
              <div className="flex items-center gap-3 rounded-xl transition-all" style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px' }}>
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email address" required
                  className="flex-1 bg-transparent outline-none border-none min-w-0"
                  style={{ fontSize: '15px', color: '#E5E7EB' }} />
              </div>

              {/* Password */}
              <div className="flex items-center gap-3 rounded-xl transition-all" style={{ background: '#0D1525', border: '1px solid rgba(255,255,255,0.06)', padding: '16px 20px' }}>
                <Lock className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password" required
                  className="flex-1 bg-transparent outline-none border-none min-w-0"
                  style={{ fontSize: '15px', color: '#E5E7EB' }} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="flex-shrink-0 transition-colors" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between" style={{ padding: '4px 0' }}>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded accent-blue-500" />
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Remember me</span>
                </label>
                <button type="button" style={{ fontSize: '14px', color: '#3B82F6', fontWeight: 600 }}
                  className="hover:text-blue-400 transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="flex items-center justify-center gap-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#2563EB,#4F46E5)', padding: '18px 24px', fontSize: '15px', marginTop: '8px', boxShadow: '0 4px 28px rgba(37,99,235,0.35)' }}>
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          </div>

          <p className="text-center mt-5" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.18)' }}>
            © 2026 SentraISMS · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
