// Importer le module express
const express = require('express');
const app = express();
const port = 4000;

// Liste pour stocker les services enregistrés
let services = [];

// Middleware pour analyser le JSON dans le corps de la requête
app.use(express.json());

// Endpoint pour enregistrer un service
app.post('/register', (req, res) => {
    const { name, address, port } = req.body;

    // Vérification que toutes les données sont présentes
    if (!name || !address || !port) {
        return res.status(400).json({ message: 'Données manquantes pour l\'enregistrement' });
    }

    // Ajouter le service à la liste
    services.push({ name, address, port });
    console.log(`Service enregistré : ${name} à ${address}:${port}`);
    res.status(200).json({ message: 'Service enregistré' });
});

// Endpoint pour obtenir la liste des services
app.get('/services', (req, res) => {
    res.json(services);
});

// Démarrer le serveur de découverte
app.listen(port, () => {
    console.log(`Serveur de découverte démarré sur le port ${port}`);
});
