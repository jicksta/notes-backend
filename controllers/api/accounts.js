var EvernoteSession = require('../../lib/evernote_session');

exports.me = function(request, response) {
  // return response.json(401, {error: "Not authenticated!"});
  var session = EvernoteSession(request.session);

  if (session) {
    session.userJSON().then(function(userJSON) {
      response.json({user: userJSON});
    }).catch(function(err) {
      response.json(500, {error: err});
    });

  } else {
    if (request.xhr) {
      response.json(401, {error: "Not authenticated!"});
    } else {
      response.redirect("/api/v1/oauth/start");
    }
  }
};

exports.logout = function(request, response) {
  request.session.destroy(function(err) {
    var redirectTo = request.query.redirect || "/";
    err ? response.json(500, {error: err}) : response.redirect(redirectTo);
  });
};
