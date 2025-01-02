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

// Route for creating a new product with image upload
router.post('/produits', upload.array('images', 5), async (req, res) => {
  try {
    const { Refproduit, Nomproduit, Description, Quantite, typep, etatp } = req.body;

    // Get the image URLs
    const images = req.files ? req.files.map(file => `/images/${file.filename}`) : [];

    const produit = new Produit({ Refproduit, Nomproduit, Description, Quantite, typep, etatp, images });
    await produit.save();
    res.status(201).json(produit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route for updating a product with image upload
router.put('/produits/:id', upload.array('images', 5), async (req, res) => {
  const { Refproduit, Nomproduit, Description, Quantite, typep, etatp } = req.body;
  const images = req.files ? req.files.map(file => `/images/${file.filename}`) : [];

  try {
    const produit = await Produit.findByIdAndUpdate(
      req.params.id,
      { Refproduit, Nomproduit, Description, Quantite, typep, etatp, images },
      { new: true }
    );
    if (!produit) return res.status(404).json({ message: 'Produit not found' });
    res.json(produit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a product
router.delete('/produits/:id', async (req, res) => {
  try {
    const produit = await Produit.findByIdAndDelete(req.params.id);
    if (!produit) return res.status(404).json({ message: 'Produit not found' });
    res.json({ message: 'Produit deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
