const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const produitRoutes = require('./routes/produit');
const multer = require('multer');  

const app = express();

// Set up views and middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Use the routes
app.use('/', produitRoutes); // Apply routes here, no need to pass the multer upload globally

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/produitDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

module.exports = app;
