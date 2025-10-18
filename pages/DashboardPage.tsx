
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// FIX: Added file extensions to imports
import * as DB from '../services/mockDb.ts';
// FIX: Added file extensions to imports
import { BuddyRequest, StudyGroup, User, ChatId } from '../types.ts';
import Avatar from '../components/Avatar';
import { Check, MessageSquare, Users, X, Plus } from '../components/icons/Icons';

interface DashboardProps {
    openChat: (chatId: ChatId) => void;
    openGroup: (groupId: string) => void;
    viewProfile: (userId: string) => void;
}

const DashboardPage: React.FC<DashboardProps> = ({ openChat, openGroup, viewProfile }) => {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState<BuddyRequest[]>([]);
    const [buddies, setBuddies] = useState<User[]>([]);
    const [groups, setGroups] = useState<StudyGroup[]>([]);
    const [senders, setSenders] = useState<Record<string, User>>({});
    
    const [showCreateGroup, setShowCreateGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                const userRequests = await DB.getBuddyRequestsForUser(currentUser.id);
                setRequests(userRequests);
                
                const senderData: Record<string, User> = {};
                for (const req of userRequests) {
                    const sender = await DB.getUserById(req.senderId);
                    if (sender) {
                        senderData[req.senderId] = sender;
                    }
                }
                setSenders(senderData);

                setBuddies(await DB.getBuddies(currentUser.id));
                setGroups(await DB.getGroupsForUser(currentUser.id));
            }
        };
        fetchData();
    }, [currentUser]);

    const handleRequestResponse = async (requestId: string, status: 'accepted' | 'declined') => {
        await DB.respondToBuddyRequest(requestId, status);
        setRequests(requests.filter(req => req.id !== requestId));
        if (currentUser && status === 'accepted') {
            setBuddies(await DB.getBuddies(currentUser.id));
        }
    };
    
    const handleCreateGroup = async () => {
        if (newGroupName.trim() && currentUser) {
            await DB.createGroup(newGroupName.trim(), currentUser.id, null);
            setNewGroupName('');
            setShowCreateGroup(false);
            setGroups(await DB.getGroupsForUser(currentUser.id));
        }
    };


    if (!currentUser) return null;

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">Welcome, {currentUser.username}!</h1>
            <p className="text-muted-foreground mb-8">Here's a look at your study sphere.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Buddy Requests */}
                    {requests.length > 0 && (
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h2 className="text-2xl font-semibold mb-4">Buddy Requests</h2>
                            <div className="space-y-4">
                                {requests.map(req => senders[req.senderId] && (
                                    <div key={req.id} className="flex items-center justify-between bg-secondary p-3 rounded-md">
                                        <div className="flex items-center cursor-pointer" onClick={() => viewProfile(req.senderId)}>
                                            <Avatar user={senders[req.senderId]} size="md" />
                                            <span className="ml-3 font-medium">{senders[req.senderId].username}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleRequestResponse(req.id, 'accepted')} className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500/40 transition-colors"><Check className="w-5 h-5"/></button>
                                            <button onClick={() => handleRequestResponse(req.id, 'declined')} className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors"><X className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Study Groups */}
                    <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">Your Study Groups</h2>
                            <button onClick={() => setShowCreateGroup(!showCreateGroup)} className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary/40 transition-colors"><Plus className="w-5 h-5"/></button>
                        </div>
                        {showCreateGroup && (
                            <div className="flex space-x-2 mb-4">
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    placeholder="New group name"
                                    className="flex-grow px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                <button onClick={handleCreateGroup} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">Create</button>
                            </div>
                        )}
                        <div className="space-y-3">
                           {groups.length > 0 ? groups.map(group => (
                               <div key={group.id} className="flex items-center justify-between bg-secondary p-3 rounded-md">
                                   <div className="flex items-center">
                                       <div className="w-10 h-10 rounded-full bg-indigo-500/30 flex items-center justify-center"><Users className="w-5 h-5 text-indigo-400"/></div>
                                       <span className="ml-3 font-medium">{group.name}</span>
                                   </div>
                                   <div className="flex items-center space-x-2">
                                       <button onClick={() => openChat({type: 'group', groupId: group.id})} className="p-2 rounded-full hover:bg-accent"><MessageSquare className="w-5 h-5 text-muted-foreground"/></button>
                                       <button onClick={() => openGroup(group.id)} className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-full hover:opacity-90">Workspace</button>
                                   </div>
                               </div>
                           )) : <p className="text-muted-foreground text-sm">You are not a part of any groups yet.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column (Buddies) */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Buddies</h2>
                    <div className="space-y-4">
                        {buddies.length > 0 ? buddies.map(buddy => (
                             <div key={buddy.id} className="flex items-center justify-between">
                                 <div className="flex items-center cursor-pointer" onClick={() => viewProfile(buddy.id)}>
                                     <Avatar user={buddy} size="md" />
                                     <span className="ml-3 font-medium">{buddy.username}</span>
                                 </div>
                                 <button onClick={() => openChat({ type: 'dm', userId: buddy.id })} className="p-2 rounded-full hover:bg-accent"><MessageSquare className="w-5 h-5 text-muted-foreground"/></button>
                             </div>
                        )) : <p className="text-muted-foreground text-sm">You haven't added any buddies yet. Go find some!</p>}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardPage;
