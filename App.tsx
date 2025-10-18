
import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from './context/AuthContext';
// FIX: Added file extensions to imports
import AuthPage from './pages/AuthPage.tsx';
import DashboardPage from './pages/DashboardPage';
// FIX: Added file extensions to imports
import FindPage from './pages/FindPage';
// FIX: Added file extensions to imports
import ChatPage from './pages/ChatPage.tsx';
import PlannerPage from './pages/PlannerPage';
// FIX: Added file extensions to imports
import ProfilePage from './pages/ProfilePage.tsx';
// FIX: Added file extensions to imports
import GroupPage from './pages/GroupPage.tsx';
import Header from './components/Header';
// FIX: Added file extensions to imports
import { ChatId } from './types.ts';
import HelpRequestsPage from './pages/HelpRequestsPage';

type Page = 'dashboard' | 'find' | 'chat' | 'planner' | 'profile' | 'group' | 'help';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [activeChatId, setActiveChatId] = useState<ChatId | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    setActiveChatId(null);
    setActiveGroupId(null);
    setViewingUserId(null);
  }, []);

  const openChat = useCallback((chatId: ChatId) => {
    setCurrentPage('chat');
    setActiveChatId(chatId);
  }, []);

  const openGroup = useCallback((groupId: string) => {
    setCurrentPage('group');
    setActiveGroupId(groupId);
  }, []);

  const viewProfile = useCallback((userId: string) => {
    setCurrentPage('profile');
    setViewingUserId(userId);
  }, []);
  
  const PageComponent = useMemo(() => {
    if (!currentUser) return <AuthPage />;

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage openChat={openChat} openGroup={openGroup} viewProfile={viewProfile}/>;
      case 'find':
        return <FindPage viewProfile={viewProfile} />;
      case 'chat':
        return <ChatPage activeChatId={activeChatId} openChat={openChat} />;
      case 'planner':
        return <PlannerPage />;
      case 'profile':
        return <ProfilePage userId={viewingUserId || currentUser.id} viewProfile={viewProfile}/>;
      case 'group':
        return activeGroupId ? <GroupPage groupId={activeGroupId} openChat={openChat} viewProfile={viewProfile} /> : <DashboardPage openChat={openChat} openGroup={openGroup} viewProfile={viewProfile}/>;
      case 'help':
        return <HelpRequestsPage openChat={openChat} viewProfile={viewProfile} />;
      default:
        return <DashboardPage openChat={openChat} openGroup={openGroup} viewProfile={viewProfile} />;
    }
  }, [currentUser, currentPage, activeChatId, activeGroupId, viewingUserId, openChat, openGroup, viewProfile]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <AuthPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <Header navigateTo={navigateTo} currentPage={currentPage} />
      <main className="flex-1 p-4 md:p-6 lg:p-8 md:ml-20 lg:ml-64 transition-all duration-300">
        {PageComponent}
      </main>
    </div>
  );
};

export default App;
