// sentimentAgent.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

class SentimentAgent {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Falta la variable GEMINI_API_KEY en .env");
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Elige modelo apropiado para análisis individual y otro para insights si prefieres
    this.analysisModel = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    this.insightModel  = this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  }

  /**
   * Analiza un texto y devuelve:
   * { sentimiento, emocion, puntuacion, resumen }
   */
  async analizarSentimiento(texto) {
    const prompt = `
Analiza el siguiente comentario en español y responde SOLO en JSON con esta estructura:
{
  "sentimiento": "Positivo | Negativo | Neutro",
  "emocion": "Alegría | Enojo | Tristeza | Calma | Sorpresa | Otro",
  "puntuacion": número entre -1 y 1 (decimal),
  "resumen": "breve descripción del tono o intención del texto"
}
Comentario: """${texto}"""
    `;

    const prompt2 = `
      Analiza el siguiente comentario y devuelve en JSON el sentimiento (positivo, negativo o neutro)
      y un nivel de confianza de 0 a 1.
      Comentario: "${comentario}"
    `;
    try {
      const result = await this.analysisModel.generateContent(prompt2);
      console.log("Resultado promtp analisis sentimiento",result)
      const raw = result.response.text();

      // Extraer primer objeto JSON dentro de la respuesta (por seguridad)
      const match = raw.match(/\{[\s\S]*\}/);
      const jsonStr = match ? match[0] : raw;
      const parsed = JSON.parse(jsonStr);

      return {
        sentimiento: parsed.sentimiento ?? "Neutro",
        emocion: parsed.emocion ?? "Desconocida",
        puntuacion: typeof parsed.puntuacion === "number" ? parsed.puntuacion : (parsed.score ?? 0),
        resumen: parsed.resumen ?? ""
      };
    } catch (err) {
      console.error("Error en analizarSentimiento:", err);
      return { sentimiento: "Neutro", emocion: "Error", puntuacion: 0, resumen: "Error al analizar" };
    }
  }

  /**
   * Genera insights a partir de un texto agregado (por ejemplo: conteos y distribuciones)
   * Devuelve string con el texto de insights.
   */
  async generateInsights(agregadoTexto) {
    const prompt = `
Tomas estos datos agregados y generas:
1) Un resumen ejecutivo (2-3 oraciones).
2) Tres insights accionables (cada uno en una línea).
3) Una recomendación prioritaria.

Datos:
${agregadoTexto}

Responde solo en texto (no JSON).
    `;
    try {
      const result = await this.insightModel.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.error("Error en generateInsights:", err);
      return "No se pudieron generar insights en este momento.";
    }
  }
}

export default SentimentAgent;
