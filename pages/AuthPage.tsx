
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from '../components/icons/Icons';
import { SUBJECTS, LEARNING_STYLES, AVAILABILITY_OPTIONS, STUDY_METHODS } from '../constants';
import { Subject, LearningStyle, Availability, StudyMethod } from '../types';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, signup } = useAuth();
    const [error, setError] = useState('');

    // Common fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Signup specific fields
    const [username, setUsername] = useState('');
    const [expertise, setExpertise] = useState<Subject[]>([]);
    const [needsHelp, setNeedsHelp] = useState<Subject[]>([]);
    const [learningStyle, setLearningStyle] = useState<LearningStyle>('Visual');
    const [availability, setAvailability] = useState<Availability[]>([]);
    const [studyMethods, setStudyMethods] = useState<StudyMethod[]>([]);


    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                if (!username || expertise.length === 0 || needsHelp.length === 0 || availability.length === 0 || studyMethods.length === 0) {
                    setError("Please fill out all profile fields for signup.");
                    return;
                }
                await signup(username, email, password, {
                    expertise,
                    needsHelp,
                    learningStyle,
                    availability,
                    studyMethods,
                    subjects: [...new Set([...expertise, ...needsHelp])]
                });
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        }
    };
    
    // Helper for multi-selects
    const handleMultiSelect = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, option: T) => {
        setter(prev => prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg border border-border animate-fade-in">
                <div className="text-center">
                    <BookOpen className="w-12 h-12 mx-auto text-primary" />
                    <h1 className="mt-4 text-3xl font-bold">Welcome to StudySphere</h1>
                    <p className="mt-2 text-muted-foreground">
                        {isLogin ? 'Sign in to find your study buddies.' : 'Create an account to get started.'}
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleAuth}>
                    {!isLogin && (
                         <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />

                    {!isLogin && (
                        <>
                           <h3 className="text-sm font-medium text-muted-foreground pt-2">Tell us about your study habits...</h3>
                           <div className="space-y-3">
                               <div>
                                   <label className="text-xs font-medium">Expertise (select up to 3)</label>
                                   <div className="flex flex-wrap gap-2 mt-1">
                                       {SUBJECTS.map(s => <button type="button" key={s} onClick={() => handleMultiSelect(setExpertise, s)} className={`px-2 py-1 text-xs rounded-full ${expertise.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s}</button>)}
                                   </div>
                               </div>
                               <div>
                                   <label className="text-xs font-medium">Needs Help In (select up to 3)</label>
                                   <div className="flex flex-wrap gap-2 mt-1">
                                       {SUBJECTS.map(s => <button type="button" key={s} onClick={() => handleMultiSelect(setNeedsHelp, s)} className={`px-2 py-1 text-xs rounded-full ${needsHelp.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s}</button>)}
                                   </div>
                               </div>
                                <div>
                                   <label className="text-xs font-medium">Availability</label>
                                   <div className="flex flex-wrap gap-2 mt-1">
                                       {AVAILABILITY_OPTIONS.map(s => <button type="button" key={s} onClick={() => handleMultiSelect(setAvailability, s)} className={`px-2 py-1 text-xs rounded-full ${availability.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s}</button>)}
                                   </div>
                               </div>
                                <div>
                                   <label className="text-xs font-medium">Preferred Study Methods</label>
                                   <div className="flex flex-wrap gap-2 mt-1">
                                       {STUDY_METHODS.map(s => <button type="button" key={s} onClick={() => handleMultiSelect(setStudyMethods, s)} className={`px-2 py-1 text-xs rounded-full ${studyMethods.includes(s) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>{s}</button>)}
                                   </div>
                               </div>
                               <div>
                                    <label className="text-xs font-medium">Primary Learning Style</label>
                                    <select value={learningStyle} onChange={e => setLearningStyle(e.target.value as LearningStyle)} className="w-full mt-1 px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                                        {LEARNING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                               </div>
                           </div>
                        </>
                    )}

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" className="w-full bg-primary text-primary-foreground font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-sm text-center text-muted-foreground">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-primary hover:underline">
                        {isLogin ? 'Sign up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
