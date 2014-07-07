var express         = require('express'),
    session         = require('express-session'),
    RedisStore      = require('connect-redis')(session),
    path            = require('path'),
    modRewrite      = require('connect-modrewrite'),
    hbs             = require('express-hbs'),
    logger          = require('morgan'),
    bodyParser      = require('body-parser'),
    compress        = require('compression'),
    favicon         = require('static-favicon'),
    methodOverride  = require('method-override'),
    errorHandler    = require('errorhandler'),
    config          = require('./config'),
    environment     = require('./config/environment')(),
    routes          = require('./routes'),
    secrets         = require('./config/secrets');

var app = express();

hbs.registerHelper('ifvalue', function (conditional, options) {
  if (options.hash.value === conditional) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

app.set('env', environment);
app.set('port', config.server.port);
app.engine('hbs', hbs.express3());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('sessions dir', './tmp/sessions');

//////////////////////////////////////////////////

function LoggingRedisStore(options) {
  var self = new RedisStore(options);

  var getFn = self.get,
      setFn = self.set,
      destroyFn = self.destroy;

  self.get = function(sid, fn) {
    log('get', sid);
    getFn.apply(self, arguments);
  };

  self.set = function(sid, session, fn) {
    log('set', sid, session);
    setFn.apply(self, arguments);
  };

  self.destroy = function(sid, fn) {
    log('destroy', sid);
    destroyFn.apply(self, arguments);
  };

  self.on("connect", function() {
    log("connect");
  });

  self.on("error", function() {
    log("error");
  });

  return self;

  function log(verb) {
    var args = Array.prototype.slice.call(arguments, 1).map(function(arg) {
      return arg.toString();
    });
    console.log("store." + verb + "(" + args.join(",") + ")");
  }
}

var sessionStore = new LoggingRedisStore();

app.use(compress());
app.use(favicon());
app.use(modRewrite(['^/api/api/(.*) /api/$1'])); // Temporary until I figure out ember-cli proxy quirks.
app.use(logger('dev'));
app.use(session({
  store: sessionStore,
  secret: secrets.sessionSecret,
  resave: false,
  saveUninitialized: false
}));
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(routes.router);
app.use(function (req, res) {
  res.status(404).render('404', {
    title: '404 Not Found'
  });
});
if (app.get('env') === 'development') {
  app.use(errorHandler());
}
//////////////////////////////////////////////////

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
