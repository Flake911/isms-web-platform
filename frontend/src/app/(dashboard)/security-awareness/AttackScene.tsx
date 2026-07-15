'use client';
import React, { useState, useEffect } from 'react';

interface SceneProps {
  courseId: string;
  color: string;
  onComplete: () => void;
}

// Each scene has animated characters, devices, and data flows
const sceneConfigs: Record<string, { frames: { actors: { emoji: string; label: string; x: number; y: number; scale?: number }[]; arrows?: { from: number; to: number; label: string; color: string; dashed?: boolean }[]; caption: string }[] }> = {
  'phishing': {
    frames: [
      { actors: [{ emoji: '🎭', label: 'Hacker', x: 10, y: 40, scale: 1.8 }, { emoji: '💻', label: 'Dark Web Tools', x: 10, y: 70 }], caption: '🎬 The hacker prepares a fake website that looks identical to your bank\'s login page...' },
      { actors: [{ emoji: '🎭', label: 'Hacker', x: 10, y: 40, scale: 1.8 }, { emoji: '📧', label: 'Fake Email', x: 45, y: 40, scale: 1.5 }, { emoji: '👤', label: 'Employee', x: 80, y: 40, scale: 1.8 }], arrows: [{ from: 0, to: 1, label: 'sends', color: '#EF4444' }, { from: 1, to: 2, label: '"Your account is locked!"', color: '#F97316' }], caption: '📨 The hacker sends a convincing email: "URGENT: Your account has been suspended! Click to verify."' },
      { actors: [{ emoji: '👤', label: 'Employee', x: 30, y: 35, scale: 1.8 }, { emoji: '🖥️', label: 'Fake Login Page', x: 65, y: 35, scale: 1.8 }, { emoji: '🔑', label: 'Password', x: 65, y: 65 }], arrows: [{ from: 0, to: 1, label: 'clicks link', color: '#EF4444' }, { from: 0, to: 2, label: 'types password', color: '#EF4444', dashed: true }], caption: '🖱️ The employee clicks the link and enters their real password on the FAKE website...' },
      { actors: [{ emoji: '🎭', label: 'Hacker', x: 20, y: 35, scale: 1.8 }, { emoji: '🔓', label: 'Stolen Credentials', x: 50, y: 35, scale: 1.5 }, { emoji: '🏦', label: 'Real Bank', x: 80, y: 35, scale: 1.5 }, { emoji: '💰', label: 'Money Stolen', x: 80, y: 65 }], arrows: [{ from: 1, to: 0, label: 'received!', color: '#EF4444' }, { from: 0, to: 2, label: 'logs in', color: '#EF4444' }], caption: '💀 The hacker now has the real credentials and logs into the actual account — money and data STOLEN!' },
    ],
  },
  'spear-phishing': {
    frames: [
      { actors: [{ emoji: '🔍', label: 'Hacker Researching', x: 20, y: 35, scale: 1.8 }, { emoji: '📱', label: 'LinkedIn Profile', x: 55, y: 30, scale: 1.3 }, { emoji: '🐦', label: 'Social Media', x: 55, y: 60, scale: 1.3 }], arrows: [{ from: 0, to: 1, label: 'stalks', color: '#DC2626' }], caption: '🔍 The attacker researches the target on LinkedIn, Twitter, and the company website...' },
      { actors: [{ emoji: '🎭', label: 'Hacker as CEO', x: 15, y: 40, scale: 1.8 }, { emoji: '📧', label: '"CEO" Email', x: 50, y: 40, scale: 1.5 }, { emoji: '👩‍💼', label: 'Finance Employee', x: 82, y: 40, scale: 1.8 }], arrows: [{ from: 0, to: 1, label: 'poses as CEO', color: '#DC2626' }, { from: 1, to: 2, label: '"Wire $45K urgently"', color: '#F97316' }], caption: '✍️ Pretending to be the CEO, the hacker writes: "Please wire €45,000 to this account ASAP. Keep it confidential."' },
      { actors: [{ emoji: '👩‍💼', label: 'Employee', x: 25, y: 40, scale: 1.8 }, { emoji: '🏦', label: 'Bank Transfer', x: 55, y: 40, scale: 1.5 }, { emoji: '💸', label: 'Money Gone!', x: 82, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'sends money', color: '#EF4444' }, { from: 1, to: 2, label: '$45,000', color: '#EF4444' }], caption: '💸 The employee trusts the "CEO" and transfers the money — it goes straight to the criminal\'s account!' },
    ],
  },
  'password-security': {
    frames: [
      { actors: [{ emoji: '💾', label: 'Leaked Database', x: 15, y: 40, scale: 1.5 }, { emoji: '🌐', label: 'Dark Web', x: 50, y: 40, scale: 1.5 }, { emoji: '🎭', label: 'Hacker', x: 82, y: 40, scale: 1.8 }], arrows: [{ from: 0, to: 1, label: 'data breach', color: '#2563EB' }, { from: 1, to: 2, label: 'buys passwords', color: '#2563EB' }], caption: '📋 A website gets hacked — millions of usernames and passwords leaked on the dark web...' },
      { actors: [{ emoji: '🎭', label: 'Hacker', x: 15, y: 40, scale: 1.8 }, { emoji: '⚡', label: '"password123"', x: 45, y: 30, scale: 1.2 }, { emoji: '⏱️', label: '0.001 seconds!', x: 45, y: 60, scale: 1.2 }, { emoji: '🔓', label: 'CRACKED', x: 78, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'tries', color: '#EF4444' }], caption: '⚡ The hacker\'s computer tests millions of passwords per second. "password123" is cracked INSTANTLY!' },
      { actors: [{ emoji: '🎭', label: 'Hacker', x: 10, y: 40, scale: 1.8 }, { emoji: '📧', label: 'Email', x: 35, y: 25 }, { emoji: '🏦', label: 'Bank', x: 55, y: 25 }, { emoji: '📱', label: 'Social Media', x: 75, y: 25 }, { emoji: '🔓', label: 'Same password!', x: 55, y: 60 }], arrows: [{ from: 0, to: 1, label: '', color: '#EF4444' }, { from: 0, to: 2, label: '', color: '#EF4444' }, { from: 0, to: 3, label: '', color: '#EF4444' }], caption: '🔄 Since you used the SAME password everywhere — the hacker now has access to ALL your accounts!' },
    ],
  },
  'social-engineering': {
    frames: [
      { actors: [{ emoji: '🎭', label: 'Fake IT Support', x: 15, y: 40, scale: 1.8 }, { emoji: '📞', label: 'Phone Call', x: 48, y: 40, scale: 1.5 }, { emoji: '👤', label: 'Employee', x: 80, y: 40, scale: 1.8 }], arrows: [{ from: 0, to: 1, label: 'calls', color: '#8B5CF6' }, { from: 1, to: 2, label: '"I\'m from IT Support"', color: '#8B5CF6' }], caption: '📞 "Hi, this is Mike from IT. We detected a security issue on your computer — I need your login RIGHT NOW!"' },
      { actors: [{ emoji: '👤', label: 'Trusting Employee', x: 25, y: 35, scale: 1.8 }, { emoji: '🔑', label: 'Username & Password', x: 55, y: 35, scale: 1.3 }, { emoji: '🎭', label: 'Attacker', x: 80, y: 35, scale: 1.8 }], arrows: [{ from: 0, to: 1, label: 'shares login', color: '#EF4444' }, { from: 1, to: 2, label: 'received!', color: '#EF4444' }], caption: '😰 Under pressure, the employee shares their credentials — the attacker now has full access!' },
      { actors: [{ emoji: '🎭', label: 'Attacker', x: 15, y: 40, scale: 1.8 }, { emoji: '🖥️', label: 'Company Systems', x: 50, y: 30, scale: 1.5 }, { emoji: '📤', label: 'Data Exfiltrated', x: 80, y: 40, scale: 1.3 }, { emoji: '📁', label: 'Confidential Files', x: 50, y: 60 }], arrows: [{ from: 0, to: 1, label: 'logs in', color: '#EF4444' }, { from: 1, to: 2, label: 'steals data', color: '#EF4444' }], caption: '📤 The attacker accesses the company network, steals confidential data, and disappears...' },
    ],
  },
  'malware-ransomware': {
    frames: [
      { actors: [{ emoji: '📧', label: 'Email with Attachment', x: 15, y: 40, scale: 1.3 }, { emoji: '📎', label: 'Invoice.pdf.exe', x: 48, y: 40, scale: 1.5 }, { emoji: '👤', label: 'Employee', x: 80, y: 40, scale: 1.8 }], arrows: [{ from: 0, to: 1, label: 'contains', color: '#F97316' }, { from: 1, to: 2, label: '"Open the invoice"', color: '#F97316' }], caption: '📎 An email arrives: "Please review the attached invoice." The file is Invoice.pdf.exe — it\'s MALWARE!' },
      { actors: [{ emoji: '👤', label: 'Employee', x: 20, y: 30, scale: 1.8 }, { emoji: '💻', label: 'Computer', x: 50, y: 30, scale: 1.5 }, { emoji: '🦠', label: 'Malware Installing', x: 50, y: 65, scale: 1.5 }, { emoji: '🔒', label: 'Files Encrypting...', x: 80, y: 50, scale: 1.3 }], arrows: [{ from: 0, to: 1, label: 'double-clicks', color: '#EF4444' }, { from: 2, to: 3, label: 'encrypts all files', color: '#EF4444' }], caption: '🦠 The employee opens the file — ransomware silently encrypts EVERY file on the computer and network!' },
      { actors: [{ emoji: '💀', label: 'RANSOM NOTE', x: 50, y: 30, scale: 2 }, { emoji: '🪙', label: 'Pay $50,000 in Bitcoin', x: 50, y: 60, scale: 1.3 }, { emoji: '⏰', label: '48 hours or files deleted!', x: 50, y: 80, scale: 1 }], caption: '💀 A ransom note appears: "Your files are encrypted. Pay $50,000 in Bitcoin within 48 hours or LOSE EVERYTHING!"' },
    ],
  },
  'usb-physical': {
    frames: [
      { actors: [{ emoji: '🎭', label: 'Attacker', x: 15, y: 40, scale: 1.8 }, { emoji: '💾', label: 'Infected USB', x: 48, y: 40, scale: 1.8 }, { emoji: '🅿️', label: 'Parking Lot', x: 80, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'prepares', color: '#06B6D4' }, { from: 1, to: 2, label: 'drops', color: '#06B6D4' }], caption: '💾 The attacker drops an infected USB in the parking lot labeled "Employee Salaries Q4 2024"...' },
      { actors: [{ emoji: '👤', label: 'Curious Employee', x: 20, y: 40, scale: 1.8 }, { emoji: '💾', label: 'Found USB', x: 48, y: 40, scale: 1.5 }, { emoji: '💻', label: 'Work Computer', x: 78, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'picks up', color: '#F97316' }, { from: 1, to: 2, label: 'plugs in!', color: '#EF4444' }], caption: '🤔 An employee finds it and thinks "Let me check what\'s on this..." and plugs it into their work PC!' },
      { actors: [{ emoji: '💻', label: 'Infected PC', x: 20, y: 40, scale: 1.5 }, { emoji: '🦠', label: 'Malware Spreading', x: 48, y: 40, scale: 1.5 }, { emoji: '🏢', label: 'Entire Network', x: 78, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'auto-runs', color: '#EF4444' }, { from: 1, to: 2, label: 'spreads everywhere', color: '#EF4444' }], caption: '🌐 Malware installs INSTANTLY and spreads through the entire corporate network — FULL COMPROMISE!' },
    ],
  },
  'wifi-risks': {
    frames: [
      { actors: [{ emoji: '🎭', label: 'Hacker', x: 15, y: 40, scale: 1.8 }, { emoji: '📡', label: '"Free_CoffeeShop_WiFi"', x: 50, y: 40, scale: 1.5 }, { emoji: '☕', label: 'Coffee Shop', x: 82, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'creates fake WiFi', color: '#10B981' }], caption: '📡 The hacker creates a fake Wi-Fi hotspot named "CoffeeShop_Free_WiFi" — it looks legitimate!' },
      { actors: [{ emoji: '👤', label: 'Employee', x: 15, y: 40, scale: 1.8 }, { emoji: '📱', label: 'Phone/Laptop', x: 42, y: 40, scale: 1.3 }, { emoji: '📡', label: 'Fake WiFi', x: 65, y: 40, scale: 1.3 }, { emoji: '🎭', label: 'Hacker Watching', x: 88, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 2, label: 'connects', color: '#F97316' }, { from: 2, to: 3, label: 'traffic visible!', color: '#EF4444' }], caption: '📱 The employee connects — now ALL internet traffic flows through the hacker\'s device!' },
      { actors: [{ emoji: '🎭', label: 'Hacker', x: 15, y: 35, scale: 1.8 }, { emoji: '👁️', label: 'Sees Everything', x: 48, y: 35, scale: 1.5 }, { emoji: '🔑', label: 'Passwords', x: 75, y: 25 }, { emoji: '💳', label: 'Credit Cards', x: 75, y: 50 }, { emoji: '📧', label: 'Emails', x: 75, y: 75 }], arrows: [{ from: 0, to: 1, label: 'intercepts', color: '#EF4444' }], caption: '👁️ The hacker captures passwords, credit cards, emails — everything sent over the network!' },
    ],
  },
  'email-bec': {
    frames: [
      { actors: [{ emoji: '🎭', label: 'Hacker', x: 15, y: 40, scale: 1.8 }, { emoji: '📧', label: 'Vendor\'s Email', x: 50, y: 40, scale: 1.5 }, { emoji: '🔓', label: 'Compromised!', x: 50, y: 65 }], arrows: [{ from: 0, to: 1, label: 'hacks into', color: '#F43F5E' }], caption: '🔓 The hacker gains access to your vendor\'s real email account and reads all communications...' },
      { actors: [{ emoji: '🎭', label: 'Hacker as Vendor', x: 15, y: 40, scale: 1.8 }, { emoji: '📧', label: '"New Bank Details"', x: 48, y: 40, scale: 1.3 }, { emoji: '👩‍💼', label: 'Your Finance Team', x: 82, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'sends from vendor email', color: '#F43F5E' }, { from: 1, to: 2, label: '"Please update our bank info"', color: '#F97316' }], caption: '📝 From the real vendor\'s email: "Our bank details have changed. Please update and pay to this new account."' },
      { actors: [{ emoji: '👩‍💼', label: 'Finance', x: 20, y: 40, scale: 1.5 }, { emoji: '🏦', label: 'Wire Transfer', x: 50, y: 40, scale: 1.5 }, { emoji: '💸', label: '$2.7 BILLION/year!', x: 80, y: 40, scale: 1.3 }], arrows: [{ from: 0, to: 1, label: '$34,500', color: '#EF4444' }, { from: 1, to: 2, label: 'to criminal\'s account', color: '#EF4444' }], caption: '💸 The payment goes to the criminal\'s account. BEC costs businesses $2.7 BILLION per year!' },
    ],
  },
  'data-leakage': {
    frames: [
      { actors: [{ emoji: '👤', label: 'Employee', x: 15, y: 40, scale: 1.8 }, { emoji: '📄', label: 'Sensitive Data', x: 48, y: 40, scale: 1.5 }, { emoji: '📧', label: 'Personal Email', x: 80, y: 40, scale: 1.3 }], arrows: [{ from: 0, to: 1, label: 'copies', color: '#6366F1' }, { from: 1, to: 2, label: 'sends to Gmail', color: '#EF4444' }], caption: '📤 An employee emails confidential customer data to their personal email "to work from home"...' },
      { actors: [{ emoji: '🌐', label: 'Exposed Online', x: 15, y: 40, scale: 1.5 }, { emoji: '🔍', label: 'Google Indexes It', x: 48, y: 40, scale: 1.5 }, { emoji: '🎭', label: 'Criminals Find It', x: 80, y: 40, scale: 1.8 }], arrows: [{ from: 0, to: 1, label: 'discovered', color: '#EF4444' }, { from: 1, to: 2, label: 'harvested', color: '#EF4444' }], caption: '🔍 The data gets exposed — automated scanners and criminals find and harvest it!' },
      { actors: [{ emoji: '⚖️', label: 'GDPR Fine', x: 25, y: 35, scale: 1.8 }, { emoji: '💶', label: '€20 MILLION', x: 55, y: 35, scale: 1.5 }, { emoji: '📰', label: 'News Headlines', x: 80, y: 35, scale: 1.3 }], caption: '⚖️ Result: GDPR fine up to €20 MILLION, reputation destroyed, customers leave...' },
    ],
  },
  'insider-threats': {
    frames: [
      { actors: [{ emoji: '😤', label: 'Frustrated Employee', x: 20, y: 40, scale: 1.8 }, { emoji: '💼', label: 'Passed for Promotion', x: 55, y: 30, scale: 1 }, { emoji: '💭', label: '"I\'ll show them..."', x: 55, y: 60, scale: 1 }], caption: '😤 An employee is passed over for promotion and becomes resentful — a dangerous insider threat begins...' },
      { actors: [{ emoji: '😤', label: 'Insider', x: 15, y: 40, scale: 1.8 }, { emoji: '📁', label: 'Customer Database', x: 45, y: 30, scale: 1.3 }, { emoji: '💾', label: 'USB Drive', x: 45, y: 60, scale: 1.3 }, { emoji: '🕐', label: 'After Hours', x: 78, y: 40, scale: 1.3 }], arrows: [{ from: 0, to: 1, label: 'accesses', color: '#EC4899' }, { from: 1, to: 2, label: 'copies to USB', color: '#EF4444' }], caption: '📁 Late at night, they access files outside their role and copy customer data to a USB drive...' },
      { actors: [{ emoji: '😤', label: 'Ex-Employee', x: 15, y: 40, scale: 1.8 }, { emoji: '📤', label: 'Data Sold', x: 48, y: 40, scale: 1.5 }, { emoji: '🏢', label: 'Competitor', x: 80, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'sells data', color: '#EF4444' }, { from: 1, to: 2, label: 'to competitor', color: '#EF4444' }], caption: '📤 They sell the stolen data to a competitor — months pass before anyone notices the breach!' },
    ],
  },
  'device-security': {
    frames: [
      { actors: [{ emoji: '👤', label: 'Employee', x: 15, y: 40, scale: 1.8 }, { emoji: '💻', label: 'Laptop Open', x: 48, y: 40, scale: 1.8 }, { emoji: '☕', label: 'Goes for Coffee', x: 80, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 2, label: 'leaves laptop unlocked', color: '#14B8A6' }], caption: '☕ The employee leaves their laptop unlocked at a café to get coffee — "I\'ll be right back!"...' },
      { actors: [{ emoji: '🎭', label: 'Thief', x: 20, y: 40, scale: 1.8 }, { emoji: '💻', label: 'Unlocked Laptop', x: 50, y: 40, scale: 1.5 }, { emoji: '💾', label: 'Installing Malware', x: 80, y: 40, scale: 1.3 }], arrows: [{ from: 0, to: 1, label: 'accesses', color: '#EF4444' }, { from: 1, to: 2, label: '30 seconds', color: '#EF4444' }], caption: '🎭 In just 30 seconds, someone installs a keylogger or copies VPN credentials and saved passwords!' },
      { actors: [{ emoji: '🏢', label: 'Company Network', x: 50, y: 30, scale: 1.5 }, { emoji: '🔓', label: 'VPN + Saved Passwords', x: 50, y: 55, scale: 1.3 }, { emoji: '💀', label: 'Full Remote Access', x: 50, y: 78, scale: 1.3 }], arrows: [{ from: 1, to: 0, label: 'grants access', color: '#EF4444' }], caption: '💀 The stolen VPN and passwords give the attacker FULL remote access to the corporate network!' },
    ],
  },
  'safe-browsing': {
    frames: [
      { actors: [{ emoji: '👤', label: 'Employee', x: 15, y: 40, scale: 1.8 }, { emoji: '🔍', label: '"Free PDF Reader"', x: 48, y: 40, scale: 1.3 }, { emoji: '🌐', label: 'Search Results', x: 80, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'searches', color: '#0EA5E9' }], caption: '🔍 The employee searches for "free PDF reader download" — malicious ads appear at the top of results...' },
      { actors: [{ emoji: '👤', label: 'Employee', x: 15, y: 40, scale: 1.8 }, { emoji: '⬇️', label: 'Downloading...', x: 48, y: 40, scale: 1.5 }, { emoji: '🦠', label: 'Trojan Inside!', x: 80, y: 40, scale: 1.5 }], arrows: [{ from: 0, to: 1, label: 'clicks ad', color: '#F97316' }, { from: 1, to: 2, label: 'bundled malware', color: '#EF4444' }], caption: '⬇️ They download from "pdf-reader-free.xyz" — the installer contains a hidden trojan!' },
      { actors: [{ emoji: '🦠', label: 'Keylogger Active', x: 20, y: 30, scale: 1.3 }, { emoji: '⛏️', label: 'Cryptominer', x: 50, y: 30, scale: 1.3 }, { emoji: '🚪', label: 'Backdoor Open', x: 78, y: 30, scale: 1.3 }, { emoji: '💻', label: 'Compromised PC', x: 50, y: 65, scale: 1.5 }], caption: '💀 The trojan installs a keylogger, cryptominer, and backdoor — all running silently in the background!' },
    ],
  },
};

export default function AttackScene({ courseId, color, onComplete }: SceneProps) {
  const [frame, setFrame] = useState(0);
  const [animPhase, setAnimPhase] = useState(0);
  const config = sceneConfigs[courseId] || sceneConfigs['phishing'];
  const totalFrames = config.frames.length;
  const current = config.frames[frame];

  useEffect(() => {
    setAnimPhase(0);
    const t = setTimeout(() => setAnimPhase(1), 300);
    return () => clearTimeout(t);
  }, [frame]);

  const next = () => {
    if (frame < totalFrames - 1) setFrame(f => f + 1);
    else onComplete();
  };
  const prev = () => { if (frame > 0) setFrame(f => f - 1); };

  return (
    <div className="card overflow-hidden">
      {/* Scene viewport */}
      <div className="relative w-full bg-bg/80 border-b border-border" style={{ minHeight: 300 }}>
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Scene number */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: color }}>
            Scene {frame + 1} / {totalFrames}
          </span>
          <span className="text-[10px] text-text-muted">▶ Watch the attack unfold</span>
        </div>

        {/* Actors */}
        <div className="relative w-full" style={{ height: 240, marginTop: 40 }}>
          {current.actors.map((actor, i) => (
            <div
              key={`${frame}-${i}`}
              className="absolute flex flex-col items-center transition-all duration-700 ease-out"
              style={{
                left: `${actor.x}%`,
                top: `${actor.y}%`,
                transform: `translate(-50%, -50%) scale(${animPhase ? 1 : 0.5})`,
                opacity: animPhase ? 1 : 0,
                transitionDelay: `${i * 150}ms`,
              }}
            >
              <span style={{ fontSize: `${(actor.scale || 1) * 28}px` }} className="drop-shadow-lg">{actor.emoji}</span>
              <span className="mt-1 px-2 py-1 rounded text-[10px] font-semibold text-text-primary bg-surface/90 border border-border/50 whitespace-nowrap shadow">
                {actor.label}
              </span>
            </div>
          ))}

          {/* Arrows */}
          {current.arrows?.map((arrow, i) => {
            const from = current.actors[arrow.from];
            const to = current.actors[arrow.to];
            if (!from || !to) return null;
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2 - 8;
            return (
              <div key={`arrow-${frame}-${i}`}>
                {/* Line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: animPhase ? 1 : 0, transition: `opacity 0.5s ease ${(current.actors.length + i) * 150}ms` }}>
                  <line
                    x1={`${from.x}%`} y1={`${from.y}%`}
                    x2={`${to.x}%`} y2={`${to.y}%`}
                    stroke={arrow.color}
                    strokeWidth="2"
                    strokeDasharray={arrow.dashed ? '6 4' : 'none'}
                    markerEnd="url(#arrowhead)"
                    opacity="0.6"
                  />
                  <defs>
                    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill={arrow.color} opacity="0.6" />
                    </marker>
                  </defs>
                </svg>
                {/* Label */}
                {arrow.label && (
                  <div
                    className="absolute px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap"
                    style={{
                      left: `${midX}%`, top: `${midY}%`,
                      transform: 'translate(-50%, -50%)',
                      color: arrow.color,
                      background: `${arrow.color}15`,
                      border: `1px solid ${arrow.color}30`,
                      opacity: animPhase ? 1 : 0,
                      transition: `opacity 0.5s ease ${(current.actors.length + i) * 150 + 200}ms`,
                    }}
                  >
                    {arrow.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Caption */}
      <div className="px-5 py-4 bg-surface">
        <p className="text-sm text-text-secondary leading-relaxed" key={frame}
          style={{ animation: 'fadeIn 0.5s ease both' }}>
          {current.caption}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface/50">
        {/* Progress dots */}
        <div className="flex gap-1.5">
          {config.frames.map((_, i) => (
            <button key={i} onClick={() => setFrame(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === frame ? 'w-5' : ''}`}
              style={{ background: i === frame ? color : '#374151' }} />
          ))}
        </div>
        <div className="flex gap-2">
          {frame > 0 && (
            <button onClick={prev}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-light text-text-secondary hover:text-text-primary transition-all">
              ← Previous
            </button>
          )}
          <button onClick={next}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
            style={{ background: color }}>
            {frame < totalFrames - 1 ? 'Next Scene →' : 'Continue to Simulation →'}
          </button>
        </div>
      </div>
    </div>
  );
}
