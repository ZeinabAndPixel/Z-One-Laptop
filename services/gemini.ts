import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAcademicWarning = async (): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: model,
      contents: "Genera una única frase corta (máximo 15 palabras) que actúe como una 'Advertencia de Uso Académico' para una tienda de computadoras de alto rendimiento. Debe sonar profesional y autoritaria, aconsejando el uso responsable de la potencia computacional para ingeniería. En Español. Sin comillas.",
    });
    return response.text?.trim() || "Uso académico responsable requerido.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Aviso: Los sistemas de alto rendimiento requieren una ética de ingeniería responsable.";
  }
};

export const getChatResponse = async (message: string, inventory: Product[]): Promise<string> => {
  try {
    // Crear un contexto simplificado del inventario para ahorrar tokens
    const inventoryContext = inventory.map(p => `- ${p.name} (${p.category}): $${p.price}`).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: message,
      config: {
        systemInstruction: `Eres Z-One Bot, un asistente experto en hardware e ingeniería de la tienda 'Z-One Laptop v2'.
        
        Tu objetivo es recomendar productos del siguiente inventario disponible:
        ${inventoryContext}

        Reglas:
        1. Responde siempre en Español, con tono profesional pero amigable ("Ingeniero", "Colega").
        2. Si te preguntan por algo que no está en la lista, indica que no hay stock actualmente.
        3. Recomienda basándote en el uso: Gaming, Diseño 3D, Programación o Oficina.
        4. Sé conciso. Máximo 3 oraciones por respuesta.
        5. No inventes precios ni productos. Usa solo el contexto provisto.
        `,
      }
    });

    return response.text?.trim() || "Lo siento, mis circuitos están procesando demasiados datos. ¿Puedes repetir?";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Error de conexión con el núcleo de IA. Por favor intenta más tarde.";
  }
};