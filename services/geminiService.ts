
import { GoogleGenAI, Type } from "@google/genai";
import { Chemical, ReactionResult, NotebookEntry } from "../types";

const createClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const simulateReaction = async (
  chemicals: Chemical[]
): Promise<ReactionResult | null> => {
  const ai = createClient();
  if (!ai) return null;

  try {
    const modelId = 'gemini-2.5-flash'; 
    
    const reactantsDesc = chemicals.map(c => `${c.name} (${c.formula})`).join(', ');
    const prompt = `
      Simulate a chemical reaction between the following reagents mixed together under standard laboratory conditions (IGCSE level):
      ${reactantsDesc}
      
      If no significant reaction occurs, state that.
      If multiple reactions occur (e.g. displacement and precipitation), describe the most observable one.
      
      Return a purely JSON object adhering to this schema.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            equation: { type: Type.STRING, description: "Balanced chemical symbol equation with state symbols" },
            observation: { type: Type.STRING, description: "What a student would see (bubbles, color change, precipitate)" },
            safetyWarning: { type: Type.STRING, description: "Important safety precautions for this specific reaction" },
            products: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of product names" },
            type: { type: Type.STRING, description: "Type of reaction (e.g. Neutralization, Displacement, Redox)" },
            colorChange: { type: Type.STRING, description: "Description of color change, or 'none'" }
          },
          required: ["equation", "observation", "safetyWarning", "products", "type", "colorChange"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as ReactionResult;

  } catch (error) {
    console.error("Gemini API Error (Reaction):", error);
    return null;
  }
};

export const explainConcept = async (
  topic: string,
  contextData: any
): Promise<string | null> => {
  const ai = createClient();
  if (!ai) return null;

  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `
      You are an IGCSE Science Tutor.
      Topic: ${topic}
      Context/Data: ${JSON.stringify(contextData)}

      Explain the scientific principles behind this specific scenario. 
      Keep it concise (max 150 words), engaging, and educational. 
      Relate it to IGCSE syllabus concepts.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Gemini API Error (Explanation):", error);
    return "Error connecting to AI tutor.";
  }
};

export const getOrbitalDescription = async (n: number, l: number): Promise<string> => {
   const ai = createClient();
   if (!ai) return "Description unavailable.";
   
   const prompt = `Describe the shape and properties of an atomic orbital with quantum numbers n=${n}, l=${l} in one short sentence suitable for a high school chemistry student.`;
   
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-2.5-flash',
       contents: prompt,
     });
     return response.text || "Description unavailable.";
   } catch (e) {
     return "Description unavailable.";
   }
}

export const analyzeNotebookEntry = async (entry: NotebookEntry): Promise<string> => {
  const ai = createClient();
  if (!ai) return "AI services unavailable.";

  const prompt = `
    As a Science Teacher, review this student's lab notebook entry.
    Experiment: ${entry.title}
    Observation: ${entry.observation}
    Conclusion: ${entry.conclusion}
    Data: ${entry.data}

    Provide brief feedback. Correct any misconceptions, suggest one improvement for next time, and validiate their conclusion based on the data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not analyze entry.";
  } catch (e) {
    return "Error analyzing entry.";
  }
}
