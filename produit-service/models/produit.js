const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  Refproduit: { type: String, required: true },
  Nomproduit: { type: String, required: true },
  Description: { type: String, required: true },
  Quantite: { type: Number, required: true },
  typep: { type: String, required: true },
  etatp: { type: String, required: true },
  images: [{ type: String }] 

});

const Produit = mongoose.model('Produit', produitSchema);
module.exports = Produit;
