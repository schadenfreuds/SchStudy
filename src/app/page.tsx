'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mode, 
  RankProfile, 
  ScoreCard, 
  BossQuestion, 
  IeltsMockTest, 
  IeltsWordCard,
  IeltsWritingSubmission,
  IeltsSpeakingSubmission 
} from '@/types/study';
import { 
  getStoredMode, 
  saveStoredMode, 
  getStoredProfile, 
  saveStoredProfile, 
  getStoredScoreCards, 
  saveStoredScoreCards, 
  getStoredBosses, 
  saveStoredBosses, 
  getStoredIeltsTests, 
  saveStoredIeltsTests, 
  getStoredIeltsWords, 
  saveStoredIeltsWords,
  getStoredIeltsWritings,
  saveStoredIeltsWritings,
  getStoredIeltsSpeakings,
  saveStoredIeltsSpeakings 
} from '@/lib/storage';

// Components
import { Header } from '@/components/common/Header';
import { SuiteDrawer } from '@/components/common/SuiteDrawer';
import { BottomNav, YksTab, IeltsTab } from '@/components/common/BottomNav';

// YKS Views
import { SummonerHub } from '@/components/yks/SummonerHub';
import { ArenaTab } from '@/components/yks/ArenaTab';
import { GrindTimer } from '@/components/yks/GrindTimer';
import { BossVaultTab } from '@/components/yks/BossVaultTab';
import { ReportTab } from '@/components/yks/ReportTab';

// IELTS Views
import { IeltsDashboard } from '@/components/ielts/IeltsDashboard';
import { MockTestsTab } from '@/components/ielts/MockTestsTab';
import { WritingLabTab } from '@/components/ielts/WritingLabTab';
import { SpeakingLabTab } from '@/components/ielts/SpeakingLabTab';
import { LexiconTab } from '@/components/ielts/LexiconTab';
import { ExamTimers } from '@/components/ielts/ExamTimers';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  // App State
  const [mode, setMode] = useState<Mode>('yks');
  const [yksTab, setYksTab] = useState<YksTab>('summoner');
  const [ieltsTab, setIeltsTab] = useState<IeltsTab>('overview');
  const [isSuiteOpen, setIsSuiteOpen] = useState(false);

  // Data State
  const [profile, setProfile] = useState<RankProfile>(getStoredProfile());
  const [scoreCards, setScoreCards] = useState<ScoreCard[]>([]);
  const [bosses, setBosses] = useState<BossQuestion[]>([]);
  const [ieltsTests, setIeltsTests] = useState<IeltsMockTest[]>([]);
  const [ieltsWords, setIeltsWords] = useState<IeltsWordCard[]>([]);
  const [ieltsWritings, setIeltsWritings] = useState<IeltsWritingSubmission[]>([]);
  const [ieltsSpeakings, setIeltsSpeakings] = useState<IeltsSpeakingSubmission[]>([]);

  // Hydrate on mount
  useEffect(() => {
    setIsClient(true);
    setMode(getStoredMode());
    setProfile(getStoredProfile());
    setScoreCards(getStoredScoreCards());
    setBosses(getStoredBosses());
    setIeltsTests(getStoredIeltsTests());
    setIeltsWords(getStoredIeltsWords());
    setIeltsWritings(getStoredIeltsWritings());
    setIeltsSpeakings(getStoredIeltsSpeakings());
  }, []);

  // Mode Change Handler
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    saveStoredMode(newMode);
  };

  // Data Update Handlers
  const handleUpdateProfile = (newProfile: RankProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
  };

  const handleUpdateScoreCards = (newCards: ScoreCard[]) => {
    setScoreCards(newCards);
    saveStoredScoreCards(newCards);
  };

  const handleUpdateBosses = (newBosses: BossQuestion[]) => {
    setBosses(newBosses);
    saveStoredBosses(newBosses);
  };

  const handleUpdateIeltsTests = (newTests: IeltsMockTest[]) => {
    setIeltsTests(newTests);
    saveStoredIeltsTests(newTests);
  };

  const handleUpdateIeltsWords = (newWords: IeltsWordCard[]) => {
    setIeltsWords(newWords);
    saveStoredIeltsWords(newWords);
  };

  const handleSaveWritingSubmission = (newSub: IeltsWritingSubmission) => {
    const updated = [newSub, ...ieltsWritings];
    setIeltsWritings(updated);
    saveStoredIeltsWritings(updated);
  };

  const handleSaveSpeakingSubmission = (newSub: IeltsSpeakingSubmission) => {
    const updated = [newSub, ...ieltsSpeakings];
    setIeltsSpeakings(updated);
    saveStoredIeltsSpeakings(updated);
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        mode={mode}
        onModeChange={handleModeChange}
        streak={profile.streak}
        onOpenSuite={() => setIsSuiteOpen(true)}
        yksTab={yksTab}
        onSelectYksTab={setYksTab}
        ieltsTab={ieltsTab}
        onSelectIeltsTab={setIeltsTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {mode === 'yks' ? (
          <>
            {yksTab === 'summoner' && (
              <SummonerHub
                profile={profile}
                scoreCards={scoreCards}
                onNavigateToArena={() => setYksTab('arena')}
                onNavigateToGrind={() => setYksTab('grind')}
              />
            )}
            {yksTab === 'arena' && (
              <ArenaTab
                scoreCards={scoreCards}
                profile={profile}
                onUpdateScoreCards={handleUpdateScoreCards}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
            {yksTab === 'grind' && (
              <GrindTimer
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
            {yksTab === 'bosses' && (
              <BossVaultTab
                bosses={bosses}
                profile={profile}
                onUpdateBosses={handleUpdateBosses}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
            {yksTab === 'report' && (
              <ReportTab
                scoreCards={scoreCards}
                profile={profile}
                bosses={bosses}
              />
            )}
          </>
        ) : (
          <>
            {ieltsTab === 'overview' && (
              <IeltsDashboard
                tests={ieltsTests}
                onNavigateToMocks={() => setIeltsTab('mocks')}
                onNavigateToLexicon={() => setIeltsTab('lexicon')}
                onNavigateToWriting={() => setIeltsTab('writing')}
                onNavigateToSpeaking={() => setIeltsTab('speaking')}
                latestWritingBand={ieltsWritings.length > 0 ? ieltsWritings[0].analysis?.overallBand : undefined}
                latestSpeakingBand={ieltsSpeakings.length > 0 ? ieltsSpeakings[0].analysis?.overallBand : undefined}
              />
            )}
            {ieltsTab === 'mocks' && (
              <MockTestsTab
                tests={ieltsTests}
                onUpdateTests={handleUpdateIeltsTests}
              />
            )}
            {ieltsTab === 'writing' && (
              <WritingLabTab
                onSaveSubmission={handleSaveWritingSubmission}
                savedSubmissions={ieltsWritings}
              />
            )}
            {ieltsTab === 'speaking' && (
              <SpeakingLabTab
                onSaveSubmission={handleSaveSpeakingSubmission}
                savedSubmissions={ieltsSpeakings}
              />
            )}
            {ieltsTab === 'lexicon' && (
              <LexiconTab
                words={ieltsWords}
                onUpdateWords={handleUpdateIeltsWords}
              />
            )}
            {ieltsTab === 'timers' && <ExamTimers />}
          </>
        )}
      </main>

      {/* The Sch Suite Drawer */}
      <SuiteDrawer
        isOpen={isSuiteOpen}
        onClose={() => setIsSuiteOpen(false)}
      />

      {/* Context-Aware Bottom Navigation */}
      <BottomNav
        mode={mode}
        yksTab={yksTab}
        onSelectYksTab={setYksTab}
        ieltsTab={ieltsTab}
        onSelectIeltsTab={setIeltsTab}
      />
    </div>
  );
}
