module.exports.install = function(router) {

  var oauth    = require("../controllers/api/oauth"),
      accounts = require("../controllers/api/accounts");

  router.get("/api/users/me", accounts.me);
  router.get("/api/logout", accounts.logout);
  router.get("/api/oauth/start", oauth.oauthStart);
  router.get("/api/oauth/finish", oauth.oauthFinish); // EN action?

  //////////////////////////////////////////////////////////////////////////////

  var EN = require('../lib/evernote_action'),
      notes = require("../controllers/api/notes");

  router.get("/api/notebooks", EN(notes.notebooks));
  router.get("/api/notes", EN(notes.notes));

};
