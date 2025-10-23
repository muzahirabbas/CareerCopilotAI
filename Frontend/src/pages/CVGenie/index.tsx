
import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

import { CvForm } from './CvForm';
import { CvEditor } from './CvEditor';
import { ProgressDisplay } from '../../components/ui/ProgressDisplay';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

import { AppStatus, CuratedCVData, ProfilePhoto, AppSettings } from '../../lib/types';

interface CVGenieProps {
  settings: AppSettings;
}

const CVGenie: React.FC<CVGenieProps> = ({ settings }) => {
  useTheme(); // Initialize theme
  
  const [appStatus, setAppStatus] = useState<AppStatus>('idle');
  const [curatedData, setCuratedData] = useLocalStorage<CuratedCVData | null>('cv-genie-curatedData', null);
  const [extractedData, setExtractedData] = useLocalStorage<any | null>('cv-genie-extractedData', null);
  const [profilePhoto, setProfilePhoto] = useLocalStorage<ProfilePhoto | null>('cv-genie-profilePhoto', null);
  const [progress, setProgress] = useState({ percentage: 0, text: '' });
  const [error, setError] = useState<string | null>(null);

  const updateProgress = (percentage: number, text: string) => {
    setProgress({ percentage, text });
  };
  
  const handleStartOver = () => {
    setCuratedData(null);
    setExtractedData(null);
    setProfilePhoto(null);

    setAppStatus('idle');
    setError(null);
    setProgress({ percentage: 0, text: '' });
  };

  return (
    <div className="font-sans">
        <header className="relative py-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                CV Genie ✨
            </h1>
            <p className="max-w-xl mx-auto mt-2 text-lg text-muted-foreground">
                Craft a professional, ATS-friendly CV from your LinkedIn profile in seconds.
            </p>
        </header>
        <main className="container max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={appStatus}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {appStatus === 'idle' && (
                <CvForm
                  settings={settings}
                  extractedData={extractedData}
                  setAppStatus={setAppStatus}
                  setCuratedData={setCuratedData}
                  setExtractedData={setExtractedData}
                  setProfilePhoto={setProfilePhoto}
                  updateProgress={updateProgress}
                  onError={setError}
                />
              )}

              {appStatus === 'processing' && (
                <ProgressDisplay percentage={progress.percentage} text={progress.text} />
              )}

              {appStatus === 'editing' && curatedData && (
                <CvEditor
                  settings={settings}
                  initialData={curatedData}
                  extractedData={extractedData}
                  setCuratedData={setCuratedData}
                  profilePhoto={profilePhoto}
                  onStartOver={handleStartOver}
                  onError={setError}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <ErrorMessage message={error} />
        </main>
    </div>
  );
}

export default CVGenie;
