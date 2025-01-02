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
    console.log(abonnements); // Log the fetched abonnements
    res.render('index', { abonnements });
  } catch (err) {
    console.error('Error fetching abonnements:', err);
    res.status(500).send('Error fetching abonnements.');
  }
});

app.post('/abonnements', async (req, res) => {
  console.log('Request Body:', req.body);  // Log the full body to inspect the fields
  console.log('Checking for missing fields:');
  console.log({
    id_abon: req.body.id_abon,
    type_abon: req.body.type_abon,
    type_paiemment: req.body.type_paiemment,
    montant: req.body.montant,
    dateDeb: req.body.dateDeb,
    dateFin: req.body.dateFin,
    id_user: req.body.id_user
  });

  const { id_abon, type_abon, type_paiemment, montant, dateDeb, dateFin, id_user } = req.body;

  if (!id_abon || !type_abon || !type_paiemment || !montant || !dateDeb || !dateFin || !id_user) {
    return res.status(400).send('All fields are required.');
  }

  const abon = new Abon({
    id_abon,
    type_abon,
    type_paiemment,
    montant,
    dateDeb,
    dateFin,
    id_user
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
  const { type_abon, type_paiemment, montant, dateDeb, dateFin, id_user } = req.body;

  try {
    const updatedAbon = await Abon.findByIdAndUpdate(
      req.params.id,
      { type_abon, type_paiemment, montant, dateDeb, dateFin, id_user },
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


// Delete an Abon
app.post('/abonnements/:id/delete', async (req, res) => {
  try {
    const deletedAbon = await Abon.findByIdAndDelete(req.params.id);
    if (!deletedAbon) {
      return res.status(404).send('Abon not found.');
    }
    res.redirect('/abonnements');
  } catch (err) {
    res.status(500).send('Error deleting the abon.');
  }
});

module.exports = app;