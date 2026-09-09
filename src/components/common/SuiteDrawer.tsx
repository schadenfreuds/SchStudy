'use client';

import React from 'react';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';

interface SuiteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SuiteApp {
  name: string;
  module: string;
  desc: string;
  badge: string;
  color: string;
  accent: string;
  isCurrent?: boolean;
  link?: string;
}

const SUITE_APPS: SuiteApp[] = [
  {
    name: 'SchBudget',
    module: 'Aile & Kişisel Bütçe',
    desc: 'Harcama pusulası, sabit faturalar, Excel & Firestore',
    badge: 'Yayında (v4)',
    color: 'from-emerald-500/20 to-emerald-600/5',
    accent: '#10b981',
    link: 'https://github.com/schadenfreuds/SchBudget',
  },
  {
    name: 'SchFit',
    module: 'Beden & 92➔75kg Dönüşüm',
    desc: 'Ağırlık/Set, Room DB, Gemini AI ışık algoritması',
    badge: 'Yayında (v1)',
    color: 'from-amber-500/20 to-amber-600/5',
    accent: '#f59e0b',
    link: 'https://github.com/schadenfreuds/SchFit',
  },
  {
    name: 'SchStudy',
    module: 'YKS 50k & IELTS 7.0+',
    desc: 'LoL Rank ELO, AI karne tarayıcı, Boss Vault, etüt sayacı',
    badge: 'Aktif Modül',
    color: 'from-indigo-500/20 to-indigo-600/5',
    accent: '#6366f1',
    isCurrent: true,
  },
  {
    name: 'SchBrain',
    module: 'CanOS Vault & HUD',
    desc: 'Cepteki Sch, hızlı düşünce yakalama, VDS otopilot',
    badge: 'Sırada',
    color: 'from-cyan-500/20 to-cyan-600/5',
    accent: '#06b6d4',
  },
];

export const SuiteDrawer: React.FC<SuiteDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-all animate-in fade-in">
      <div 
        className="w-full max-w-sm rounded-3xl bg-[#0e0e12] border border-[#2b2b36] shadow-2xl p-5 overflow-hidden flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#23232a] pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-tight">The Sch Suite Ekosistemi</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Can ve Sch ortaklığıyla üretilen, hayatın 4 ana damarını yöneten mikro-SaaS ailesi.
        </p>

        {/* Apps List */}
        <div className="flex flex-col gap-2.5">
          {SUITE_APPS.map((app) => (
            <div
              key={app.name}
              className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden bg-gradient-to-r ${app.color} ${
                app.isCurrent
                  ? 'border-indigo-500/50 shadow-md shadow-indigo-500/10'
                  : 'border-[#23232a] hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: app.accent }}
                  />
                  <span className="font-extrabold text-sm text-white">{app.name}</span>
                </div>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: `${app.accent}20`,
                    color: app.accent,
                    borderColor: `${app.accent}40`,
                  }}
                >
                  {app.badge}
                </span>
              </div>

              <div className="mt-1">
                <div className="text-xs font-semibold text-zinc-300">{app.module}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">{app.desc}</div>
              </div>

              {app.link && (
                <a
                  href={app.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-zinc-300 hover:text-white transition-colors"
                >
                  <span>GitHub'da Görüntüle</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition-colors mt-1"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};
