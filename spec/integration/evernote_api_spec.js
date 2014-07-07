var Evernote = require('evernote').Evernote,
    EvernoteAPI = require('../../lib/evernote_api'),
    EvernoteSession = require('../../lib/evernote_session'),
    sandboxSession = require('../fixtures/sandbox_session');

describe("EvernoteAPI", function() {

  var ensession, api;
  beforeEach(function() {
    ensession = new EvernoteSession(sandboxSession);
    api = ensession.api;
  });

  describe("#client", function() {
    it("is an instanceof Evernote.Client", function() {
      expect(api.client()).toBeInstanceOf(Evernote.Client);
    })
  });

  describe("#user", function() {

    it('fetches user data', function(done) {
      expect(api.user()).toFinishWith(done, function(user) {
        expect(user.id).toEqual(+sandboxSession.evernote.userID);
      });
    });

  });

  describe("#notebooks", function() {

    it('finds notebooks', function(done) {
      expect(api.notebooks()).toFinishWith(done, function(notebooks) {
        expect(notebooks).not.toBeEmpty();
      });
    });

  });

  describe("#note", function() {
    it('finds notes', function(done) {
      expect(api.notes()).toFinishWith(done, function(notes) {
        expect(notes).not.toBeEmpty();
      });
    });
  });

  describe("#noteWithContent", function() {
    it('finds notes and includes a content property', function(done) {
      expect(api.notesWithContent()).toFinishWith(done, function(notes) {
        console.log(notes);
        expect(notes).not.toBeEmpty();
        expect(notes[0].content).not.toBeEmpty();
      });
    });
  });

  describe("#tags", function() {

    it('finds tags', function(done) {
      expect(api.tags()).toFinishWith(done, function(tags) {
        expect(tags).not.toBeEmpty();
      });
    });

  });

});
