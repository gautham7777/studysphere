
import { Subject, LearningStyle, Availability, StudyMethod } from './types';

export const SUBJECTS: Subject[] = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'History',
  'Literature',
  'Economics',
  'Psychology',
];

export const LEARNING_STYLES: LearningStyle[] = ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'];
export const AVAILABILITY_OPTIONS: Availability[] = ['Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'];
export const STUDY_METHODS: StudyMethod[] = ['Pomodoro', 'Feynman Technique', 'Active Recall', 'Spaced Repetition', 'Group Study'];
