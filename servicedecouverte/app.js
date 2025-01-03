var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const axios = require('axios');

const port = 3000;

var app = express();
const serviceName = 'user-service';
const discoveryServerUrl = 'http://127.0.0.1:4000/register';

// Fonction pour s'enregistrer auprès du serveur de découverte
const registerService = async () => {
    try {
        await axios.post(discoveryServerUrl, {
            name: "user-service",
            address: 'http://127.0.0.1',
            port: 3000
        });
        console.log(`${serviceName} enregistré avec succès auprès du serveur de découverte.`);
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement :', error.message);
    }
};
// Enregistrement du service au démarrage de l'application
registerService();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




// Endpoint de base pour le microservice
app.get('/', (req, res) => {
    res.send(`Bienvenue dans ${serviceName}`);
});

app.listen(port, () => {
    console.log(`${serviceName} démarré sur le port ${port}`);
});

module.exports = app;