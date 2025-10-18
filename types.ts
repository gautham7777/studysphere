
export type Subject =
  | 'Mathematics'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Computer Science'
  | 'History'
  | 'Literature'
  | 'Economics'
  | 'Psychology';

export type LearningStyle = 'Visual' | 'Auditory' | 'Reading/Writing' | 'Kinesthetic';
export type Availability = 'Weekdays' | 'Weekends' | 'Mornings' | 'Afternoons' | 'Evenings';
export type StudyMethod = 'Pomodoro' | 'Feynman Technique' | 'Active Recall' | 'Spaced Repetition' | 'Group Study';

export interface UserProfile {
  bio: string;
  subjects: Subject[];
  expertise: Subject[];
  learningStyle: LearningStyle;
  availability: Availability[];
  studyMethods: StudyMethod[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicUrl: string | null;
  createdAt: string; // ISO string
  profile: UserProfile;
}

export interface BuddyRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string; // ISO string
}

export interface StudyGroup {
    id: string;
    name: string;
    description: string | null;
    members: string[]; // array of user IDs
    createdBy: string; // user ID
    createdAt: string; // ISO string
    sharedPlans?: string[]; // array of plan IDs
}

export type ChatId = { type: 'dm'; userId: string } | { type: 'group'; groupId: string };

export interface HelpRequest {
    id: string;
    requesterId: string;
    subject: Subject;
    topic: string;
    createdAt: string; // ISO string
    status: 'open' | 'closed';
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export type QuizEvent = 
    | { type: 'start'; data: { subject: string; topic: string; startedBy: string; } }
    | { type: 'question'; data: { question: QuizQuestion; questionIndex: number; totalQuestions: number; } }
    | { type: 'end'; data: { scores: { userId: string; username: string, score: number }[] } };

export interface Message {
    id: string;
    chatId: string; 
    senderId: string; // 'system' for quiz events
    content: string; // Main content or description for events
    createdAt: string; // ISO string
    quizEvent?: QuizEvent;
}

export interface StudyPlan {
    id: string;
    ownerId: string;
    title: string;
    details: string; // The markdown content from Gemini
    createdAt: string; // ISO string
}
