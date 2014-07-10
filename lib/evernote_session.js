var EvernoteAPI = require('../lib/evernote_api'),
    _ = require('underscore');

module.exports = EvernoteSession;

function EvernoteSession(session) {
  if (session.evernote && session.evernote.userID) {
    this.isAuthenticated = true;
    _.extend(this, session.evernote);
    this.api = new EvernoteAPI({token: session.evernote.accessToken});
  } else {
    this.isAuthenticated = false;
  }
}

EvernoteSession.prototype = {

  userJSON: function() {
    var self = this;
    return self.api.user().then(function(user) {
      return self.userToJSON(user);
    });
  },

  userToJSON: function(user) {
    return _.pick(user, "id", "name", "timezone", "username");
  }

};
