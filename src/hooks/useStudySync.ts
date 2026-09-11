'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  StudySyncData, 
  pushStudyDataToCloud, 
  fetchStudyDataFromCloud, 
  subscribeToStudyData, 
  getCurrentFirebaseProject 
} from '@/lib/firebase';
import { 
  RankProfile, 
  ScoreCard, 
  BossQuestion, 
  IeltsMockTest, 
  IeltsWordCard, 
  IeltsWritingSubmission, 
  IeltsSpeakingSubmission, 
  Mode 
} from '@/types/study';
import {
  saveStoredMode,
  saveStoredProfile,
  saveStoredScoreCards,
  saveStoredBosses,
  saveStoredIeltsTests,
  saveStoredIeltsWords,
  saveStoredIeltsWritings,
  saveStoredIeltsSpeakings,
} from '@/lib/storage';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface UseStudySyncProps {
  mode: Mode;
  profile: RankProfile;
  scoreCards: ScoreCard[];
  bosses: BossQuestion[];
  ieltsTests: IeltsMockTest[];
  ieltsWords: IeltsWordCard[];
  ieltsWritings: IeltsWritingSubmission[];
  ieltsSpeakings: IeltsSpeakingSubmission[];
  setMode: (m: Mode) => void;
  setProfile: (p: RankProfile) => void;
  setScoreCards: (c: ScoreCard[]) => void;
  setBosses: (b: BossQuestion[]) => void;
  setIeltsTests: (t: IeltsMockTest[]) => void;
  setIeltsWords: (w: IeltsWordCard[]) => void;
  setIeltsWritings: (w: IeltsWritingSubmission[]) => void;
  setIeltsSpeakings: (s: IeltsSpeakingSubmission[]) => void;
}

export function useStudySync({
  mode,
  profile,
  scoreCards,
  bosses,
  ieltsTests,
  ieltsWords,
  ieltsWritings,
  ieltsSpeakings,
  setMode,
  setProfile,
  setScoreCards,
  setBosses,
  setIeltsTests,
  setIeltsWords,
  setIeltsWritings,
  setIeltsSpeakings,
}: UseStudySyncProps) {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isIncomingCloudUpdateRef = useRef(false);
  const lastCloudUpdatedRef = useRef<string | null>(null);

  // Initialize active project
  useEffect(() => {
    setActiveProject(getCurrentFirebaseProject());
  }, []);

  // Initial Sync from Cloud on mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function initSync() {
      setStatus('syncing');
      try {
        const cloudData = await fetchStudyDataFromCloud();
        if (cloudData) {
          isIncomingCloudUpdateRef.current = true;
          lastCloudUpdatedRef.current = cloudData.updatedAt || null;

          if (cloudData.mode) {
            setMode(cloudData.mode);
            saveStoredMode(cloudData.mode);
          }
          if (cloudData.profile) {
            setProfile(cloudData.profile);
            saveStoredProfile(cloudData.profile);
          }
          if (cloudData.scoreCards && cloudData.scoreCards.length > 0) {
            setScoreCards(cloudData.scoreCards);
            saveStoredScoreCards(cloudData.scoreCards);
          }
          if (cloudData.bosses && cloudData.bosses.length > 0) {
            setBosses(cloudData.bosses);
            saveStoredBosses(cloudData.bosses);
          }
          if (cloudData.ieltsTests) {
            setIeltsTests(cloudData.ieltsTests);
            saveStoredIeltsTests(cloudData.ieltsTests);
          }
          if (cloudData.ieltsWords && cloudData.ieltsWords.length > 0) {
            setIeltsWords(cloudData.ieltsWords);
            saveStoredIeltsWords(cloudData.ieltsWords);
          }
          if (cloudData.ieltsWritings) {
            setIeltsWritings(cloudData.ieltsWritings);
            saveStoredIeltsWritings(cloudData.ieltsWritings);
          }
          if (cloudData.ieltsSpeakings) {
            setIeltsSpeakings(cloudData.ieltsSpeakings);
            saveStoredIeltsSpeakings(cloudData.ieltsSpeakings);
          }

          setLastSyncedAt(cloudData.updatedAt ? new Date(cloudData.updatedAt) : new Date());
          setStatus('synced');
          setTimeout(() => {
            isIncomingCloudUpdateRef.current = false;
          }, 500);
        } else {
          // Cloud is empty, push local state to cloud as baseline
          await pushStudyDataToCloud({
            mode,
            profile,
            scoreCards,
            bosses,
            ieltsTests,
            ieltsWords,
            ieltsWritings,
            ieltsSpeakings,
          });
          setLastSyncedAt(new Date());
          setStatus('synced');
        }

        // Setup real-time listener for cross-device updates
        unsubscribe = subscribeToStudyData(
          (incoming) => {
            if (!incoming) return;
            if (incoming.updatedAt && incoming.updatedAt === lastCloudUpdatedRef.current) {
              return;
            }

            isIncomingCloudUpdateRef.current = true;
            lastCloudUpdatedRef.current = incoming.updatedAt || null;

            if (incoming.mode) {
              setMode(incoming.mode);
              saveStoredMode(incoming.mode);
            }
            if (incoming.profile) {
              setProfile(incoming.profile);
              saveStoredProfile(incoming.profile);
            }
            if (incoming.scoreCards) {
              setScoreCards(incoming.scoreCards);
              saveStoredScoreCards(incoming.scoreCards);
            }
            if (incoming.bosses) {
              setBosses(incoming.bosses);
              saveStoredBosses(incoming.bosses);
            }
            if (incoming.ieltsTests) {
              setIeltsTests(incoming.ieltsTests);
              saveStoredIeltsTests(incoming.ieltsTests);
            }
            if (incoming.ieltsWords) {
              setIeltsWords(incoming.ieltsWords);
              saveStoredIeltsWords(incoming.ieltsWords);
            }
            if (incoming.ieltsWritings) {
              setIeltsWritings(incoming.ieltsWritings);
              saveStoredIeltsWritings(incoming.ieltsWritings);
            }
            if (incoming.ieltsSpeakings) {
              setIeltsSpeakings(incoming.ieltsSpeakings);
              saveStoredIeltsSpeakings(incoming.ieltsSpeakings);
            }

            setLastSyncedAt(incoming.updatedAt ? new Date(incoming.updatedAt) : new Date());
            setStatus('synced');
            setTimeout(() => {
              isIncomingCloudUpdateRef.current = false;
            }, 500);
          },
          (err) => {
            console.warn('Real-time sync error:', err);
            setStatus('offline');
          }
        );
      } catch (err: unknown) {
        console.warn('Firestore initial sync failed:', err);
        setStatus('offline');
        setErrorMessage(err instanceof Error ? err.message : 'Bağlantı hatası');
      }
    }

    initSync();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Debounced auto-push when local state changes
  const triggerAutoPush = useCallback((payload: StudySyncData) => {
    if (isIncomingCloudUpdateRef.current) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setStatus('syncing');
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const nowIso = new Date().toISOString();
        lastCloudUpdatedRef.current = nowIso;
        const ok = await pushStudyDataToCloud({
          ...payload,
          updatedAt: nowIso,
        });
        if (ok) {
          setStatus('synced');
          setLastSyncedAt(new Date());
          setErrorMessage(null);
        } else {
          setStatus('offline');
        }
      } catch (err: unknown) {
        console.warn('Push to cloud error:', err);
        setStatus('offline');
        setErrorMessage(err instanceof Error ? err.message : 'Yazma hatası');
      }
    }, 1200);
  }, []);

  // Manual Force Push (Local -> Cloud)
  const forcePushToCloud = async () => {
    setStatus('syncing');
    try {
      const nowIso = new Date().toISOString();
      lastCloudUpdatedRef.current = nowIso;
      const ok = await pushStudyDataToCloud({
        mode,
        profile,
        scoreCards,
        bosses,
        ieltsTests,
        ieltsWords,
        ieltsWritings,
        ieltsSpeakings,
        updatedAt: nowIso,
      });
      if (ok) {
        setStatus('synced');
        setLastSyncedAt(new Date());
        return { success: true };
      }
      setStatus('offline');
      return { success: false, error: 'Buluta yazılamadı' };
    } catch (err: unknown) {
      setStatus('offline');
      const msg = err instanceof Error ? err.message : 'Hata';
      return { success: false, error: msg };
    }
  };

  // Manual Force Pull (Cloud -> Local)
  const forcePullFromCloud = async () => {
    setStatus('syncing');
    try {
      const cloudData = await fetchStudyDataFromCloud();
      if (cloudData) {
        isIncomingCloudUpdateRef.current = true;
        if (cloudData.mode) { setMode(cloudData.mode); saveStoredMode(cloudData.mode); }
        if (cloudData.profile) { setProfile(cloudData.profile); saveStoredProfile(cloudData.profile); }
        if (cloudData.scoreCards) { setScoreCards(cloudData.scoreCards); saveStoredScoreCards(cloudData.scoreCards); }
        if (cloudData.bosses) { setBosses(cloudData.bosses); saveStoredBosses(cloudData.bosses); }
        if (cloudData.ieltsTests) { setIeltsTests(cloudData.ieltsTests); saveStoredIeltsTests(cloudData.ieltsTests); }
        if (cloudData.ieltsWords) { setIeltsWords(cloudData.ieltsWords); saveStoredIeltsWords(cloudData.ieltsWords); }
        if (cloudData.ieltsWritings) { setIeltsWritings(cloudData.ieltsWritings); saveStoredIeltsWritings(cloudData.ieltsWritings); }
        if (cloudData.ieltsSpeakings) { setIeltsSpeakings(cloudData.ieltsSpeakings); saveStoredIeltsSpeakings(cloudData.ieltsSpeakings); }

        setStatus('synced');
        setLastSyncedAt(cloudData.updatedAt ? new Date(cloudData.updatedAt) : new Date());
        setTimeout(() => { isIncomingCloudUpdateRef.current = false; }, 500);
        return { success: true };
      }
      setStatus('offline');
      return { success: false, error: 'Bulutta veri bulunamadı' };
    } catch (err: unknown) {
      setStatus('offline');
      const msg = err instanceof Error ? err.message : 'Hata';
      return { success: false, error: msg };
    }
  };

  return {
    status,
    lastSyncedAt,
    activeProject,
    errorMessage,
    triggerAutoPush,
    forcePushToCloud,
    forcePullFromCloud,
  };
}
