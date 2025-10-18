
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as DB from '../services/mockDb';
import { HelpRequest, User, Subject, ChatId } from '../types';
import { SUBJECTS } from '../constants';
import Avatar from '../components/Avatar';

interface HelpRequestsPageProps {
    openChat: (chatId: ChatId) => void;
    viewProfile: (userId: string) => void;
}

const HelpRequestsPage: React.FC<HelpRequestsPageProps> = ({ openChat, viewProfile }) => {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState<HelpRequest[]>([]);
    const [requesters, setRequesters] = useState<Record<string, User>>({});
    
    // Form state
    const [subject, setSubject] = useState<Subject>(SUBJECTS[0]);
    const [topic, setTopic] = useState('');
    const [error, setError] = useState('');

    const fetchRequests = async () => {
        if (!currentUser) return;
        const openRequests = await DB.getOpenHelpRequests();
        const filteredRequests = openRequests.filter(r => r.requesterId !== currentUser.id);
        setRequests(filteredRequests);

        const requesterIds = [...new Set(filteredRequests.map(r => r.requesterId))];
        const requesterData: Record<string, User> = {};
        for (const id of requesterIds) {
            const user = await DB.getUserById(id);
            if (user) requesterData[id] = user;
        }
        setRequesters(requesterData);
    };

    useEffect(() => {
        fetchRequests();
    }, [currentUser]);

    const handleSubmitRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please describe the topic you need help with.');
            return;
        }
        setError('');
        if (currentUser) {
            await DB.createHelpRequest(currentUser.id, subject, topic);
            setTopic('');
            alert('Your help request has been posted!');
        }
    };

    if (!currentUser) return null;

    return (
        <div className="animate-fade-in">
            <h1 className="text-5xl font-bold mb-2">Help Requests</h1>
            <p className="text-muted-foreground text-lg mb-10">Ask for help or lend a hand to a fellow student.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="glass-card rounded-lg p-6 sticky top-8">
                        <h2 className="text-3xl font-semibold mb-5">Post a Request</h2>
                        <form onSubmit={handleSubmitRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
                                <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="w-full px-4 py-3 form-input">
                                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Topic / Question</label>
                                <textarea
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder="e.g., 'I'm stuck on problem 5 of the physics homework about projectile motion.'"
                                    className="w-full px-4 py-3 form-input h-28 resize-none"
                                />
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button type="submit" className="w-full primary-btn py-3">Post Request</button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {requests.map(req => requesters[req.requesterId] && (
                        <div key={req.id} className="glass-card rounded-lg p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold bg-primary/20 text-primary px-3 py-1 rounded-full inline-block mb-3">{req.subject}</p>
                                    <p className="text-lg mb-4">{req.topic}</p>
                                </div>
                                <button onClick={() => openChat({ type: 'dm', userId: req.requesterId })} className="primary-btn px-4 py-2 text-sm whitespace-nowrap">Offer Help</button>
                            </div>
                            <div className="border-t border-border pt-3 mt-3 flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center cursor-pointer hover:underline" onClick={() => viewProfile(req.requesterId)}>
                                    <Avatar user={requesters[req.requesterId]} size="sm"/>
                                    <span className="ml-2 font-medium">{requesters[req.requesterId].username}</span>
                                </div>
                                <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                    {requests.length === 0 && (
                        <div className="glass-card rounded-lg p-10 text-center text-muted-foreground">
                            <p>No open help requests right now. Be the first to ask!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HelpRequestsPage;
