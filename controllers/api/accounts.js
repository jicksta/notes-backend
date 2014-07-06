var _ = require('underscore'),
    EvernoteAPI = require('../../lib/evernote_api');

exports.me = function(request, response) {
  var session = request.session;
  if (session && session.evernote && session.evernote.userID) {
    var accountParams = session.evernote;
    if (request.xhr) {
      response.json(accountParams);
    } else {
      var api = new EvernoteAPI({
        token: accountParams.accessToken,
        sandbox: false
      });
      var getUser = api.user();
      getUser.then(function(user) {
        response.json(_.extend({}, accountParams, user));
      });
      getUser.catch(function(err) {
        response.json(500, err);
      })
    }
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
    err ? response.json(500, err) : response.json({});
  });
};
