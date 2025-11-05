// backend/models/SurveyResponse.js
const mongoose = require('mongoose');

const SurveyResponseSchema = new mongoose.Schema({
  genero: { type: String, required: true }, // Hombre / Mujer
  sentimiento: { type: String, required: true }, // Positivo / Negativo / Neutro
  nivelSatisfaccion: { type: Number, required: true }, // 1 a 5
  comentario: { type: String },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SurveyResponse', SurveyResponseSchema);
