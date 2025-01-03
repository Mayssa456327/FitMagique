const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Reservation = require('./models/reservation'); // Import Reservation model
const User = require('./models/user'); // Import User model
const app = express();

// Configure the application
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public')); // Serve static files

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/reservationsDB')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err.message);
    });

// Routes

// Home Page - List all reservations
app.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find();
        res.render('index', { reservations });
    } catch (err) {
        res.status(500).send('Error retrieving reservations.');
    }
});

// Add a new reservation
app.post('/reservations', async (req, res) => {
    const { id_reservation, DateR, horaire, id_User } = req.body;

    if (!id_reservation || !DateR || !horaire || !id_User) {
        return res.status(400).send('All fields are required.');
    }

    const reservation = new Reservation({ id_reservation, DateR, horaire, id_User });

    try {
        await reservation.save();
        res.redirect('/');
    } catch (err) {
        console.error('Error creating the reservation:', err);
        res.status(500).send('Error creating the reservation.');
    }
});

// Render the "Add Reservation" form
app.get('/reservations/new', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.render('new', { users });
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Error fetching users.');
    }
});

// Edit a reservation (render the edit form)
app.get('/reservations/:id/edit', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('id_User');
        if (!reservation) {
            return res.status(404).send('Reservation not found.');
        }
        const users = await User.find(); // Fetch all users
        res.render('edit', { reservation, users });
    } catch (err) {
        console.error('Error retrieving the reservation for editing:', err);
        res.status(500).send('Error retrieving the reservation.');
    }
});

// Update a reservation
app.post('/reservations/:id', async (req, res) => {
    const { DateR, horaire, id_User } = req.body;

    try {
        const updatedReservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { DateR, horaire, id_User },
            { new: true, runValidators: true }
        );
        if (!updatedReservation) {
            return res.status(404).send('Reservation not found.');
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error updating the reservation:', err);
        res.status(500).send('Error updating the reservation.');
    }
});

// Delete a reservation
app.post('/reservations/:id/delete', async (req, res) => {
    try {
      const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
      if (!deletedReservation) {
            return res.status(404).send('Reservation not found.');
        }
        res.redirect('/');
    } catch (err) {
        console.error('Error deleting the reservation:', err);
        res.status(500).send('Error deleting the reservation.');
    }
});

module.exports = app;
