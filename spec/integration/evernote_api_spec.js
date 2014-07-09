var _ = require('underscore'),
    RSVP = require('rsvp'),
    Evernote = require('evernote').Evernote,
    EvernoteAPI = require('../../lib/evernote_api'),
    EvernoteSession = require('../../lib/evernote_session'),
    sandboxSession = require('../fixtures/sandbox_session'),
    PromiseErrorSpy = require('../support/promise_error_spy'),
    fixtures = require('../support/fixtures');

describe("EvernoteAPI", function() {

  var ensession, api, onerror;
  var cachedResponses = {};

  beforeEach(function() {
    ensession = new EvernoteSession(sandboxSession);
    onerror = PromiseErrorSpy();
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

  describe("#createNotebook", function() {
    it("creates a notebook which is immediately available to notebooks()", function(done) {
      var notebookName = "Notebook " + Math.random();
      expect(api.createNotebook(notebookName)).toFinishWith(done, function(notebook) {
        return api.notebooks().then(function(notebooks) {
          var found = _.findWhere(notebooks, {guid: notebook.guid});
          expect(found.name).toEqual(notebookName);
        });
      });
    });
  });

  describe("#createTag", function() {
    it("creates a tag which is immediately available to tags()", function(done) {
      var tagName = "tag" + Math.random();
      expect(api.createTag(tagName)).toFinishWith(done, function(tag) {
        return api.tags().then(function(tags) {
          var found = _.findWhere(tags, {guid: tag.guid});
          expect(found.name).toEqual(tagName);
        });
      });
    });
  });

  describe("#createNote", function() {

    it("creates a simple note", function(done) {
      var attrs = { title: "Title", content: wrapNoteContent("#createNote creates a simple note")};
      expect(api.createNote(attrs)).toFinishWith(done, function(note) {
        expect(note.content).toEqual(null); // null because the server doesn't waste bandwidth sending it back
        expect(note.guid).toBeString();
        expect(note.notebookGuid).toBeString();
        expect(note.title).toEqual(attrs.title);
      });
    });

    it("creates a complex note", function(done) {
      var attrs = {
        title: "Title",
        content: wrapNoteContent("#createNote creates a simple note"),
        tags: ["createNote1", "createNote2"]
      };
      expect(api.createNote(attrs)).toFinishWith(done, function(note) {
        expect(note.content).toEqual(null); // null because the server doesn't waste bandwidth sending it back
        expect(note.guid).toBeString();
        expect(note.notebookGuid).toBeString();
        expect(note.tagGuids.length).toEqual(attrs.tags.length);
      });
    });

    it("creates a note with tag_ids and a notebook_id", function(done) {
      var tags = cachedAPIMethod("tags"),
          notebooks = cachedAPIMethod("notebooks");

      expect(RSVP.all([tags, notebooks])).toFinishWith(done, function(values) {
        var title = "tag_ids & notebook_id",
            selectedTags = _.sample(values[0], 3),
            selectedNotebook = _.sample(values[1], 1)[0];

        expect(selectedTags).not.toBeEmpty();
        expect(selectedNotebook).toBeObject();

        return api.createNote({
          title: title,
          content: wrapNoteContent("#createNote creates a simple note"),
          tag_ids: _.pluck(selectedTags, "guid"),
          notebook_id: selectedNotebook.guid
        }).then(function(note) {
          expect(note.title).toEqual(title);
          expect(note.notebookGuid).toEqual(selectedNotebook.guid);
          expect(note.tagGuids.sort()).toEqual(_.pluck(selectedTags, "guid").sort());
        });
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
      expect(cachedAPIMethod("tags")).toFinishWith(done, function(tags) {
        expect(tags).not.toBeEmpty();
      });
    });

  });

  describe("#untagAll", function() {

    it("removes the tag from notes tagged with it", function(done) {
      expect(cachedAPIMethod("notes")).toFinishWith(done, function(results) {
        var taggedNote = _.find(results.notes, function(note) {
          return !_.isEmpty(note.tagGuids);
        });
        expect(taggedNote).toBeDefined();


        var victimGUID = taggedNote.tagGuids[0];
        expect(victimGUID).toBeString();

        return api.untagAll(victimGUID).then(function() {
          return api.note(taggedNote.guid);
        }).then(function(refreshedNote) {
          expect(refreshedNote).toBeObject();
          expect(refreshedNote.tagGuids || []).not.toContain(victimGUID);
        });
      });
    });

  });

  describe("#deleteNote", function() {
    it("deletes a note such that it is rendered inactive", function(done) {
      expect(cachedAPIMethod("notes")).toFinishWith(done, function(results) {
        var victim = _.last(results.notes);
        expect(victim.guid).toBeString();
        expect(victim.deleted).toEqual(null);
        return api.deleteNote(victim.guid).then(function(updateSequenceNumber) {
          expect(updateSequenceNumber).toBeNumber();
          return api.note(victim.guid);
        }).then(function(note) {
          expect(note.guid).toEqual(victim.guid);
          expect(note.deleted).toBeDefined();
        });
      });
    });
  });

  describe("fixtures", function() {

    fixture("notes_result", function() {
      return cachedAPIMethod("notes").then(function(result) {
        expect(result.notes.length).toBeGreaterThan(2);
        return result;
      });
    });

    fixture("note", function() {
      return cachedAPIMethod("notes").then(function(result) {
        var note = result.notes[0];
        expect(note.guid).toBeString();
        expect(note.deleted).toBeFalsy();
        return note;
      });
    });

    fixture("notebooks", function() {
      return cachedAPIMethod("notebooks").then(function(notebooks) {
        expect(notebooks.length).toBeGreaterThan(2);
        return notebooks;
      });
    });

    fixture("tags", function() {
      return cachedAPIMethod("tags").then(function(tags) {
        expect(tags.length).toBeGreaterThan(2);
        return tags;
      });
    });

    fixture("notebook", function() {
      return cachedAPIMethod("notebooks").then(function(notebooks) {
        var notebook = notebooks[0];
        expect(notebook.guid).toBeString();
        return notebook;
      });
    });

    function fixture(fixtureName, promiseFactory) {
      var fixtureExists = fixtures.exists(fixtureName);
      if (!fixtureExists) {
        it("creates the " + fixtureName + " fixture", function(done) {
          var promise = promiseFactory(api);

          promise.then(function(result) {
            if (_.isObject(result)) {
              fixtures.save(fixtureName, result);
              expect(fixtures.exists(fixtureName)).toEqual(true);
            } else {
              expect(_.isObject(result)).toEqual(true, "non-object resolved from promise");
            }
          }).catch(onerror).finally(done);
        });
      }
    }

  });

  function cachedAPIMethod(methodName) {
    if(methodName in cachedResponses) return cachedResponses[methodName];
    var promise = cachedResponses[methodName] = api[methodName].call(api);
    return promise;
  }

  function noop() {}

  function wrapNoteContent(innerXHTML) {
    return "" +
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">' +
        '<en-note>' + innerXHTML + '</en-note>';
  }

});
