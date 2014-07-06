var settings = require('../config/settings'),
    EvernoteAPI = require('../lib/evernote_api'),
    _ = require('underscore');

module.exports = EvernoteSession;

function EvernoteSession(session) {
  if (!session.evernote || !session.evernote.userID) {
    return;
  }

  _.extend(this, session.evernote);

  this.api = new EvernoteAPI({token: session.evernote.accessToken});
}

EvernoteSession.prototype = {

  userJSON: function() {
    var self = this;
    return self.api.user().then(function(user) {
      return self.userToJSON(user);
    });
  },

  userToJSON: function(user) {
    return _.pick(user, "id", "name", "timezone", "username")
  }

};
