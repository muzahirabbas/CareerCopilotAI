import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

// Define the type for the browser's install prompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWAButton = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault(); // Prevent the mini-infobar from appearing on mobile
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA installation');
    } else {
      console.log('User dismissed the PWA installation');
    }
    // The prompt can only be used once, so we clear it
    setInstallPrompt(null);
  };

  // If there's no install prompt, don't render the button
  if (!installPrompt) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="w-full flex items-center p-3 rounded-lg text-text-muted hover:bg-light-bg hover:text-text-main transition-colors duration-200"
      aria-label="Install App"
    >
      <Download className="w-6 h-6 mr-3 shrink-0" />
      <span className="font-medium whitespace-nowrap">Install App</span>
    </button>
  );
};

export default InstallPWAButton;