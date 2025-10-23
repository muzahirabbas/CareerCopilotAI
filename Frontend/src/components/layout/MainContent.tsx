import Header from './Header';

interface MainContentProps {
  children: React.ReactNode;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({ children, setIsSidebarOpen }) => {
  return (
    <div className="flex flex-col w-full h-full">
      <Header setIsSidebarOpen={setIsSidebarOpen} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainContent;