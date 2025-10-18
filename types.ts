
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
  subjects: Subject[]; // Subjects of interest
  expertise: Subject[]; // Subjects they are good at
  learningStyle: LearningStyle;
  availability: Availability[];
  studyMethods: StudyMethod[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  profilePicUrl: string | null;
  createdAt: string; // ISO 8601 string
  profile: UserProfile;
}

export interface BuddyRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: string; // ISO 8601 string
}

export interface StudyGroup {
    id: string;
    name: string;
    description: string | null;
    createdBy: string;
    members: string[];
    createdAt: string; // ISO 8601 string
    sharedPlans: string[];
}

export type ChatId = { type: 'dm'; userId: string } | { type: 'group'; groupId: string };

export interface QuizEvent {
    type: 'question' | 'result';
    question: string;
    options: string[];
    correctAnswer: string;
    userAnswer?: string;
    isCorrect?: boolean;
}

export interface Message {
    id: string;
    chatId: string; // Internal key like dm_user1_user2 or group_group1
    senderId: string;
    content: string;
    createdAt: string; // ISO 8601 string
    quizEvent?: QuizEvent;
}

export interface StudyPlan {
    id: string;
    ownerId: string;
    title: string;
    details: string; // Can be markdown
    createdAt: string; // ISO 8601 string
}

export interface HelpRequest {
    id: string;
    requesterId: string;
    subject: Subject;
    topic: string;
    createdAt: string; // ISO 8601 string
    status: 'open' | 'closed';
}
