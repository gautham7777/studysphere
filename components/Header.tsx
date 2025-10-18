
import React from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { BookOpen, LogOut, MessageSquare, Search, User as UserIcon, Users } from './icons/Icons';

type Page = 'dashboard' | 'find' | 'chat' | 'planner' | 'profile' | 'group';

interface HeaderProps {
  navigateTo: (page: Page) => void;
  currentPage: Page;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
      isActive ? 'bg-accent text-primary' : 'hover:bg-secondary'
    }`}
  >
    <div className="w-6 h-6 mr-4">{icon}</div>
    <span className="font-medium lg:block hidden">{label}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ navigateTo, currentPage }) => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  return (
    <header className="fixed top-0 left-0 h-screen bg-card border-r border-border p-2 md:p-4 flex flex-col justify-between w-20 lg:w-64 transition-all duration-300 z-10">
      <div>
        <div className="flex items-center mb-8 p-2">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold ml-3 text-primary lg:block hidden">StudySphere</h1>
        </div>
        <nav>
          <NavItem
            icon={<Users className="w-full h-full" />}
            label="Dashboard"
            isActive={currentPage === 'dashboard'}
            onClick={() => navigateTo('dashboard')}
          />
          <NavItem
            icon={<Search className="w-full h-full" />}
            label="Find Buddies"
            isActive={currentPage === 'find'}
            onClick={() => navigateTo('find')}
          />
          <NavItem
            icon={<MessageSquare className="w-full h-full" />}
            label="Chats"
            isActive={currentPage === 'chat'}
            onClick={() => navigateTo('chat')}
          />
          <NavItem
            icon={<BookOpen className="w-full h-full" />}
            label="AI Planner"
            isActive={currentPage === 'planner'}
            onClick={() => navigateTo('planner')}
          />
        </nav>
      </div>

      <div className="p-1">
        <div className="border-t border-border my-2"></div>
        <div className="flex items-center p-2 rounded-lg hover:bg-secondary cursor-pointer" onClick={() => navigateTo('profile')}>
          <Avatar user={currentUser} size="md" />
          <div className="ml-3 lg:block hidden">
            <p className="font-semibold">{currentUser.username}</p>
            <p className="text-xs text-muted-foreground">View Profile</p>
          </div>
        </div>
        <NavItem
          icon={<LogOut className="w-full h-full" />}
          label="Logout"
          isActive={false}
          onClick={logout}
        />
      </div>
    </header>
  );
};

export default Header;
