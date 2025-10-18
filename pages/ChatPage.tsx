
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as DB from '../services/mockDb';
import { User, StudyGroup, Message, ChatId } from '../types';
import Avatar from '../components/Avatar';
import { Send } from '../components/icons/Icons';

interface ChatPageProps {
    activeChatId: ChatId | null;
    openChat: (chatId: ChatId) => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ activeChatId, openChat }) => {
    const { currentUser } = useAuth();
    const [buddies, setBuddies] = useState<User[]>([]);
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatPartner, setChatPartner] = useState<User | null>(null);
    const [chatGroup, setChatGroup] = useState<StudyGroup | null>(null);
    const [chatMembers, setChatMembers] = useState<Record<string, User>>({});

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchChatList = async () => {
            if (currentUser) {
                setBuddies(await DB.getBuddies(currentUser.id));
                setGroups(await DB.getGroupsForUser(currentUser.id));
            }
        };
        fetchChatList();
    }, [currentUser]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (activeChatId && currentUser) {
                setMessages([]);
                setChatPartner(null);
                setChatGroup(null);
                setChatMembers({});
                
                const dbMessages = await DB.getMessages(activeChatId);
                setMessages(dbMessages);
                
                if (activeChatId.type === 'dm') {
                    const partner = await DB.getUserById(activeChatId.userId);
                    setChatPartner(partner);
                    const members: Record<string, User> = {};
                    if (partner) members[partner.id] = partner;
                    if (currentUser) members[currentUser.id] = currentUser;
                    setChatMembers(members);
                } else {
                    const group = await DB.getGroupById(activeChatId.groupId);
                    setChatGroup(group);
                    if (group) {
                         const members: Record<string, User> = {};
                         for (const memberId of group.members) {
                             const user = await DB.getUserById(memberId);
                             if (user) members[memberId] = user;
                         }
                         setChatMembers(members);
                    }
                }
            }
        };
        fetchMessages();
    }, [activeChatId, currentUser]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !currentUser || !activeChatId) return;

        await DB.sendMessage(activeChatId, currentUser.id, newMessage.trim());
        setNewMessage('');
        const dbMessages = await DB.getMessages(activeChatId);
        setMessages(dbMessages);
    };

    const getChatName = (chatId: ChatId): string => {
        if (chatId.type === 'dm') {
            return buddies.find(b => b.id === chatId.userId)?.username || 'Buddy';
        } else {
            return groups.find(g => g.id === chatId.groupId)?.name || 'Group';
        }
    };
    
    const getAvatarInfo = (chatId: ChatId): {username: string, profilePicUrl: string | null} | null => {
         if (chatId.type === 'dm') {
            return buddies.find(b => b.id === chatId.userId) || null;
        } else {
            return { username: getChatName(chatId), profilePicUrl: null };
        }
    };

    if (!currentUser) return null;

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-card border border-border rounded-lg animate-fade-in overflow-hidden">
            {/* Chat List */}
            <div className="w-1/3 border-r border-border flex flex-col">
                <div className="p-4 border-b border-border">
                    <h2 className="text-xl font-bold">Chats</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <h3 className="p-4 text-sm font-semibold text-muted-foreground">Buddies</h3>
                    {buddies.map(buddy => (
                        <div key={buddy.id} onClick={() => openChat({ type: 'dm', userId: buddy.id })}
                            className={`flex items-center p-3 cursor-pointer hover:bg-secondary ${activeChatId?.type === 'dm' && activeChatId?.userId === buddy.id ? 'bg-accent' : ''}`}>
                            <Avatar user={buddy} size="md" />
                            <span className="ml-3 font-medium">{buddy.username}</span>
                        </div>
                    ))}
                    <h3 className="p-4 text-sm font-semibold text-muted-foreground">Groups</h3>
                    {groups.map(group => (
                        <div key={group.id} onClick={() => openChat({ type: 'group', groupId: group.id })}
                            className={`flex items-center p-3 cursor-pointer hover:bg-secondary ${activeChatId?.type === 'group' && activeChatId?.groupId === group.id ? 'bg-accent' : ''}`}>
                             <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center font-bold text-indigo-400">
                                {group.name.charAt(0)}
                             </div>
                            <span className="ml-3 font-medium">{group.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 flex flex-col">
                {activeChatId ? (
                    <>
                        <div className="p-4 border-b border-border flex items-center">
                             {getAvatarInfo(activeChatId) && <Avatar user={getAvatarInfo(activeChatId)!} size="md" />}
                            <h2 className="text-xl font-bold ml-3">{chatPartner?.username || chatGroup?.name}</h2>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-background/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex items-start mb-4 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                    {msg.senderId !== currentUser.id && <Avatar user={chatMembers[msg.senderId] || {username: '?', profilePicUrl: null}} size="md" className="mr-3"/>}
                                    <div className={`max-w-md p-3 rounded-lg ${msg.senderId === currentUser.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                        {activeChatId.type === 'group' && msg.senderId !== currentUser.id && <p className="text-xs font-bold mb-1">{chatMembers[msg.senderId]?.username}</p>}
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-4 border-t border-border">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-grow px-4 py-2 bg-input border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button type="submit" className="p-3 bg-primary text-primary-foreground rounded-full hover:opacity-90">
                                    <Send className="w-5 h-5"/>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <p>Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
