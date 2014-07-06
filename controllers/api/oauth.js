var _ = require("underscore"),
    settings = require("../../config/settings"),
    EvernoteAuth = require("../../lib/evernote_auth");

exports.oauthStart = function(request, response) {
  var auth = new EvernoteAuth().oauthSetup();

  auth.then(function(result) {
    request.session.OAUTH_SECRET = result.oauthTokenSecret;
    request.xhr ? response.json(result) : response.redirect(result.redirectTo);
  }, errorHandler(response));
};

exports.oauthFinish = function(request, response) {
  var secret = request.session.OAUTH_SECRET,
      token = request.query.oauth_token,
      verifier = request.query.oauth_verifier;

  var auth = new EvernoteAuth().oauthFinish(verifier, token, secret);

  auth.then(function(result) {
    _.extend(request.session, result);
    response.redirect(settings.oauthSuccessRedirectURL)
  }, errorHandler(response));
};

function errorHandler(response) {
  return function() {
    var args = Array.prototype.slice.apply(arguments, 0);
    response.send(500, {error: args})
  };
}
