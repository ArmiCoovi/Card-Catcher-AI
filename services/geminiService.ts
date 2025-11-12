
import { GoogleGenAI, Type } from "@google/genai";
import { BusinessCard } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Full name of the person." },
      title: { type: Type.STRING, description: "Job title or position." },
      company: { type: Type.STRING, description: "Company or organization name." },
      phone: { type: Type.STRING, description: "Contact phone number." },
      email: { type: Type.STRING, description: "Contact email address." },
      website: { type: Type.STRING, description: "Company or personal website." },
      address: { type: Type.STRING, description: "Full physical address." },
    },
    required: ["name", "title", "company", "phone", "email", "website", "address"],
  },
};

export async function scanBusinessCards(imageBase64: string): Promise<BusinessCard[]> {
  const prompt = `
    Analyze the provided image containing one or more business cards.
    For each distinct business card found, extract the following information:
    - Name
    - Title
    - Company
    - Phone Number
    - Email
    - Website
    - Address

    If a specific field is not present on a card, return an empty string for that field.
    The output must be a valid JSON array of objects, where each object represents one business card.
    Return an empty array if no business cards are detected.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as BusinessCard[];
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Gemini API request failed.");
  }
}
