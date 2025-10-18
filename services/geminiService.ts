
import { GoogleGenAI } from "@google/genai";

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
