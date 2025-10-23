import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppSettings } from './lib/types';

import Sidebar from './components/layout/Sidebar';
import MainContent from './components/layout/MainContent';
import { Toaster } from 'react-hot-toast';

import CVGenie from './pages/CVGenie';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import ApplyAssist from './pages/ApplyAssist';
import ReachyAI from './pages/ReachyAI';
import Settings from './pages/Settings';

export type AppName = 'CVGenie' | 'CoverLetterGenerator' | 'ApplyAssist' | 'ReachyAI' | 'Settings';

const App = () => {
  const [activeApp, setActiveApp] = useState<AppName>('CVGenie');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Changed from 'isSidebarCollapsed'
  const [settings, setSettings] = useLocalStorage<AppSettings>('ai-career-copilot-settings', {
    geminiApiKey: '',
    userName: '',
    githubLink: '',
    websiteLink: '',
    linkedinLink: '',
    coverLetterModel: 'gemini-2.5-flash',
    cvGenieModel: 'gemini-2.5-flash',
  });

  const renderActiveApp = () => {
    switch (activeApp) {
      case 'CVGenie':
        return <CVGenie settings={settings} />;
      case 'CoverLetterGenerator':
        return <CoverLetterGenerator settings={settings} setSettings={setSettings} />;
      case 'ApplyAssist':
        return <ApplyAssist settings={settings} />;
      case 'ReachyAI':
        return <ReachyAI settings={settings} />;
      case 'Settings':
        return <Settings settings={settings} setSettings={setSettings} />;
      default:
        return <CVGenie settings={settings} />;
    }
  };

  return (
    <div className="h-screen bg-background text-foreground font-sans antialiased">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Overlay for when the sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 transition-opacity animate-in fade-in-0"
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        activeApp={activeApp} 
        setActiveApp={setActiveApp} 
      />
      
      <MainContent setIsSidebarOpen={setIsSidebarOpen}>
        {renderActiveApp()}
      </MainContent>
    </div>
  );
};

export default App;