var EvernoteSession = require('../../lib/evernote_session');

exports.me = function(request, response) {
  var session = new EvernoteSession(request.session);

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
  response.session.destroy(function(err) {
    err ? response.json(500, {error: err}) : response.json({});
  });
};
