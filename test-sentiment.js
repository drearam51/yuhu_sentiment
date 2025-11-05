import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = "Analiza el sentimiento del texto: Estoy muy feliz con la maestría y los profesores.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("✅ Respuesta de Gemini:");
    console.log(response.text());
  } catch (error) {
    console.error("❌ Error en la conexión con Gemini:");
    console.error(error);
  }
}

testGemini();
