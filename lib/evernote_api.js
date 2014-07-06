var Evernote = require('evernote').Evernote,
    RSVP = require('rsvp'),
    _ = require('underscore');

module.exports = EvernoteAPI;

function EvernoteAPI(options) {
  this.options = _.defaults(options, {
    sandbox: true
  });
}

EvernoteAPI.prototype = {
  user: function() {
    var client = new Evernote.Client(this.options);
    var userStore = client.getUserStore();
    return new RSVP.Promise(function(resolve, reject) {
      userStore.getUser(function(err, user) {
        err ? reject(err) : resolve(user);
      });
    });
  }
};

