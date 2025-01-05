const express = require('express');
const router = express.Router();
const Produit = require('../models/produit');
const multer = require('multer');  // Add this import for multer
const path = require('path');      // Add this import for path



// Get all products
router.get('/produits', async (req, res) => {
  try {
    const produits = await Produit.find(); // Fetch products from the database
    res.render('index', { produits: produits }); // Ensure your template renders the image path properly
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Set up multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/'); // Save files to 'public/images/' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with the original extension
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Set up file filter to allow only jpg and png formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png']; // Only allow jpg and png files
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only .jpg and .png files are allowed'), false); // Reject file
  }
};

// Set up multer upload middleware with file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

// Route to render the new product form
router.get('/produits/new', (req, res) => {
  res.render('new'); // Ensure you have a 'new_produit.ejs' template in your views folder
});


// Route for creating a new product with image upload
router.post('/produits', upload.array('images', 5), async (req, res) => {
  try {
    const { Refproduit, Nomproduit, Description, Quantite, typep, etatp } = req.body;

    // Get the image URLs
    const images = req.files ? req.files.map(file => `/public/images/${file.filename}`) : [];

    const produit = new Produit({ Refproduit, Nomproduit, Description, Quantite, typep, etatp, images });
    await produit.save();
    //res.status(201).json(produit);
    res.redirect('/produits');
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


// Route for updating a product with image upload
router.put('/produits/:id', upload.array('images', 5), async (req, res) => {
  const { Refproduit, Nomproduit, Description, Quantite, typep, etatp } = req.body;
  //const images = req.files ? req.files.map(file => `/public/images/${file.filename}`) : [];

  try {
    const produit = await Produit.findByIdAndUpdate(
      req.params.id,
      { Refproduit, Nomproduit, Description, Quantite, typep, etatp, images },
      { new: true }
    );
    if (!produit) return res.status(404).json({ message: 'Produit not found' });
    res.json(produit);
    res.render('/produits');
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route for rendering the edit product form
router.get('/produits/:id/edit', async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const produit = await Produit.findById(req.params.id);
    if (!produit) {
      console.log('Product not found.');
      return res.status(404).send('Produit not found.');
    }
    console.log('Product found:', produit);
    res.render('edit', { produit });
    
  } catch (err) {
    console.error('Error fetching the produit for editing:', err);
    res.status(500).send('Unable to load the edit form.');
  }
});

// Remplacez `app.post` par `router.post`
router.post('/produits/:id/delete', async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (!produit) {
      return res.status(404).send('Produit not found.');
    }
    res.redirect('/produits');
  } catch (err) {
    console.error('Error deleting the Produit:', err);
    res.status(500).send('Error deleting the Produit.');
  }
});



module.exports = router;
