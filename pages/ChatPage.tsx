
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as DB from '../services/mockDb';
import { User, StudyGroup, Message, ChatId, QuizQuestion, Subject, QuizEvent } from '../types';
import Avatar from '../components/Avatar';
import { Send, BrainCircuit, Check, X } from '../components/icons/Icons';
import { generateQuizQuestions } from '../services/geminiService';
import { SUBJECTS } from '../constants';

const QuizModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onStart: (subject: Subject, topic: string) => void;
}> = ({ isOpen, onClose, onStart }) => {
    const [subject, setSubject] = useState<Subject>(SUBJECTS[0]);
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleStart = async () => {
        if (!topic.trim()) return;
        setIsLoading(true);
        try {
            await onStart(subject, topic);
        } finally {
            setIsLoading(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="glass-card rounded-lg p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">Start a Quiz</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
                        <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="w-full px-4 py-2 form-input">
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Specific Topic</label>
                        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Photosynthesis" className="w-full px-4 py-2 form-input" />
                    </div>
                    <button onClick={handleStart} disabled={isLoading || !topic.trim()} className="w-full primary-btn py-2.5 disabled:bg-secondary">
                        {isLoading ? 'Generating Quiz...' : 'Generate and Start'}
                    </button>
                </div>
            </div>
        </div>
    );
};


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

    const [showQuizModal, setShowQuizModal] = useState(false);
    const [activeQuizState, setActiveQuizState] = useState<{ questions: QuizQuestion[], scores: Record<string, number>, currentQuestionIndex: number } | null>(null);
    const [userAnswer, setUserAnswer] = useState<string | null>(null);
    
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
                setActiveQuizState(null); // Reset quiz on chat switch
                
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

        const sentMessage = await DB.sendMessage(activeChatId, currentUser.id, newMessage.trim());
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
    };
    
    const handleStartQuiz = async (subject: Subject, topic: string) => {
        if (!currentUser || !activeChatId) return;
        
        const questions = await generateQuizQuestions(subject, topic, 5);
        setActiveQuizState({ questions, scores: { [currentUser.id]: 0 }, currentQuestionIndex: 0 });

        const startEvent: QuizEvent = { type: 'start', data: { subject, topic, startedBy: currentUser.username } };
        const startMessage = await DB.sendMessage(activeChatId, 'system', `${currentUser.username} started a quiz on ${topic}!`, startEvent);
        
        const firstQuestionEvent: QuizEvent = { type: 'question', data: { question: questions[0], questionIndex: 0, totalQuestions: questions.length } };
        const firstQuestionMessage = await DB.sendMessage(activeChatId, 'system', 'First question:', firstQuestionEvent);
        
        setMessages(prev => [...prev, startMessage, firstQuestionMessage]);
    };
    
    const handleAnswer = (answer: string) => {
        if (!activeQuizState || userAnswer || !currentUser) return;
        setUserAnswer(answer);
        const currentQuestion = activeQuizState.questions[activeQuizState.currentQuestionIndex];
        if (answer === currentQuestion.correctAnswer) {
            setActiveQuizState(prev => prev ? { ...prev, scores: { ...prev.scores, [currentUser.id]: (prev.scores[currentUser.id] || 0) + 1 } } : null);
        }
    };

    const handleNextQuestion = async () => {
        if (!activeQuizState || !activeChatId) return;

        const nextIndex = activeQuizState.currentQuestionIndex + 1;
        setUserAnswer(null);

        if (nextIndex < activeQuizState.questions.length) {
            setActiveQuizState(prev => prev ? { ...prev, currentQuestionIndex: nextIndex } : null);
            const nextQuestion = activeQuizState.questions[nextIndex];
            const event: QuizEvent = { type: 'question', data: { question: nextQuestion, questionIndex: nextIndex, totalQuestions: activeQuizState.questions.length } };
            const msg = await DB.sendMessage(activeChatId, 'system', `Question ${nextIndex + 1}`, event);
            setMessages(prev => [...prev, msg]);
        } else {
            // End of quiz
            const finalScores = Object.entries(activeQuizState.scores).map(([userId, score]) => ({ userId, username: chatMembers[userId]?.username || 'Unknown', score }));
            finalScores.sort((a, b) => b.score - a.score);

            const event: QuizEvent = { type: 'end', data: { scores: finalScores } };
            const msg = await DB.sendMessage(activeChatId, 'system', 'Quiz Finished!', event);
            setMessages(prev => [...prev, msg]);
            setActiveQuizState(null);
        }
    };


    const renderMessageContent = (msg: Message) => {
        if (!msg.quizEvent) {
             return <p>{msg.content}</p>;
        }
        
        const { type, data } = msg.quizEvent;

        switch(type) {
            case 'start':
                return <div className="text-center p-3 bg-secondary rounded-lg">
                    <p className="font-semibold">{data.startedBy} started a quiz!</p>
                    <p className="text-lg font-bold text-primary">{data.subject}: {data.topic}</p>
                </div>
            case 'end':
                return <div className="p-4 bg-secondary rounded-lg">
                    <h3 className="font-bold text-xl mb-3 text-center text-primary">Quiz Over! Final Scores:</h3>
                    <ul className="space-y-2">
                        {data.scores.map(({username, score}, index) => (
                             <li key={username} className="flex justify-between items-center bg-background/50 p-2 rounded-md">
                                <span className="font-semibold">{index+1}. {username}</span>
                                <span className="font-bold">{score} Points</span>
                            </li>
                        ))}
                    </ul>
                </div>
            case 'question':
                const isCurrentQuestion = activeQuizState?.currentQuestionIndex === data.questionIndex;
                const question = data.question;
                return <div className="p-4 bg-secondary rounded-lg w-full">
                    <p className="text-sm text-muted-foreground mb-1">Question {data.questionIndex + 1} of {data.totalQuestions}</p>
                    <p className="font-semibold mb-4 text-lg">{question.question}</p>
                    <div className="grid grid-cols-2 gap-2">
                        {question.options.map(opt => {
                            const isCorrect = opt === question.correctAnswer;
                            const isSelected = opt === userAnswer;
                            let buttonClass = "w-full p-2 text-left rounded-md transition-colors duration-300 ";
                            if (userAnswer && isCurrentQuestion) {
                                if (isCorrect) buttonClass += "bg-green-500/80 text-white";
                                else if (isSelected && !isCorrect) buttonClass += "bg-red-500/80 text-white";
                                else buttonClass += "bg-muted cursor-not-allowed";
                            } else {
                                buttonClass += "bg-background/50 hover:bg-accent";
                            }
                            return <button key={opt} disabled={userAnswer !== null || !isCurrentQuestion} onClick={() => handleAnswer(opt)} className={buttonClass}>{opt}</button>
                        })}
                    </div>
                     {userAnswer && isCurrentQuestion && (
                        <div className="mt-4 text-center">
                            <button onClick={handleNextQuestion} className="primary-btn px-6 py-2">
                                {activeQuizState?.currentQuestionIndex === activeQuizState?.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                            </button>
                        </div>
                    )}
                </div>
        }
    }

    if (!currentUser) return null;

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-card border border-border rounded-lg animate-fade-in overflow-hidden">
             <QuizModal isOpen={showQuizModal} onClose={() => setShowQuizModal(false)} onStart={handleStartQuiz} />
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
                             {<Avatar user={{username: chatPartner?.username || chatGroup?.name || 'C', profilePicUrl: chatPartner?.profilePicUrl || null}} size="md" />}
                            <h2 className="text-xl font-bold ml-3">{chatPartner?.username || chatGroup?.name}</h2>
                            <button onClick={() => setShowQuizModal(true)} title="Start a Quiz" className="p-2 hover:bg-secondary rounded-full ml-auto text-muted-foreground hover:text-primary"><BrainCircuit className="w-6 h-6"/></button>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto bg-background/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex items-start mb-4 ${msg.senderId === currentUser.id ? 'justify-end' : ''} ${msg.senderId === 'system' ? 'justify-center' : ''}`}>
                                    {msg.senderId !== currentUser.id && msg.senderId !== 'system' && <Avatar user={chatMembers[msg.senderId] || {username: '?', profilePicUrl: null}} size="md" className="mr-3"/>}
                                    <div className={`max-w-md ${msg.senderId === 'system' ? 'w-full' : ''}`}>
                                        <div className={`p-3 rounded-lg ${msg.senderId === currentUser.id ? 'bg-primary text-primary-foreground' : ''} ${msg.senderId !== 'system' && msg.senderId !== currentUser.id ? 'bg-secondary' : ''}`}>
                                            {activeChatId.type === 'group' && msg.senderId !== currentUser.id && msg.senderId !== 'system' && <p className="text-xs font-bold mb-1">{chatMembers[msg.senderId]?.username}</p>}
                                            {renderMessageContent(msg)}
                                        </div>
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
