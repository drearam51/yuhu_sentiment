// models/Comment.js
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  nombre: String,
  genero: String,
  comentario: String,
  sentimiento: String,
  confianza: Number,
  fecha: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
