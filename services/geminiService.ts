
import { GoogleGenAI, Type } from "@google/genai";

// FIX: Initialize Gemini AI client according to guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a structured study plan using the Gemini API.
 */
export const generateStudyPlan = async (
  subject: string,
  topics: string,
  targetDate: string,
  duration: string
): Promise<string> => {
  const prompt = `
    Create a detailed, structured study plan for the subject "${subject}".
    The key topics to cover are: ${topics}.
    The target completion date for this plan is ${targetDate}.
    The student's available study time is ${duration}.

    Please format the plan with clear sections for each week or day, breaking down topics into manageable sub-topics. 
    For each sub-topic, suggest a study activity (e.g., "Read Chapter 5", "Watch a video on X", "Complete 10 practice problems").
    Use markdown for formatting. Use bold for main headings (e.g., **Week 1: Introduction to Kinematics**). Use bullet points for tasks.
  `;

  try {
    // FIX: Use the correct API call for generating content.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using a suitable model for text tasks
      contents: prompt,
    });
    // FIX: Correctly extract the text from the response.
    return response.text;
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};


/**
 * Generates a multiple-choice quiz question on a given topic.
 */
export const generateQuiz = async (topic: string): Promise<{ question: string; options: string[]; correctAnswer: string; }> => {
    const prompt = `Create a single multiple-choice question about the topic: "${topic}". The question should be challenging but fair for a high school/college student. Provide 4 answer options, with only one being correct. Return the result as a JSON object with the keys "question", "options" (an array of 4 strings), and "correctAnswer" (the string of the correct option).`;

    try {
        // FIX: Use correct API call for generating JSON content with a response schema.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        correctAnswer: { type: Type.STRING }
                    },
                    required: ["question", "options", "correctAnswer"]
                }
            }
        });
        
        // FIX: Correctly extract and parse the JSON response text.
        const jsonText = response.text.trim();
        const quizData = JSON.parse(jsonText);

        if (!quizData.question || !Array.isArray(quizData.options) || quizData.options.length !== 4 || !quizData.correctAnswer) {
             throw new Error("Invalid quiz format received from AI.");
        }

        return quizData;

    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate a quiz. Please try again.");
    }
}
