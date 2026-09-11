'use client';

import React, { useState } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudUpload, 
  CloudOff, 
  RefreshCw, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  X, 
  Check, 
  ShieldCheck, 
  Sparkles,
  Key
} from 'lucide-react';
import { SyncStatus } from '@/hooks/useStudySync';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SyncStatus;
  lastSyncedAt: Date | null;
  activeProject: string | null;
  onForcePush: () => Promise<{ success: boolean; error?: string }>;
  onForcePull: () => Promise<{ success: boolean; error?: string }>;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  status,
  lastSyncedAt,
  activeProject,
  onForcePush,
  onForcePull,
}) => {
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [showConfigInput, setShowConfigInput] = useState(false);
  const [customConfigStr, setCustomConfigStr] = useState('');

  if (!isOpen) return null;

  const handlePush = async () => {
    setIsPushing(true);
    setActionMessage(null);
    const res = await onForcePush();
    setIsPushing(false);
    if (res.success) {
      setActionMessage({ text: 'Tüm yerel veriler buluta başarıyla yüklendi!', type: 'success' });
    } else {
      setActionMessage({ text: res.error || 'Yükleme başarısız oldu.', type: 'error' });
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    setActionMessage(null);
    const res = await onForcePull();
    setIsPulling(false);
    if (res.success) {
      setActionMessage({ text: 'Buluttaki en güncel veriler cihaza çekildi!', type: 'success' });
    } else {
      setActionMessage({ text: res.error || 'İndirme başarısız oldu.', type: 'error' });
    }
  };

  const handleSaveCustomConfig = () => {
    if (!customConfigStr.trim()) return;
    try {
      // Validate JSON
      const parsed = JSON.parse(customConfigStr.trim());
      localStorage.setItem('schstudy_firebase_config', JSON.stringify(parsed));
      setActionMessage({ text: 'Özel yapılandırma kaydedildi! Sayfa yenileniyor...', type: 'success' });
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch {
      setActionMessage({ text: 'Geçersiz JSON formatı.', type: 'error' });
    }
  };

  const handleResetToDefault = () => {
    localStorage.removeItem('schstudy_firebase_config');
    setActionMessage({ text: 'Varsayılan The Sch Suite projesine dönüldü! Yenileniyor...', type: 'success' });
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#121217] border border-[#272730] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-indigo-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#23232a] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Bulut Senkronizasyonu
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Firestore
                </span>
              </h2>
              <p className="text-xs text-zinc-400">PC & Mobil (S23 FE) Arası Gerçek Zamanlı Eşitlik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1c1c24] hover:bg-[#272732] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Card */}
        <div className="p-4 rounded-2xl bg-[#09090b] border border-[#23232a] mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {status === 'synced' ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CloudCheck className="w-5 h-5" />
              </div>
            ) : status === 'syncing' ? (
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-pulse">
                <CloudUpload className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                <CloudOff className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {status === 'synced' && <span className="text-emerald-400">Canlı Bağlantı Aktif</span>}
                {status === 'syncing' && <span className="text-amber-400">Bulutla Eşitleniyor...</span>}
                {status === 'offline' && <span className="text-zinc-400">Yerel Mod (Çevrimdışı)</span>}
                {status === 'idle' && <span className="text-zinc-400">Beklemede</span>}
              </div>
              <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Proje: <span className="text-zinc-300">{activeProject || 'Otomatik'}</span> • 
                Son Senkron: <span className="text-zinc-300">{lastSyncedAt ? lastSyncedAt.toLocaleTimeString('tr-TR') : 'Henüz yapılmadı'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Message Banner */}
        {actionMessage && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-medium border flex items-center gap-2 ${
            actionMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <Check className="w-4 h-4 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Manual Sync Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={handlePush}
            disabled={isPushing || isPulling}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#181820] hover:bg-[#20202c] border border-[#2b2b38] hover:border-indigo-500/40 text-left transition-all group disabled:opacity-50"
          >
            <div className="w-full flex items-center justify-between mb-1.5">
              <ArrowUpCircle className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                L ➔ Cloud
              </span>
            </div>
            <div className="w-full text-xs font-bold text-white">Yerel Veriyi Yükle</div>
            <div className="w-full text-[10px] text-zinc-400 mt-0.5">Bu cihazdaki tüm net ve denemeleri buluta aktarır.</div>
          </button>

          <button
            onClick={handlePull}
            disabled={isPushing || isPulling}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#181820] hover:bg-[#20202c] border border-[#2b2b38] hover:border-emerald-500/40 text-left transition-all group disabled:opacity-50"
          >
            <div className="w-full flex items-center justify-between mb-1.5">
              <ArrowDownCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                Cloud ➔ L
              </span>
            </div>
            <div className="w-full text-xs font-bold text-white">Buluttan İndir</div>
            <div className="w-full text-[10px] text-zinc-400 mt-0.5">Telefonda/PC'de eksik olan bulut verisini çeker.</div>
          </button>
        </div>

        {/* Feature Explanations */}
        <div className="p-3.5 rounded-2xl bg-[#16161d] border border-[#24242e] mb-5 text-[11px] text-zinc-400 space-y-1.5">
          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Otomatik Çift Yönlü Canlı Senkron:</span>
          </div>
          <p>
            • PC veya telefonda bir deneme girdiğinde, soru çözdüğünde veya Writing/Speaking yaptığında veriler arka planda otomatik olarak buluta yedeklenir.
          </p>
          <p>
            • İnternet kesilse bile uygulama çevrimdışı çalışmaya devam eder; bağlantı geldiği an kaldığı yerden eşitlenir.
          </p>
        </div>

        {/* Advanced Config Toggle */}
        <div className="border-t border-[#23232a] pt-4">
          <button
            onClick={() => setShowConfigInput(!showConfigInput)}
            className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showConfigInput ? 'Özel Yapılandırmayı Gizle' : 'Özel Firebase Projesi Kullan (Gelişmiş)'}</span>
          </button>

          {showConfigInput && (
            <div className="mt-3 space-y-2 animate-in fade-in duration-150">
              <textarea
                value={customConfigStr}
                onChange={(e) => setCustomConfigStr(e.target.value)}
                placeholder='{"apiKey": "...", "projectId": "..."}'
                rows={3}
                className="w-full p-2.5 rounded-xl bg-[#09090b] border border-[#2c2c38] text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveCustomConfig}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Kaydet & Bağlan
                </button>
                <button
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 rounded-lg bg-[#20202a] hover:bg-[#282834] text-zinc-300 text-xs font-medium transition-colors"
                >
                  Varsayılana Sıfırla
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
