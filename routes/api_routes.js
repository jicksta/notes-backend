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

  router.get("/api/notes", EN(notes.notes));
  router.get("/api/notebooks", EN(notes.notebooks));
  router.get("/api/tags", EN(notes.tags));

  router.get("/api/notes/:id", EN(notes.note));
  router.get("/api/notebooks/:id", EN(notes.notebook));
  router.get("/api/tags/:id", EN(notes.tag));

  router.post("/api/notes", EN(notes.createNote));
  router.post("/api/notebooks", EN(notes.createNotebook));
  router.post("/api/tag", EN(notes.createTag));

  router.put("/api/notes/:id", EN(notes.updateNote));
  router.put("/api/notebooks/:id", EN(notes.updateNotebook));
  router.put("/api/tags/:id", EN(notes.updateTag));  //// <------- TODO!!!!!!!!!!!!!!!!!!!!!!

  router.delete("/api/notes/:id", EN(notes.deleteNote));
  router.delete("/api/notebooks/:id", EN(notes.deleteNotebook));
  router.delete("/api/tags/:id", EN(notes.deleteTag));

};
