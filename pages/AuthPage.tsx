
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from '../components/icons/Icons';
import { SUBJECTS, LEARNING_STYLES, AVAILABILITY_OPTIONS, STUDY_METHODS } from '../constants';
import { Subject, LearningStyle, Availability, StudyMethod } from '../types';

interface FormStepProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
}

const FormStep: React.FC<FormStepProps> = ({ title, subtitle, children }) => (
    <div className="glass-card p-5 rounded-lg">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
        {children}
    </div>
);


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
                if (!username || expertise.length === 0 || availability.length === 0 || studyMethods.length === 0) {
                    setError("Please fill out all profile fields for signup.");
                    return;
                }
                await signup(username, email, password, {
                    expertise,
                    learningStyle,
                    availability,
                    studyMethods,
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
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-lg p-8 space-y-6">
                <div className="text-center mb-8">
                    <BookOpen className="w-16 h-16 mx-auto text-primary" />
                    <h1 className="mt-4 text-4xl font-bold">Welcome to StudySphere</h1>
                    <p className="mt-2 text-muted-foreground text-lg">
                        {isLogin ? 'Sign in to find your study buddies.' : 'Create an account to get started.'}
                    </p>
                </div>

                <div className="glass-card p-8 rounded-xl">
                    <form className="space-y-4" onSubmit={handleAuth}>
                        {!isLogin && (
                             <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-4 py-3 form-input"
                                />
                            </div>
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 form-input"
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 form-input"
                        />
    
                        {error && <p className="text-sm text-red-500 pt-2 text-center">{error}</p>}
                        <button type="submit" className="w-full primary-btn py-3 text-lg">
                            {isLogin ? 'Login' : 'Continue'}
                        </button>
                    </form>
                </div>
                
                {!isLogin && (
                    <div className="space-y-6 mt-6">
                        <h2 className="text-center text-2xl font-bold">Tell us about your study habits</h2>
                        <FormStep title="Your Expertise" subtitle="Choose the subjects you're confident in.">
                            <div className="flex flex-wrap gap-2">
                                {SUBJECTS.map(s => <button type="button" key={s} onClick={() => handleMultiSelect(setExpertise, s)} className={`px-3 py-1.5 text-sm tag-btn ${expertise.includes(s) ? 'tag-btn-active' : ''}`}>{s}</button>)}
                            </div>
                        </FormStep>
                        <FormStep title="Your Availability" subtitle="When are you usually free to study?">
                             <div className="flex flex-wrap gap-2">
                               {AVAILABILITY_OPTIONS.map(s => <button type="button" key={s} onClick={() => handleMultiSelect(setAvailability, s)} className={`px-3 py-1.5 text-sm tag-btn ${availability.includes(s) ? 'tag-btn-active' : ''}`}>{s}</button>)}
                            </div>
                        </FormStep>
                         <FormStep title="Preferred Study Methods" subtitle="How do you like to learn?">
                             <div className="flex flex-wrap gap-2">
                               {STUDY_METHODS.map(s => <button type="button" key={s} onClick={() => handleMultiSelect(setStudyMethods, s)} className={`px-3 py-1.5 text-sm tag-btn ${studyMethods.includes(s) ? 'tag-btn-active' : ''}`}>{s}</button>)}
                            </div>
                        </FormStep>
                        <FormStep title="Primary Learning Style" subtitle="This helps us find the best matches for you.">
                             <select value={learningStyle} onChange={e => setLearningStyle(e.target.value as LearningStyle)} className="w-full mt-1 px-4 py-3 form-input">
                                {LEARNING_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </FormStep>
                        
                         <button onClick={handleAuth} className="w-full primary-btn py-3 text-lg">
                            Create Account
                        </button>
                    </div>
                )}


                <p className="text-lg text-center text-muted-foreground pt-4">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-primary hover:underline">
                        {isLogin ? 'Sign up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
