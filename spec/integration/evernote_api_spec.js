var _ = require('underscore'),
    RSVP = require('rsvp'),
    Evernote = require('evernote').Evernote,
    EvernoteAPI = require('../../lib/evernote_api'),
    EvernoteSession = require('../../lib/evernote_session'),
    sandboxSession = require('../fixtures/sandbox_session');

describe("EvernoteAPI", function() {

  var ensession, api;
  var cachedResponses = {};

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
      expect(cachedAPIMethod("user")).toFinishWith(done, function(user) {
        expect(user.id).toEqual(+sandboxSession.evernote.userID);
      });
    });

  });

  describe("#notebooks", function() {

    it('finds notebooks', function(done) {
      expect(cachedAPIMethod("notebooks")).toFinishWith(done, function(notebooks) {
        expect(notebooks).not.toBeEmpty();
      });
    });

  });

  describe("#notes", function() {
    it('finds notes and returns the results object', function(done) {
      expect(cachedAPIMethod("notes")).toFinishWith(done, function(results) {
        expect(results).not.toBeEmpty();
        expect(results).not.toBeArray();
        expect(results.notes).not.toBeEmpty();
        expect(results.notes).toBeArray();
      });
    });
  });

  describe("#notesWithContent", function() {
    it('finds notes and returns an array of notes with content properties', function(done) {
      expect(cachedAPIMethod("notesWithContent")).toFinishWith(done, function(notes) {
        expect(notes).toBeArray();
        expect(notes).not.toBeEmpty();
        expect(notes[0].content).not.toBeEmpty();
      });
    });

    it("contains the same important properties as notes()", function(done) {
      var promises = [cachedAPIMethod("notesWithContent"), cachedAPIMethod("notes")];
      expect(RSVP.allSettled(promises)).toFinishWith(done, function(results) {
        var responses = _.pluck(results, "value");

        var notesWithContent = responses[0],
            notes = responses[1].notes;

        var noteWithoutContent = notes[0],
            noteWithContent = _.findWhere(notesWithContent, {guid: noteWithoutContent.guid});

        var same = ['guid', 'title', 'created', 'updated', 'tagGuids', 'notebookGuid', 'updateSequenceNum'];

        same.forEach(function(property) {
          expect(noteWithoutContent[property]).toEqual(noteWithContent[property], property);
        });
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

  function cachedAPIMethod(methodName) {
    if(methodName in cachedResponses) return cachedResponses[methodName];
    var promise = cachedResponses[methodName] = api[methodName].call(api);
    return promise;
  }

});
