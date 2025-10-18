
import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateStudyPlan = async (
  subject: string,
  topics: string,
  targetDate: string,
  duration: string
): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`AI functionality is disabled. Here is a placeholder plan:
**Subject:** ${subject}
**Topics:** ${topics}
**Goal:** Master by ${targetDate}
**Duration:** ${duration}
---
*   **Day 1:** Review topic A.
*   **Day 2:** Practice problems for topic A.
*   **Day 3:** Start topic B.
    `);
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    Create a personalized study plan with the following details.
    Format the output as clear, actionable markdown.

    **Subject:** ${subject}
    **Specific Topics:** ${topics}
    **Target Completion Date:** ${targetDate}
    **Desired Study Duration/Frequency:** ${duration}

    Generate a structured daily or weekly schedule. Include suggested activities like 'review notes', 'practice problems', 'watch videos on X', 'create flashcards for Y'.
    Break down the topics into manageable chunks. The tone should be encouraging and motivational.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating study plan:", error);
    return "There was an error generating the study plan. Please try again.";
  }
};

export const generateQuizQuestions = async (
  subject: string,
  topic: string,
  numQuestions: number = 5
): Promise<QuizQuestion[]> => {
  if (!API_KEY) {
    // Return mock questions if API key is not available
    return Promise.resolve(
      Array.from({ length: numQuestions }, (_, i) => ({
        question: `This is mock question ${i + 1} for ${topic}?`,
        options: ['Option A', 'Option B', 'Correct Answer', 'Option D'].sort(() => Math.random() - 0.5),
        correctAnswer: 'Correct Answer',
      }))
    );
  }

  const model = "gemini-2.5-flash";
  const prompt = `
    Generate a JSON array of ${numQuestions} multiple-choice quiz questions about the topic "${topic}" within the subject "${subject}".
    Each question object must have three properties:
    1. "question": A string containing the question text.
    2. "options": An array of 4 strings representing the possible answers. One of these must be the correct answer.
    3. "correctAnswer": A string that is an exact match to one of the strings in the "options" array.
    Do not include any other text, explanations, or markdown formatting outside of the JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswer: { type: Type.STRING },
            },
            required: ["question", "options", "correctAnswer"],
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const questions = JSON.parse(jsonText);
    
    // Basic validation
    if (!Array.isArray(questions) || questions.some(q => !q.question || !q.options || !q.correctAnswer || q.options.length < 2)) {
        throw new Error("Invalid JSON format for quiz questions.");
    }

    return questions;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz questions from AI. Please try again.");
  }
};
