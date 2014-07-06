var Evernote = require('evernote').Evernote,
    RSVP = require('rsvp'),
    settings = require('../config/settings'),
    _ = require('underscore');

module.exports = EvernoteAPI;

function EvernoteAPI(options) {
  this.options = _.defaults(options, {
    sandbox: settings.sandbox
  });
}

EvernoteAPI.prototype = {

  client: function() {
    return new Evernote.Client(this.options);
  },

  user: function() {
    var client = this.client();
    var userStore = client.getUserStore();
    return new RSVP.Promise(function(resolve, reject) {
      userStore.getUser(function(err, user) {
        err ? reject(err) : resolve(user);
      });
    });
  },

  notebooks: function() {
    var client = this.client();
    return new RSVP.Promise(function(resolve, reject) {
      client.getNoteStore().listNotebooks(function(err, notebooks) {
        err ? reject(err) : resolve(notebooks);
      });
    })
  },

};

