const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000;

// Adresse du serveur de découverte qui retourne une liste de services disponibles
const discoveryServerUrl = 'http://127.0.0.1:4000/services';

// Middleware pour analyser le JSON dans le corps de la requête
app.use(express.json());

// Middleware pour définir la cible en fonction de la route
app.use(async (req, res, next) => {
    try {
        // Récupérer la liste des services disponibles depuis le serveur de découverte
        const response = await axios.get(discoveryServerUrl);
        const services = response.data;
        console.log('Services disponibles :', services);

        // Vérifiez l'URL de la requête entrante pour déterminer le service visé
        if (req.path.startsWith('/user')) {
            req.targetService = services.find(service => service.name === 'user-service');
        } else if (req.path.startsWith('/produit')) {
            req.targetService = services.find(service => service.name === 'produit-service');
        } else if (req.path.startsWith('/abonnement')) {
            req.targetService = services.find(service => service.name === 'abonnement-service');
        } else if (req.path.startsWith('/event')) {
            req.targetService = services.find(service => service.name === 'event-service');
        } else if (req.path.startsWith('/reservation')) {
            req.targetService = services.find(service => service.name === 'reservation-service');
        }

        // Si le service est trouvé, configurez l'URL cible
        if (req.targetService) {
            req.targetServiceUrl = `${req.targetService.address}:${req.targetService.port}`;
            next();
        } else {
            res.status(404).send({ message: 'Microservice introuvable' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des services:', error.message);
        res.status(500).send({ message: 'Erreur de communication avec le serveur de découverte' });
    }
});

// Rediriger les requêtes vers le microservice cible
app.use(async (req, res) => {
    try {
        const response = await axios({
            method: req.method,
            url: `${req.targetServiceUrl}${req.originalUrl.replace(/^\/(user|produit|abonnement|event|reservation)/, '')}`,
            data: req.body,
        });
        res.send(response.data);
    } catch (error) {
        console.error('Erreur lors de la communication avec le microservice:', error.message);
        res.status(500).send({ message: 'Erreur lors de la communication avec le microservice' });
    }
});

// Lancer la passerelle
app.listen(port, () => {
    console.log(`Passerelle démarrée sur le port ${port}`);
});
