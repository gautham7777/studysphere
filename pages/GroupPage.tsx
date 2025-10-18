import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as DB from '../services/mockDb';
import { StudyGroup, User, StudyPlan, ChatId } from '../types';
import Avatar from '../components/Avatar';
import { MessageSquare, Plus } from '../components/icons/Icons';

interface GroupPageProps {
    groupId: string;
    openChat: (chatId: ChatId) => void;
    viewProfile: (userId: string) => void;
}

const GroupPage: React.FC<GroupPageProps> = ({ groupId, openChat, viewProfile }) => {
    const { currentUser } = useAuth();
    const [group, setGroup] = useState<StudyGroup | null>(null);
    const [members, setMembers] = useState<User[]>([]);
    const [sharedPlans, setSharedPlans] = useState<StudyPlan[]>([]);
    const [buddies, setBuddies] = useState<User[]>([]);
    const [showAddMember, setShowAddMember] = useState(false);
    
    useEffect(() => {
        const fetchGroupData = async () => {
            if (!currentUser) return;
            const groupData = await DB.getGroupById(groupId);
            setGroup(groupData);

            if (groupData) {
                const memberData = await Promise.all(groupData.members.map(id => DB.getUserById(id)));
                setMembers(memberData.filter((m): m is User => m !== null));
                
                const planData = await Promise.all((groupData.sharedPlans || []).map(id => DB.getStudyPlanById(id)));
                setSharedPlans(planData.filter((p): p is StudyPlan => p !== null));
            }
            
            const buddyData = await DB.getBuddies(currentUser.id);
            setBuddies(buddyData);
        };
        fetchGroupData();
    }, [groupId, currentUser]);

    const handleAddMember = async (userId: string) => {
        if (group) {
            await DB.addUserToGroup(userId, group.id);
            const user = await DB.getUserById(userId);
            if (user) {
                setMembers(prev => [...prev, user]);
            }
            setShowAddMember(false);
        }
    };
    
    const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
        const sections = content.split(/(\*\*.*?\*\*)/g).filter(Boolean);

        return (
            <div className="prose prose-invert max-w-none text-foreground text-sm">
                {sections.map((section, index) => {
                    if (section.startsWith('**') && section.endsWith('**')) {
                        return <h4 key={index} className="font-bold text-base mt-3 mb-1 text-primary">{section.slice(2, -2)}</h4>;
                    }
                    const lines = section.trim().split('\n');
                    return <ul key={index} className="list-disc pl-4 space-y-0.5">
                        {lines.map((line, lineIndex) => {
                             if (line.trim().startsWith('*')) {
                                 return <li key={lineIndex}>{line.trim().slice(1).trim()}</li>;
                             }
                             return line.trim() ? <p key={lineIndex} className="text-xs">{line.trim()}</p> : null;
                        })}
                    </ul>;
                })}
            </div>
        );
    };

    if (!group) return <div>Loading group...</div>;

    const buddiesNotInGroup = buddies.filter(buddy => !members.some(member => member.id === buddy.id));

    return (
        <div className="animate-fade-in">
            <div className="glass-card rounded-lg p-8 mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-5xl font-bold">{group.name}</h1>
                        <p className="text-muted-foreground text-lg mt-1">{group.description || 'A space for focused collaboration.'}</p>
                    </div>
                    <button onClick={() => openChat({type: 'group', groupId: group.id})} className="flex items-center px-6 py-3 primary-btn">
                        <MessageSquare className="w-5 h-5 mr-2"/>
                        <span>Group Chat</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="glass-card rounded-lg p-8">
                        <h2 className="text-3xl font-semibold mb-6">Shared Study Plans</h2>
                        <div className="space-y-6">
                            {sharedPlans.length > 0 ? sharedPlans.map(plan => (
                                <div key={plan.id} className="bg-secondary/50 p-6 rounded-md">
                                    <h3 className="font-bold text-xl mb-3">{plan.title}</h3>
                                    <MarkdownRenderer content={plan.details} />
                                </div>
                            )) : <p className="text-muted-foreground">No study plans have been shared yet.</p>}
                        </div>
                    </div>
                </div>
                <div className="glass-card rounded-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-3xl font-semibold">Members ({members.length})</h2>
                        <button onClick={() => setShowAddMember(!showAddMember)} className="p-2 bg-primary/20 text-primary rounded-full hover:bg-primary/40"><Plus className="w-6 h-6"/></button>
                    </div>
                    {showAddMember && (
                        <div className="mb-4 bg-secondary/50 p-4 rounded-md">
                            <h3 className="text-md font-semibold mb-3">Add a buddy to the group:</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {buddiesNotInGroup.length > 0 ? buddiesNotInGroup.map(buddy => (
                                    <button key={buddy.id} onClick={() => handleAddMember(buddy.id)} className="w-full flex items-center p-2 rounded-md hover:bg-accent text-left">
                                        <Avatar user={buddy} size="sm" />
                                        <span className="ml-3">{buddy.username}</span>
                                    </button>
                                )) : <p className="text-sm text-muted-foreground">All your buddies are already in this group.</p>}
                            </div>
                        </div>
                    )}
                    <div className="space-y-4">
                        {members.map(member => (
                            <div key={member.id} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-secondary/50" onClick={() => viewProfile(member.id)}>
                                <Avatar user={member} size="md" />
                                <span className="ml-4 font-medium text-lg">{member.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupPage;