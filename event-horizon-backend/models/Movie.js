// models/Movie.js
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: String,
  description: String  // Adjust these fields to match your actual document structure
});

module.exports = mongoose.model('Movie', movieSchema);
