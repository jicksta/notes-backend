var _ = require("underscore"),
    EvernoteAuth = require("../lib/evernote_auth");

var SANDBOX = false;

exports.oauthStart = function(req, res) {
  var auth = new EvernoteAuth({sandbox: SANDBOX}).oauthSetup();

  auth.then(function(result) {
    req.session.OAUTH_SECRET = result.oauthTokenSecret;
    req.xhr ? res.json(result) : res.redirect(result.redirectTo);
  }, errorHandler(res));
};

exports.oauthFinish = function(req, res) {
  var secret = req.session.OAUTH_SECRET,
      token = req.query.oauth_token,
      verifier = req.query.oauth_verifier;

  var auth = new EvernoteAuth({sandbox: SANDBOX}).oauthFinish(verifier, token, secret);

  auth.then(function(result) {
    _.extend(req.session, result);
    res.redirect("/api/v1/me")
  }, errorHandler(res));
};

function errorHandler(res) {
  return function() {
    var message = JSON.stringify(arguments);
    res.send(500, {error: message})
  };
}
