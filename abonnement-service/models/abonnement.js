const mongoose = require('mongoose');

const abonnementSchema = new mongoose.Schema({
  id_abon: { type: String, required: true },
  type_abon: { type: String, required: true },
  type_paiemment: { type: String, required: true },
  montant: { type: Number, required: true },
  dateDeb: { type: Date, required: true },
  dateFin: { type: Date, required: true },
  id_User: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Abon = mongoose.model('Abon', abonnementSchema);
module.exports = Abon;
