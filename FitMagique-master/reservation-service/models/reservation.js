const mongoose = require('mongoose');

// Assuming you have a User model already defined somewhere
const User = require('./user'); // Import the User model

const reservationSchema = new mongoose.Schema({
  id_reservation: {
    type: Number,
    required: true,
  },
  DateR: {
    type: Date,
    required: true,
  },
  horaire: {
    type: String,
    required: true,
  },
  // Create a reference to the User model
  id_User: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This tells Mongoose to reference the User model
    required: true,
  },
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;

/*
const reservationSchema = new mongoose.Schema({
  id_reservation: {
    type: Number,
    required: true,
  },
  DateR: {
    type: Date,
    required: true,
  },
  horaire: {
    type: String,
    required: true,
  },
  id_User: {
    type: Number,
    required: true,
  },
});

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
*/