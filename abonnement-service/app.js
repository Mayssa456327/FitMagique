const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Abon = require('./models/abonnement');
const User = require('./models/user');
const app = express();

// Configure the application
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/abonnementDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Routes

// Home Page - List all abonnements
app.get('/abonnements', async (req, res) => {
  try {
    const abonnements = await Abon.find().populate('id_User', 'username');
    res.render('index', { abonnements });
  } catch (err) {
    console.error('Error fetching abonnements:', err);
    res.status(500).send('Error fetching abonnements.');
  }
});

// Add new Abonnement
app.get('/abonnements/new', async (req, res) => {
  try {
    const users = await User.find();
    res.render('new', { users });
  } catch (err) {
    console.error('Error fetching users for the form:', err);
    res.status(500).send('Unable to load the form.');
  }
});

app.post('/abonnements/new', async (req, res) => {
  const { id_abon, type_abon, type_paiemment, montant, dateDeb, dateFin } = req.body;

  if (!id_abon || !type_abon || !type_paiemment || !montant || !dateDeb || !dateFin ) {
    return res.status(400).send('All fields are required.');
  }

  const abon = new Abon({
    id_abon,
    type_abon,
    type_paiemment,
    montant,
    dateDeb,
    dateFin,
    
  });

  try {
    await abon.save();
    res.redirect('/abonnements');
  } catch (err) {
    res.status(500).send('Error creating the abon.');
  }
});

// Update an Abon
app.post('/abonnements/:id', async (req, res) => {
  const { type_abon, type_paiemment, montant, dateDeb, dateFin } = req.body;

  try {
    const updatedAbon = await Abon.findByIdAndUpdate(
      req.params.id,
      { type_abon, type_paiemment, montant, dateDeb, dateFin },
      { new: true, runValidators: true }
    );
    if (!updatedAbon) {
      return res.status(404).send('Abon not found.');
    }
    res.redirect('/abonnements');
  } catch (err) {
    res.status(500).send('Error updating the abon.');
  }
});

// Edit an Abon
app.get('/abonnements/:id/edit', async (req, res) => {
  try {
    const abon = await Abon.findById(req.params.id);
    if (!abon) {
      return res.status(404).send('Abon not found.');
    }

    const users = await User.find();
    res.render('edit', { abon, users });
  } catch (err) {
    res.status(500).send('Unable to load the edit form.');
  }
});

// Delete an Abon (change to DELETE method for RESTful convention)
app.post('/abonnements/:id/delete', async (req, res) => {
  try {
    const deletedAbon = await Abon.findByIdAndDelete(req.params.id);
    if (!deletedAbon) {
      return res.status(404).send('Abon not found.');
    }
    res.redirect('/abonnements');
  } catch (err) {
    console.error('Error deleting the reservation:', err);
    res.status(500).send('Error deleting the abon.');
  }
});


module.exports = app;
