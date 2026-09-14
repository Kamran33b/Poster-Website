import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Terminal, 
  User, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink, 
  Cpu, 
  Layers, 
  Activity, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Server,
  Zap,
  Globe,
  Database,
  Smartphone
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface DeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeveloperModal: React.FC<DeveloperModalProps> = ({ isOpen, onClose }) => {
  const { products, categories, realtimeStatus, settings } = useStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'tech' | 'telemetry'>('profile');
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  // Health check state
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'error'>('idle');
  const [pingLatency, setPingLatency] = useState<number | null>(null);
  const [healthData, setHealthData] = useState<any>(null);

  const developerEmail = 'ktechwith@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handlePingHealth = async () => {
    setPingStatus('pinging');
    const start = performance.now();
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      const latency = Math.round(performance.now() - start);
      setPingLatency(latency);
      setHealthData(data);
      setPingStatus('success');
    } catch (err) {
      setPingStatus('error');
    }
  };

  useEffect(() => {
    if (isOpen) {
      handlePingHealth();
      // Lock background scroll
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          id="developer-modal-root"
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          style={{ zIndex: 2147483647 }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-md"
            style={{ zIndex: 2147483647 }}
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
            style={{ zIndex: 2147483647 }}
          >
            {/* Header */}
            <div className="p-5 sm:p-6 bg-stone-950 text-white flex items-start justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg sm:text-xl font-bold tracking-wide text-white">
                    Developer Details
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Architect
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  Lumina Fine Art Posters Platform • System Specifications
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-900 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-stone-200 bg-stone-50/80 px-5 pt-3 gap-2">
            {[
              { id: 'profile', label: 'Developer Profile', icon: User },
              { id: 'tech', label: 'Tech Stack & Architecture', icon: Layers },
              { id: 'telemetry', label: 'Live Telemetry & Diagnostics', icon: Activity },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 -mb-px select-none cursor-pointer ${
                    isSelected
                      ? 'bg-white text-stone-900 border-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-800 border-transparent hover:bg-stone-100/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-stone-800">
            {/* TAB 1: PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-5">
                {/* Developer Profile Card */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white flex items-center justify-center font-display text-2xl font-bold tracking-wider shadow-md border-2 border-white">
                      KS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base sm:text-lg font-bold text-stone-950">
                          Kamran Sadiq
                        </h4>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Lead Developer
                        </span>
                      </div>
                      <p className="text-xs font-medium text-stone-500 mt-0.5">
                        Full-Stack Software Engineer & UI/UX Architect
                      </p>
                      <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-stone-400" />
                        <span>High-Performance E-Commerce & Real-time Web Apps</span>
                      </p>
                    </div>
                  </div>

                  {/* Quick Contact Action */}
                  <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                    <a
                      href={`mailto:${developerEmail}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Contact Developer</span>
                    </a>
                  </div>
                </div>

                {/* Contact & Credentials Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Email block */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                          Direct Email
                        </div>
                        <div className="text-xs font-semibold text-stone-900 truncate">
                          {developerEmail}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors shrink-0 ml-2"
                      title="Copy Email"
                    >
                      {copiedEmail ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Role block */}
                  <div className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                        Specialization
                      </div>
                      <div className="text-xs font-semibold text-stone-900">
                        React 18 • Node.js • Motion UI
                      </div>
                    </div>
                  </div>
                </div>

                {/* About the Engineering */}
                <div className="p-4 rounded-xl bg-stone-50/60 border border-stone-200/80 text-xs space-y-2">
                  <div className="font-semibold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Engineering Philosophy</span>
                  </div>
                  <p className="text-stone-600 leading-relaxed">
                    Designed and built with an obsession for optical harmony, typographic hierarchy, and tactile spring micro-interactions. Includes full-stack server state synchronization via Server-Sent Events (SSE), multi-currency calculation engines, framing visualizer modules, and an OTP-secured Admin Control Portal.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: TECH STACK & ARCHITECTURE */}
            {activeTab === 'tech' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Client Stack */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <Smartphone className="w-4 h-4 text-amber-600" />
                      <span>Frontend & Client Architecture</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-stone-600">
                      <li className="flex items-center justify-between">
                        <span>Framework:</span>
                        <span className="font-mono font-semibold text-stone-900">React 18 + Vite 5</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Language:</span>
                        <span className="font-mono font-semibold text-stone-900">TypeScript (Strict)</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Styling:</span>
                        <span className="font-mono font-semibold text-stone-900">Tailwind CSS</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Animations:</span>
                        <span className="font-mono font-semibold text-stone-900">Motion / Framer Motion</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Icons:</span>
                        <span className="font-mono font-semibold text-stone-900">Lucide React</span>
                      </li>
                    </ul>
                  </div>

                  {/* Backend Stack */}
                  <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2.5">
                    <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                      <Server className="w-4 h-4 text-amber-600" />
                      <span>Backend & Real-Time Engine</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-stone-600">
                      <li className="flex items-center justify-between">
                        <span>Runtime:</span>
                        <span className="font-mono font-semibold text-stone-900">Node.js / Express</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Real-Time Sync:</span>
                        <span className="font-mono font-semibold text-emerald-600">SSE Event Stream</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Data Persistence:</span>
                        <span className="font-mono font-semibold text-stone-900">Durable JSON Store</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Security:</span>
                        <span className="font-mono font-semibold text-stone-900">Admin OTP + Session Hash</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Port Ingress:</span>
                        <span className="font-mono font-semibold text-stone-900">Port 3000 (Proxy)</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Key Features Built */}
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Core Platform Capabilities
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Live multi-size & frame price multiplier calculation</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Multi-currency real-time conversion (INR, USD, EUR, GBP)</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Password + OTP protected admin control portal</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>Real-time SSE event bus for instant catalog updates</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TELEMETRY & DIAGNOSTICS */}
            {activeTab === 'telemetry' && (
              <div className="space-y-4">
                {/* Live Health Ping Section */}
                <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-stone-900">API Health Probe (`/api/health`)</span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePingHealth}
                      disabled={pingStatus === 'pinging'}
                      className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <span>Ping Health</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">API Status</div>
                      <div className="font-mono font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {pingStatus === 'pinging' ? 'Testing...' : '200 OK'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-stone-200">
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">Roundtrip Latency</div>
                      <div className="font-mono font-bold text-stone-900 mt-0.5">
                        {pingLatency !== null ? `${pingLatency} ms` : '—'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-stone-200 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-stone-400 font-semibold uppercase">Realtime Stream</div>
                      <div className="font-mono font-bold text-stone-900 mt-0.5 capitalize">
                        {realtimeStatus}
                      </div>
                    </div>
                  </div>

                  {healthData && (
                    <div className="p-2.5 rounded-lg bg-stone-900 text-stone-300 font-mono text-[11px] overflow-x-auto">
                      <pre>{JSON.stringify(healthData, null, 2)}</pre>
                    </div>
                  )}
                </div>

                {/* Current Store State Telemetry */}
                <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-2">
                  <div className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Store Metrics & State
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-[10px] text-stone-400 block">Catalog Products</span>
                      <span className="font-bold text-stone-900 text-sm">{products.length}</span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-[10px] text-stone-400 block">Categories</span>
                      <span className="font-bold text-stone-900 text-sm">{categories.length}</span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-[10px] text-stone-400 block">Currency</span>
                      <span className="font-bold text-stone-900 text-sm">{settings.currency || 'INR'} ({settings.currencySymbol || '₹'})</span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-[10px] text-stone-400 block">Active Exchange Rate</span>
                      <span className="font-bold text-stone-900 text-sm">{settings.currencyRate || 83.5}x</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-100/80 border-t border-stone-200 flex items-center justify-between text-xs">
            <span className="text-stone-500 font-mono text-[11px]">
              Lumina Studio • Crafted by Kamran Sadiq ({developerEmail})
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
