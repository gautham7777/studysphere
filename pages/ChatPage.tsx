
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import * as DB from '../services/mockDb.ts';
import { generateQuiz } from '../services/geminiService.ts';
import { User, StudyGroup, Message, ChatId, QuizEvent } from '../types.ts';
import Avatar from '../components/Avatar.tsx';
import { Send, BrainCircuit, Users } from '../components/icons/Icons.tsx';

interface ChatPageProps {
  activeChatId: ChatId | null;
  openChat: (chatId: ChatId) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ activeChatId, openChat }) => {
  const { currentUser } = useAuth();
  const [buddies, setBuddies] = useState<User[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [chatPartners, setChatPartners] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchChatList = async () => {
      if (currentUser) {
        setBuddies(await DB.getBuddies(currentUser.id));
        setGroups(await DB.getGroupsForUser(currentUser.id));
      }
    };
    fetchChatList();
  }, [currentUser]);

  const activeChatInfo = useMemo(() => {
    if (!activeChatId) return null;
    if (activeChatId.type === 'dm') {
      const partner = buddies.find(b => b.id === activeChatId.userId);
      return partner ? { name: partner.username, partner } : null;
    } else {
      const group = groups.find(g => g.id === activeChatId.groupId);
      return group ? { name: group.name, partner: null } : null;
    }
  }, [activeChatId, buddies, groups]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (activeChatId) {
        setIsLoading(true);
        const msgs = await DB.getMessages(activeChatId);
        setMessages(msgs);

        const senderIds = [...new Set(msgs.map(m => m.senderId))];
        const newPartners: Record<string, User> = { ...chatPartners };
        for (const id of senderIds) {
          if (!newPartners[id]) {
            const user = await DB.getUserById(id);
            if (user) newPartners[id] = user;
          }
        }
        setChatPartners(newPartners);
        setIsLoading(false);
      } else {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [activeChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent, quiz?: QuizEvent) => {
    e.preventDefault();
    if ((!message.trim() && !quiz) || !currentUser || !activeChatId) return;
    
    await DB.sendMessage(activeChatId, currentUser.id, message, quiz);
    setMessage('');
    // Refetch messages to show the new one
    const newMsgs = await DB.getMessages(activeChatId);
    setMessages(newMsgs);
  };
  
  const handleGenerateQuiz = async () => {
    if (!currentUser || !activeChatId) return;
    // Simple topic - in a real app this might be more complex
    const topic = "a random topic related to science or history"; 
    try {
        const quizData = await generateQuiz(topic);
        const quizEvent: QuizEvent = {
            type: 'question',
            ...quizData
        };
        await DB.sendMessage(activeChatId, currentUser.id, `🧠 Quiz Time!`, quizEvent);
        const newMsgs = await DB.getMessages(activeChatId);
        setMessages(newMsgs);
    } catch (error) {
        console.error(error);
        alert("Failed to generate a quiz. Please try again.");
    }
  };

  const handleAnswerQuiz = async (msg: Message, answer: string) => {
     if (!currentUser || !activeChatId || !msg.quizEvent) return;
     const isCorrect = answer === msg.quizEvent.correctAnswer;
     const resultEvent: QuizEvent = {
         ...msg.quizEvent,
         type: 'result',
         userAnswer: answer,
         isCorrect,
     };
     await DB.sendMessage(activeChatId, currentUser.id, `${isCorrect ? 'Correct! 🎉' : 'Not quite.'} You answered: ${answer}`, resultEvent);
     const newMsgs = await DB.getMessages(activeChatId);
     setMessages(newMsgs);
  }

  const renderMessage = (msg: Message) => {
    const sender = chatPartners[msg.senderId] || (msg.senderId === currentUser?.id ? currentUser : null);
    const isCurrentUserMsg = msg.senderId === currentUser?.id;

    if (msg.quizEvent) {
        const quiz = msg.quizEvent;
        if (quiz.type === 'question') {
            return (
                 <div key={msg.id} className={`w-full max-w-md mx-auto my-2 p-4 rounded-lg shadow-md ${isCurrentUserMsg ? 'bg-primary/20' : 'bg-secondary'}`}>
                    <p className="font-bold text-lg mb-2">{quiz.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                        {quiz.options.map((opt, i) => (
                            <button key={i} onClick={() => handleAnswerQuiz(msg, opt)} className="w-full text-left p-2 rounded-md hover:bg-accent bg-card">
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )
        } else if (quiz.type === 'result') {
             return (
                 <div key={msg.id} className={`w-full max-w-md mx-auto my-2 p-4 rounded-lg shadow-md ${quiz.isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    <p className="font-bold text-lg mb-2">{quiz.question}</p>
                    <p>Your answer: <span className={quiz.isCorrect ? 'text-green-400' : 'text-red-400'}>{quiz.userAnswer}</span></p>
                    {!quiz.isCorrect && <p>Correct answer: <span className="text-green-400">{quiz.correctAnswer}</span></p>}
                </div>
             )
        }
    }

    return (
       <div key={msg.id} className={`flex items-end gap-3 my-2 ${isCurrentUserMsg ? 'justify-end' : ''}`}>
          {!isCurrentUserMsg && sender && <Avatar user={sender} size="sm" />}
          <div className={`max-w-xs md:max-w-md p-3 rounded-xl ${isCurrentUserMsg ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
            <p className="text-sm">{msg.content}</p>
          </div>
        </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      {/* Sidebar */}
      <aside className="w-1/4 bg-card border-r border-border p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Chats</h2>
        <div className="overflow-y-auto">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Buddies</h3>
          {buddies.map(buddy => (
            <div key={buddy.id} onClick={() => openChat({ type: 'dm', userId: buddy.id })} className={`flex items-center p-2 rounded-lg cursor-pointer ${activeChatId?.type === 'dm' && activeChatId.userId === buddy.id ? 'bg-accent' : 'hover:bg-secondary'}`}>
              <Avatar user={buddy} size="md" />
              <span className="ml-3 font-medium">{buddy.username}</span>
            </div>
          ))}
           <h3 className="text-sm font-semibold text-muted-foreground uppercase mt-4 mb-2">Groups</h3>
           {groups.map(group => (
            <div key={group.id} onClick={() => openChat({ type: 'group', groupId: group.id })} className={`flex items-center p-2 rounded-lg cursor-pointer ${activeChatId?.type === 'group' && activeChatId.groupId === group.id ? 'bg-accent' : 'hover:bg-secondary'}`}>
              <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center"><Users className="w-5 h-5 text-indigo-400"/></div>
              <span className="ml-3 font-medium">{group.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-background">
        {activeChatId && activeChatInfo ? (
          <>
            <header className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center">
                {activeChatInfo.partner ? <Avatar user={activeChatInfo.partner} size="md"/> : <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center"><Users className="w-5 h-5 text-indigo-400"/></div>}
                <h2 className="text-xl font-semibold ml-4">{activeChatInfo.name}</h2>
              </div>
              <button onClick={handleGenerateQuiz} title="Generate AI Quiz" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                  <BrainCircuit />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? <p>Loading messages...</p> : messages.map(renderMessage)}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex items-center gap-4">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 form-input"
              />
              <button type="submit" className="p-3 primary-btn rounded-full">
                <Send className="w-6 h-6" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-xl">Select a chat to start messaging</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ChatPage;
