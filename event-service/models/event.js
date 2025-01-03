const mongoose = require('mongoose');

// Define the schema for the event
const eventSchema = new mongoose.Schema({
    id_event: { type: Number, required: true },
    typeEvent: { type: String, required: true },
    Nom_event: { type: String, required: true },
    Date_event: { type: Date, required: true },
    Tarif: { type: Number, required: true },
    nbr_participants: { type: Number, required: false },
    id_User: { type: Number, required: true },
});

// Create and export the model
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
