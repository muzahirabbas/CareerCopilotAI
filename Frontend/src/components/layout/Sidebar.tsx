import { AppName } from '../../App';
import { Briefcase, FileText, Bot, Send, Settings, BookUser, X } from 'lucide-react';
import { Button } from '../ui/Button';
import InstallPWAButton from './InstallPWAButton';

interface SidebarProps {
  activeApp: AppName;
  setActiveApp: (appName: AppName) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavItem = ({
  label,
  appName,
  activeApp,
  setActiveApp,
  icon: Icon,
  onNavigate, // Function to call after navigation (e.g., close sidebar)
}: {
  label: string;
  appName: AppName;
  activeApp: AppName;
  setActiveApp: (appName: AppName) => void;
  icon: React.ElementType;
  onNavigate: () => void;
}) => (
  <button
    onClick={() => {
      setActiveApp(appName);
      onNavigate();
    }}
    className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
      activeApp === appName
        ? 'bg-secondary text-primary-foreground'
        : 'text-text-muted hover:bg-light-bg hover:text-text-main'
    }`}
  >
    <Icon className="w-6 h-6 mr-3 shrink-0" />
    <span className="font-medium whitespace-nowrap">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, activeApp, setActiveApp }) => {
  return (
    <nav 
      className={`fixed top-0 left-0 h-full bg-dark-bg p-4 flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-72`}
    >
      <div className="flex items-center justify-between gap-3 mb-8 px-2">
        <div className="flex items-center gap-3">
          <Bot className="text-3xl text-secondary" />
          <h1 className="text-2xl font-bold text-white">AI Career Copilot</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close menu">
          <X className="h-6 w-6 text-text-muted" />
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <NavItem
          label="CV Genie"
          appName="CVGenie"
          activeApp={activeApp}
          setActiveApp={setActiveApp}
          icon={BookUser}
          onNavigate={() => setIsOpen(false)}
        />
        <NavItem
          label="Cover Letter"
          appName="CoverLetterGenerator"
          activeApp={activeApp}
          setActiveApp={setActiveApp}
          icon={FileText}
          onNavigate={() => setIsOpen(false)}
        />
        <NavItem
          label="Apply Assist"
          appName="ApplyAssist"
          activeApp={activeApp}
          setActiveApp={setActiveApp}
          icon={Briefcase}
          onNavigate={() => setIsOpen(false)}
        />
        <NavItem
          label="Reachy AI"
          appName="ReachyAI"
          activeApp={activeApp}
          setActiveApp={setActiveApp}
          icon={Send}
          onNavigate={() => setIsOpen(false)}
        />
      </div>

      <div className="mt-auto border-t border-border pt-2">
      <InstallPWAButton />
        <NavItem
          label="Settings"
          appName="Settings"
          activeApp={activeApp}
          setActiveApp={setActiveApp}
          icon={Settings}
          onNavigate={() => setIsOpen(false)}
        />
      </div>
    </nav>
  );
};

export default Sidebar;