var _ = require("underscore"),
    EvernoteAuth = require("../../lib/evernote_auth");

var SANDBOX = false;

exports.oauthStart = function(request, response) {
  var auth = new EvernoteAuth({sandbox: SANDBOX}).oauthSetup();

  auth.then(function(result) {
    request.session.OAUTH_SECRET = result.oauthTokenSecret;
    request.xhr ? response.json(result) : response.redirect(result.redirectTo);
  }, errorHandler(response));
};

exports.oauthFinish = function(request, response) {
  var secret = request.session.OAUTH_SECRET,
      token = request.query.oauth_token,
      verifier = request.query.oauth_verifier;

  var auth = new EvernoteAuth({sandbox: SANDBOX}).oauthFinish(verifier, token, secret);

  auth.then(function(result) {
    _.extend(request.session, result);
    response.redirect("/api/v1/me")
  }, errorHandler(response));
};

function errorHandler(response) {
  return function() {
    var message = JSON.stringify(arguments);
    response.send(500, {error: message})
  };
}
