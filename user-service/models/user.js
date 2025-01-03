const mongoose = require('mongoose');

// Define the schema for users
const userSchema = new mongoose.Schema({
  idUser: { type: Number, required: false, unique: true },
  NameUser: { type: String, required: true },
  sexeUser: { type: String },
  EmailUser: { type: String, unique: true, required: true },
  roleUser: { type: String },
  telUser: { type: String },
  adressUser: { type: String },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

// Create and export the model
module.exports = mongoose.model('User', userSchema);
