const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Event = require('./models/event');
const User = require('./models/user');
const app = express();

// Configure the application
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure the views directory is set correctly
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // To handle JSON payloads

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/eventsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Routes

// Home Page - List all events
app.get('/', async (req, res) => {
  try {
    const events = await Event.find().populate('id_User', 'username'); // Populate the user field with username
    res.render('index', { events: events });
  } catch (err) {
    res.status(500).send('Erreur lors de la récupération des events.');
  }
});

// Route to render the "Add New Event" form with users
app.get('/events/new', async (req, res) => {
  try {
    const users = await User.find(); // Query users from the database
    res.render('new', { users }); // Render the form and pass the users
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Error fetching users.");
  }
});

// Route to handle the form submission (POST request)
app.post('/events', async (req, res) => {
  console.log("Form submitted with data:", req.body); // Log the data

  // Ensure proper data types for fields
  let { id_event, typeEvent, Nom_event, Date_event, Tarif, nbr_participants, id_User } = req.body;

  // Check for missing fields
  if (!id_event || !typeEvent || !Nom_event || !Date_event || !Tarif || !id_User) {
    return res.status(400).send('All fields are required.');
  }

  // Convert id_event and Tarif to numbers
  id_event = Number(id_event); // Ensure id_event is a number
  Tarif = Number(Tarif); // Ensure Tarif is a number

  // Check if id_event or Tarif are NaN
  if (isNaN(id_event) || isNaN(Tarif)) {
    return res.status(400).send('id_event and Tarif must be valid numbers.');
  }

  // Optional: Convert nbr_participants to a number, defaulting to 0 if not provided
  nbr_participants = nbr_participants ? Number(nbr_participants) : 0;

  // Create a new event object
  const event = new Event({
    id_event,
    typeEvent,
    Nom_event,
    Date_event,
    Tarif,
    nbr_participants,
    id_User
  });

  try {
    await event.save(); // Save the event to the database
    res.redirect('/'); // Redirect to the homepage
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).send('Error creating the event.');
  }
});


// Edit an event (render the edit form)
app.get('/events/:id/edit', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('id_User', 'username');
    if (!event) {
      return res.status(404).send('Event not found.');
    }
    res.render('edit', { event });
  } catch (err) {
    console.error('Error retrieving the event for editing:', err);
    res.status(500).send('Error retrieving the event.');
  }
});

// Update an event
app.post('/events/:id', async (req, res) => {
  const { typeEvent, Nom_event, Date_event, Tarif, nbr_participants, id_User } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { typeEvent, Nom_event, Date_event, Tarif, nbr_participants, id_User },
      { new: true, runValidators: true } // Return the updated document
    );
    if (!updatedEvent) {
      return res.status(404).send('Event not found.');
    }
    res.redirect('/');
  } catch (err) {
    console.error('Error updating the event:', err);
    res.status(500).send('Error updating the event.');
  }
});

// Delete an event
app.post('/events/:id/delete', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).send('Event not found.');
    }
    res.redirect('/');
  } catch (err) {
    console.error('Error deleting the event:', err);
    res.status(500).send('Error deleting the event.');
  }
});

// Export the app instance to be used in the server file
module.exports = app;
