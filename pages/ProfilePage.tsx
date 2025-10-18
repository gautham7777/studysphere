
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
                subjects: [...new Set(expertise)],
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
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="glass-card rounded-lg p-8 relative">
                {isCurrentUser && (
                    <button onClick={() => setIsEditing(!isEditing)} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-primary">
                        <Edit />
                    </button>
                )}
                <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left">
                    <Avatar user={user} size="xl" className="w-32 h-32 text-5xl mb-6 md:mb-0 md:mr-8" />
                    <div className="flex-1">
                        <h1 className="text-5xl font-bold">{user.username}</h1>
                        {isEditing ? (
                            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full mt-4 p-3 text-lg form-input h-24 resize-none"></textarea>
                        ) : (
                            <p className="text-muted-foreground text-lg mt-2">{user.profile.bio}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 glass-card rounded-lg p-8">
                    <h2 className="text-3xl font-semibold mb-6">Study Profile</h2>
                    {isEditing ? (
                        <div className="space-y-6">
                           <div>
                                <label className="text-lg font-medium">Expertise</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {SUBJECTS.map(s => <button key={s} onClick={() => handleMultiSelect(setExpertise, s)} className={`px-3 py-1.5 text-sm tag-btn ${expertise.includes(s) ? 'tag-btn-active' : ''}`}>{s}</button>)}
                                </div>
                            </div>
                            <div>
                                <label className="text-lg font-medium">Availability</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {AVAILABILITY_OPTIONS.map(s => <button key={s} onClick={() => handleMultiSelect(setAvailability, s)} className={`px-3 py-1.5 text-sm tag-btn ${availability.includes(s) ? 'tag-btn-active' : ''}`}>{s}</button>)}
                                </div>
                           </div>
                            <div>
                                <label className="text-lg font-medium">Preferred Study Methods</label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {STUDY_METHODS.map(s => <button key={s} onClick={() => handleMultiSelect(setStudyMethods, s)} className={`px-3 py-1.5 text-sm tag-btn ${studyMethods.includes(s) ? 'tag-btn-active' : ''}`}>{s}</button>)}
                                </div>
                           </div>
                            <div>
                                <label className="text-lg font-medium">Primary Learning Style</label>
                                <select value={learningStyle} onChange={e => setLearningStyle(e.target.value as LearningStyle)} className="w-full mt-2 px-4 py-3 form-input">
                                    {LEARNING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                           </div>
                           <button onClick={handleSave} className="w-full primary-btn py-3 text-lg">Save Changes</button>
                        </div>
                    ) : (
                         <div className="space-y-5">
                            <div>
                                <h3 className="font-semibold text-muted-foreground text-lg">Expertise</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.profile.expertise.map(s => <span key={s} className="bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-md">{s}</span>)}
                                </div>
                            </div>
                            <div><h3 className="font-semibold text-muted-foreground text-lg">Learning Style: <span className="font-normal text-foreground">{user.profile.learningStyle}</span></h3></div>
                            <div><h3 className="font-semibold text-muted-foreground text-lg">Availability: <span className="font-normal text-foreground">{user.profile.availability.join(', ')}</span></h3></div>
                             <div><h3 className="font-semibold text-muted-foreground text-lg">Preferred Methods: <span className="font-normal text-foreground">{user.profile.studyMethods.join(', ')}</span></h3></div>
                        </div>
                    )}
                </div>
                 <div className="glass-card rounded-lg p-8">
                    <h2 className="text-3xl font-semibold mb-6">Buddies ({buddies.length})</h2>
                    <div className="space-y-3">
                        {buddies.map(buddy => (
                            <div key={buddy.id} className="flex items-center cursor-pointer p-2 rounded-md hover:bg-secondary/50" onClick={() => viewProfile(buddy.id)}>
                                <Avatar user={buddy} size="md" />
                                <span className="ml-4 font-medium text-lg">{buddy.username}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
