
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import * as DB from '../services/mockDb';
import { User, Subject, LearningStyle, Availability, StudyMethod } from '../types';
import Avatar from '../components/Avatar';
import { SUBJECTS, LEARNING_STYLES, AVAILABILITY_OPTIONS, STUDY_METHODS } from '../constants';
import { Edit } from '../components/icons/Icons';

interface ProfilePageProps {
    userId: string;
    viewProfile: (userId: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId, viewProfile }) => {
    const { currentUser, updateCurrentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [buddies, setBuddies] = useState<User[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    
    // Editable fields
    const [bio, setBio] = useState('');
    const [expertise, setExpertise] = useState<Subject[]>([]);
    const [needsHelp, setNeedsHelp] = useState<Subject[]>([]);
    const [learningStyle, setLearningStyle] = useState<LearningStyle>('Visual');
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [studyMethods, setStudyMethods] = useState<StudyMethod[]>([]);

    const isCurrentUser = useMemo(() => currentUser?.id === userId, [currentUser, userId]);

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = await DB.getUserById(userId);
            setUser(userData);
            if (userData) {
                const buddyData = await DB.getBuddies(userId);
                setBuddies(buddyData);
                // Initialize edit form state
                setBio(userData.profile.bio);
                setExpertise(userData.profile.expertise);
                setNeedsHelp(userData.profile.needsHelp);
                setLearningStyle(userData.profile.learningStyle);
                setAvailability(userData.profile.availability);
                setStudyMethods(userData.profile.studyMethods);
            }
        };
        fetchUserData();
    }, [userId]);

    const handleSave = async () => {
        if (!user || !currentUser || !isCurrentUser) return;
        const updatedUser: User = {
            ...user,
            profile: {
                ...user.profile,
                bio,
                expertise,
                needsHelp,
                learningStyle,
                availability,
                studyMethods,
            }
        };
        await updateCurrentUser(updatedUser);
        setUser(updatedUser);
        setIsEditing(false);
    };
    
    // Helper for multi-selects
    const handleMultiSelect = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, option: T) => {
        setter(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
    };

    if (!user) return <div className="text-center p-10">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-card border border-border rounded-lg p-8 relative">
                {isCurrentUser && (
                    <button onClick={() => setIsEditing(!isEditing)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary">
                        <Edit />
                    </button>
                )}
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                    <Avatar user={user} size="xl" className="w-32 h-32 text-5xl mb-4 md:mb-0 md:mr-8" />
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold">{user.username}</h1>
                        {isEditing ? (
                            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full mt-2 p-2 bg-input border border-border rounded-md"></textarea>
                        ) : (
                            <p className="text-muted-foreground mt-2">{user.profile.bio}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="md:col-span-2 bg-card border border-border rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Study Profile</h2>
                    {isEditing ? (
                        <div className="space-y-4">
                           <div>
                                <label className="text-sm font-medium">Expertise</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {SUBJECTS.map(s => <button key={s} onClick={() => handleMultiSelect(setExpertise, s)} className={`px-2 py-1 text-xs rounded-full ${expertise.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s}</button>)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Needs Help In</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {SUBJECTS.map(s => <button key={s} onClick={() => handleMultiSelect(setNeedsHelp, s)} className={`px-2 py-1 text-xs rounded-full ${needsHelp.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s}</button>)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Availability</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {AVAILABILITY_OPTIONS.map(s => <button key={s} onClick={() => handleMultiSelect(setAvailability, s)} className={`px-2 py-1 text-xs rounded-full ${availability.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s}</button>)}
                                </div>
                           </div>
                            <div>
                                <label className="text-sm font-medium">Preferred Study Methods</label>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {STUDY_METHODS.map(s => <button key={s} onClick={() => handleMultiSelect(setStudyMethods, s)} className={`px-2 py-1 text-xs rounded-full ${studyMethods.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s}</button>)}
                                </div>
                           </div>
                            <div>
                                <label className="text-sm font-medium">Primary Learning Style</label>
                                <select value={learningStyle} onChange={e => setLearningStyle(e.target.value as LearningStyle)} className="w-full mt-1 px-4 py-2 bg-input border border-border rounded-md">
                                    {LEARNING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                           </div>
                           <button onClick={handleSave} className="w-full bg-primary text-primary-foreground font-bold py-2 px-4 rounded-md hover:opacity-90">Save Changes</button>
                        </div>
                    ) : (
                         <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-muted-foreground">Expertise</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {user.profile.expertise.map(s => <span key={s} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">{s}</span>)}
                                </div>
                            </div>
                             <div>
                                <h3 className="font-semibold text-muted-foreground">Needs Help In</h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {user.profile.needsHelp.map(s => <span key={s} className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">{s}</span>)}
                                </div>
                            </div>
                            <div><h3 className="font-semibold text-muted-foreground">Learning Style: <span className="font-normal text-foreground">{user.profile.learningStyle}</span></h3></div>
                            <div><h3 className="font-semibold text-muted-foreground">Availability: <span className="font-normal text-foreground">{user.profile.availability.join(', ')}</span></h3></div>
                             <div><h3 className="font-semibold text-muted-foreground">Preferred Methods: <span className="font-normal text-foreground">{user.profile.studyMethods.join(', ')}</span></h3></div>
                        </div>
                    )}
                </div>
                 <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Buddies ({buddies.length})</h2>
                    <div className="space-y-3">
                        {buddies.map(buddy => (
                            <div key={buddy.id} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-secondary" onClick={() => viewProfile(buddy.id)}>
                                <Avatar user={buddy} size="md" />
                                <span className="ml-3 font-medium">{buddy.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
