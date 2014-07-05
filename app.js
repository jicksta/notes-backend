var express        = require('express'),
    session        = require('express-session'),
    path           = require('path'),
    mongoose       = require('mongoose'),
    hbs            = require('express-hbs'),
    logger         = require('morgan'),
    bodyParser     = require('body-parser'),
    compress       = require('compression'),
    favicon        = require('static-favicon'),
    methodOverride = require('method-override'),
    errorHandler   = require('errorhandler'),
    config         = require('./config'),
    routes         = require('./routes'),
    secrets        = require('./config/secrets');


//mongoose.connect(config.database.url);
//mongoose.connection.on('error', function () {
//  console.log('mongodb connection error');
//});

var app = express();

hbs.registerHelper('ifvalue', function (conditional, options) {
  if (options.hash.value === conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

app.set('port', config.server.port);
app.engine('hbs', hbs.express3());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//////////////////////////////////////////////////

app.use(compress());
app.use(favicon());
app.use(logger('dev'));
app.use(session({
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
  secret: secrets.sessionSecret
}));
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(routes.router);
app.use(function (req, res) {
  res.status(404).render('404', {
    title: 'Not Found :('
  });
});

//////////////////////////////////////////////////

if (app.get('env') === 'development') {
  app.use(errorHandler());
}

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
