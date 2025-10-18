
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateStudyPlan } from '../services/geminiService';
// FIX: Added file extensions to imports
import { SUBJECTS } from '../constants.ts';
// FIX: Added file extensions to imports
import * as DB from '../services/mockDb.ts';
// FIX: Added file extensions to imports
import { StudyGroup, StudyPlan } from '../types.ts';
import { Share2 } from '../components/icons/Icons';

// A simple markdown renderer
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const sections = content.split(/(\*\*.*?\*\*)/g).filter(Boolean);

    return (
        <div className="prose prose-invert max-w-none text-foreground">
            {sections.map((section, index) => {
                if (section.startsWith('**') && section.endsWith('**')) {
                    return <h3 key={index} className="font-bold text-lg mt-4 mb-2 text-primary">{section.slice(2, -2)}</h3>;
                }
                const lines = section.trim().split('\n');
                return <ul key={index} className="list-disc pl-5 space-y-1">
                    {lines.map((line, lineIndex) => {
                         if (line.trim().startsWith('*')) {
                             return <li key={lineIndex}>{line.trim().slice(1).trim()}</li>;
                         }
                         return line.trim() ? <p key={lineIndex}>{line.trim()}</p> : null;
                    })}
                </ul>;
            })}
        </div>
    );
};


const PlannerPage: React.FC = () => {
    const { currentUser } = useAuth();
    const [subject, setSubject] = useState<string>(SUBJECTS[0]);
    const [topics, setTopics] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [duration, setDuration] = useState('');
    const [generatedPlan, setGeneratedPlan] = useState<StudyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [showShareModal, setShowShareModal] = useState(false);
    const [userGroups, setUserGroups] = useState<StudyGroup[]>([]);

    useEffect(() => {
        const fetchGroups = async () => {
            if (currentUser) {
                const groups = await DB.getGroupsForUser(currentUser.id);
                setUserGroups(groups);
            }
        };
        fetchGroups();
    }, [currentUser]);


    const handleGeneratePlan = async () => {
        if (!topics || !targetDate || !duration) {
            setError("Please fill out all fields.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedPlan(null);

        try {
            const planDetails = await generateStudyPlan(subject, topics, targetDate, duration);
            if (currentUser) {
              const newPlan = await DB.createStudyPlan(currentUser.id, `Study Plan for ${subject}`, planDetails);
              setGeneratedPlan(newPlan);
            }
        } catch (err) {
            setError("Failed to generate study plan. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleShare = async (groupId: string) => {
        if (generatedPlan && currentUser) {
            await DB.sharePlanWithGroup(generatedPlan.id, currentUser.id, groupId);
            setShowShareModal(false);
            alert(`Plan shared with group!`);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-4xl font-bold mb-2">AI Study Planner</h1>
            <p className="text-muted-foreground mb-8">Let's create a personalized study plan just for you.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form */}
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
                        <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Topics (comma-separated)</label>
                        <input type="text" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="e.g., Kinematics, Newton's Laws" className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Target Date</label>
                        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Study Duration / Frequency</label>
                        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g., 2 hours daily, 3 times a week" className="w-full px-4 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button onClick={handleGeneratePlan} disabled={isLoading} className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity disabled:bg-secondary disabled:cursor-wait">
                        {isLoading ? 'Generating...' : 'Generate Plan'}
                    </button>
                </div>

                {/* Result */}
                <div className="bg-card border border-border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Your Generated Plan</h2>
                    {isLoading && (
                        <div className="flex justify-center items-center h-full">
                           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    )}
                    {generatedPlan && (
                        <div className="relative">
                            <button 
                                onClick={() => setShowShareModal(true)}
                                className="absolute top-0 right-0 p-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Share2 />
                            </button>
                            <MarkdownRenderer content={generatedPlan.details} />
                        </div>
                    )}
                    {!isLoading && !generatedPlan && (
                        <div className="text-muted-foreground text-center py-10">Your study plan will appear here once generated.</div>
                    )}
                </div>
            </div>
            
            {showShareModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
                    <div className="bg-card rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-4">Share Plan with Group</h3>
                        <div className="space-y-2">
                            {userGroups.length > 0 ? userGroups.map(group => (
                                <button key={group.id} onClick={() => handleShare(group.id)} className="w-full text-left p-2 rounded-md hover:bg-secondary">
                                    {group.name}
                                </button>
                            )) : <p className="text-muted-foreground text-sm">You are not in any groups to share with.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlannerPage;
