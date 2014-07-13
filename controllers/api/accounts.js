var settings = require('../../config/settings'),
    EvernoteAuth = require('../../lib/evernote_auth'),
    EvernoteSession = require('../../lib/evernote_session');

exports.me = function(request, response) {
  // return response.json(401, {error: "Not authenticated!"});
  var session;
  if(settings.stubSessionWithTestAccount) session = new EvernoteSession(require('../../spec/fixtures/sandbox_session'));
  else session = new EvernoteSession(request.session);

  if (session.isAuthenticated) {
    session.userJSON().then(function(userJSON) {
      response.json({user: userJSON});
    }).catch(function(err) {
      response.json(500, {error: err});
    });

  } else {
    var auth = new EvernoteAuth().oauthSetup();
    auth.then(function(result) {
      request.session.OAUTH_SECRET = result.oauthTokenSecret;
      request.xhr ? response.json(result) : response.redirect(result.redirectTo);
    }, function(response) {
      response.json(500, {error: response});
    });
  }
};

exports.logout = function(request, response) {
  request.session.destroy(function(err) {
    var redirectTo = request.query.redirect || "/";
    err ? response.json(500, {error: err}) : response.redirect(redirectTo);
  });
};
