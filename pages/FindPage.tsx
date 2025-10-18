
import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// FIX: Added file extensions to imports
import * as DB from '../services/mockDb.ts';
// FIX: Added file extensions to imports
import { User, Subject } from '../types.ts';
import Avatar from '../components/Avatar';
// FIX: Added file extensions to imports
import { SUBJECTS } from '../constants.ts';

interface FindPageProps {
    viewProfile: (userId: string) => void;
}

const FindPage: React.FC<FindPageProps> = ({ viewProfile }) => {
    const { currentUser } = useAuth();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [buddies, setBuddies] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [subjectFilter, setSubjectFilter] = useState<Subject | 'all'>('all');
    
    const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchUsers = async () => {
            if (currentUser) {
                const users = await DB.getAllUsers();
                setAllUsers(users.filter(user => user.id !== currentUser.id));
                const buddyData = await DB.getBuddies(currentUser.id);
                setBuddies(buddyData);
            }
        };
        fetchUsers();
    }, [currentUser]);


    const calculateCompatibility = (user: User): number => {
        if (!currentUser) return 0;
        let score = 0;
        
        // Common subjects of interest
        const commonSubjects = currentUser.profile.subjects.filter(subject => user.profile.subjects.includes(subject));
        score += commonSubjects.length * 3;

        const commonAvailability = currentUser.profile.availability.filter(avail => user.profile.availability.includes(avail));
        score += commonAvailability.length * 2;

        const commonMethods = currentUser.profile.studyMethods.filter(method => user.profile.studyMethods.includes(method));
        score += commonMethods.length * 1.5;
        
        if (currentUser.profile.learningStyle === user.profile.learningStyle) {
            score += 5;
        }

        return score;
    };

    const filteredAndSortedUsers = useMemo(() => {
        return allUsers
            .map(user => ({ user, score: calculateCompatibility(user) }))
            .filter(({ user }) => {
                const nameMatch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
                const subjectMatch = subjectFilter === 'all' || user.profile.subjects.includes(subjectFilter);
                return nameMatch && subjectMatch;
            })
            .sort((a, b) => b.score - a.score);
    }, [allUsers, searchTerm, subjectFilter, currentUser]);
    
    const handleSendRequest = async (receiverId: string) => {
        if (!currentUser) return;
        try {
            await DB.sendBuddyRequest(currentUser.id, receiverId);
            setSentRequests(prev => ({ ...prev, [receiverId]: true }));
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        }
    };
    
    const isBuddy = (userId: string) => {
        return buddies.some(b => b.id === userId);
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-5xl font-bold mb-2">Find Your Study Buddy</h1>
            <p className="text-muted-foreground text-lg mb-8">Connect with students who match your learning style.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow px-4 py-3 form-input"
                />
                <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value as Subject | 'all')}
                    className="px-4 py-3 form-input"
                >
                    <option value="all">All Subjects</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedUsers.map(({ user, score }) => (
                    <div key={user.id} className="glass-card rounded-lg p-5 flex flex-col items-center text-center transition-transform hover:-translate-y-2 duration-300">
                        <div className="w-full bg-secondary h-2 rounded-full mb-4">
                            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, score * 4)}%` }}></div>
                        </div>
                        <Avatar user={user} size="xl" className="mb-4" />
                        <h3 className="font-semibold text-xl cursor-pointer hover:underline" onClick={() => viewProfile(user.id)}>{user.username}</h3>
                        <p className="text-sm text-muted-foreground h-10 overflow-hidden my-2">{user.profile.bio || 'No bio yet.'}</p>
                        
                        <div className="w-full my-3 text-left">
                            <h4 className="font-semibold text-xs mb-1 uppercase text-muted-foreground">Expertise</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {user.profile.expertise.slice(0,4).map(s => <span key={s} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{s}</span>)}
                            </div>
                        </div>

                        <button
                            onClick={() => handleSendRequest(user.id)}
                            disabled={sentRequests[user.id] || isBuddy(user.id)}
                            className="w-full mt-auto primary-btn py-2.5 disabled:bg-secondary disabled:cursor-not-allowed disabled:text-muted-foreground disabled:shadow-none"
                        >
                            {isBuddy(user.id) ? "Buddies" : sentRequests[user.id] ? "Request Sent" : "Add Buddy"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FindPage;
