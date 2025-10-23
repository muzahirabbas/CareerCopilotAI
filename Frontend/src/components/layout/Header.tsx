import { Menu } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border p-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </header>
  );
};

export default Header;