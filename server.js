// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Comment from './models/Comment.js';
import { GoogleGenerativeAI } from "@google/generative-ai";
import SentimentAgent from "./sentimentAgent.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

//Configurar CORS para permitir el frontend local
app.use(
  cors({
    origin: "https://yuhu-sentiment.onrender.com", // dominio del frontend Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Conexión a la base de datos
connectDB();

// Configurar Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro"});

// Endpoint para recibir comentarios y analizarlos
app.post('/api/comentario', async (req, res) => {
  try {
    const { nombre, genero, comentario } = req.body;

    const prompt = `
      Analiza el siguiente comentario y devuelve en JSON el sentimiento (positivo, negativo o neutro)
      y un nivel de confianza de 0 a 1.
      Comentario: "${comentario}"
    `;

    const result = await model.generateContent(prompt);
    console.log("resultado", result)
    const responseText = result.response.text();

    // Intentar convertir el texto devuelto en JSON válido
    const parsed = JSON.parse(responseText.replace(/```json|```/g, '').trim());

    // Guardar en MongoDB
    const nuevoComentario = new Comment({
      nombre,
      genero,
      comentario,
      sentimiento: parsed.sentimiento,
      confianza: parsed.confianza,
    });
    await nuevoComentario.save();

    res.status(200).json({
      mensaje: 'Comentario guardado y analizado con éxito',
      data: nuevoComentario
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error al analizar o guardar el comentario' });
  }
});

app.get("/api/insights", async (req, res) => {
  try {
    const comentarios = await Comment.find();

    console.log(comentarios)

    // Métricas básicas
    const positivos = comentarios.filter(c => c.sentimiento === "positivo").length;
    const negativos = comentarios.filter(c => c.sentimiento === "negativo").length;
    const neutros   = comentarios.filter(c => c.sentimiento === "neutral").length;

    const hombres = comentarios.filter(c => c.genero === "H").length;
    const mujeres = comentarios.filter(c => c.genero === "M").length;

    // Generar texto para el agente Gemini
    const resumen = `
      Tenemos ${comentarios.length} comentarios:
      ${positivos} positivos, ${negativos} negativos y ${neutros} neutros.
      Participaron ${hombres} hombres y ${mujeres} mujeres.
      Genera insights significativos sobre cómo se sienten las personas con la temática de la maestría.
    `;

    console.log(resumen)

    const sentimentAgent = new SentimentAgent();
    const insights = await sentimentAgent.generateInsights(resumen);

    res.json({
      positivos,
      negativos,
      neutros,
      hombres,
      mujeres,
      insights,
    });

  } catch (error) {
    console.error("❌ Error generando insights:", error);
    res.status(500).json({ error: "Error generando insights" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
