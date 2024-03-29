var _ = require('underscore'),
    controller = require('../../controllers/api/notes'),
    EvernoteSession = require('../../lib/evernote_session'),
    sandboxSession = require('../fixtures/sandbox_session'),
    SpyPromise = require('../support/spy_promise'),
    PromiseErrorSpy = require('../support/promise_error_spy'),
    NoteTransformer = require('../../transformers/note_transformer'),
    NotebookTransformer = require('../../transformers/notebook_transformer'),
    TagTransformer = require('../../transformers/tag_transformer'),
    settings = require('../../config/settings'),
    fixtures = require('../support/fixtures'),
    utils = require('../support/utilities');

describe("Notes controllers", function() {

  var ensession, api, onerror;
  beforeEach(function() {
    onerror = PromiseErrorSpy();
    ensession = new EvernoteSession(sandboxSession);
    ensession.api = api = apiSpy(ensession.api);
  });

  afterEach(function() {
    expect(onerror).not.toHaveBeenCalled();
  });

  describe('#note', function() {

    var rawFixture, formattedFixture;
    beforeEach(function() {
      rawFixture = noteFixtureWithContent("notes#note");
      api.note.promise.resolve(rawFixture);
      formattedFixture = NoteTransformer.formatNote(rawFixture);
    });

    it("returns the note with its body", function(done) {
      controller.note(ensession, request({id: rawFixture.guid})).catch(onerror).then(function(response) {
        expect(api.note).toHaveBeenCalledWith(rawFixture.guid);
        expect(response.note).toEqual(formattedFixture);
        expect(response.note.body).toBeString(); // so the server can post-process a note for the client
      }).finally(done);
    });

  });

  describe('#notes', function() {

    describe('responses', function() {

      var rawFixture, formattedFixture;
      beforeEach(function() {
        rawFixture = fixtures.load('notes_result');
        api.notes.promise.resolve(rawFixture);
        formattedFixture = NoteTransformer.formatNotesResponse(rawFixture);
      });

      it("wraps and transforms the notes from the API", function(done) {
        controller.notes(ensession, request()).catch(onerror).then(function(response) {
          expect(api.notes).toHaveBeenCalled();
          expect(response.note).toEqual(formattedFixture);
        }).finally(done);
      });

    });

    describe("the :per_page param", function() {

      it('translates the :per_page into a "max" param', function() {
        var perPage = 100;
        controller.notes(ensession, request({per_page: perPage}));
        expect(api.notes).toHaveBeenCalledWith({max: perPage});
      });


      it("uses the per_page default specified in the settings", function() {
        var perPageDefault = settings.paginationPageSizeDefault;
        expect(perPageDefault).toBeNumber();
        controller.notes(ensession, request());
        expect(api.notes).toHaveBeenCalledWith({max: perPageDefault});
      });

      xit('translates the :page param into an "offset" param', function() {
      });

      it("rejects a :per_page greater than 100", function() {
        expect(function() {
          controller.notes(ensession, request({per_page: 101}));
        }).toThrow();
        expect(api.notes).not.toHaveBeenCalled();
      });

    });

  });

  describe('#createNote', function() {

      var rawFixture, formattedFixture;
      beforeEach(function() {
        rawFixture = noteFixtureWithContent("notes#createNote");
        formattedFixture = NoteTransformer.formatNote(rawFixture);
        api.createNote.promise.resolve(rawFixture);
      });

      it("creates a note", function(done) {
        var req = request({id: formattedFixture.id}, {note: formattedFixture});
        controller.createNote(ensession, req).catch(onerror).then(function(response) {
          expect(api.createNote).toHaveBeenCalledWith(formattedFixture);
          expect(response.note).toEqual(formattedFixture);
          expect(response.note).toHaveKey("body");
        }).finally(done);
      });

  });

  describe('#updateNote', function() {

      var rawFixture, formattedFixture;
      beforeEach(function() {
        rawFixture = _.extend(fixtures.load('note'), {title: "New Title"});
        formattedFixture = NoteTransformer.formatNote(rawFixture);
        api.updateNote.promise.resolve(rawFixture);
      });

      it("updates the note", function(done) {
        var req = request({id: formattedFixture.id}, {note: formattedFixture});
        controller.updateNote(ensession, req).catch(onerror).then(function(response) {
          var thriftyNote = api.updateNote.mostRecentCall().args[0];
          expect(thriftyNote).toBeInstanceOf(Evernote.Note);
          expect(thriftyNote.title).toEqual("New Title");
          expect(response.note).toEqual(formattedFixture);
        }).finally(done);
      });

  });

  describe('#deleteNote', function() {

      var victimGuid, updateSequenceNumber;
      beforeEach(function() {
        victimGuid = _.uniqueId("note");
        updateSequenceNumber = 12345;
        api.deleteNote.promise.resolve(updateSequenceNumber);
      });

      it("deletes the note and returns an empty object", function(done) {
        controller.deleteNote(ensession, request({id: victimGuid})).catch(onerror).then(function(response) {
          expect(api.deleteNote).toHaveBeenCalledWith(victimGuid);
          expect(response).toEqual({});
        }).finally(done);
      });

  });

  describe('#notebook', function() {

    var rawFixture, formattedFixture;
    beforeEach(function() {
      rawFixture = fixtures.load('notebooks')[0];
      api.notebook.promise.resolve(rawFixture);
      formattedFixture = NotebookTransformer.formatNotebook(rawFixture);
    });

    it("wraps and transforms the tags from the API", function(done) {
      controller.notebook(ensession, request({id: rawFixture.guid})).catch(onerror).then(function(notebook) {
        expect(api.notebook).toHaveBeenCalled();
        expect(notebook.notebook).toEqual(formattedFixture);
      }).finally(done);
    });

  });

  describe('#notebooks', function() {

    var rawFixture, formattedFixture;
    beforeEach(function() {
      rawFixture = fixtures.load('notebooks');
      api.notebooks.promise.resolve(rawFixture);
      formattedFixture = NotebookTransformer.formatNotebook(rawFixture);
    });

    it("wraps and transforms the notebooks from the API", function(done) {
      controller.notebooks(ensession, request()).catch(onerror).then(function(response) {
        expect(api.notebooks).toHaveBeenCalled();
        expect(response.notebook).toEqual(formattedFixture);
      }).finally(done);
    });

  });

  describe('#createNotebook', function() {

      var rawFixture, formattedFixture;
      beforeEach(function() {
        rawFixture = fixtures.load('notebook');
        formattedFixture = NotebookTransformer.formatNotebook(rawFixture);
        api.createNotebook.promise.resolve(rawFixture);
      });

      it("creates a notebook", function(done) {
        controller.createNotebook(ensession, request({}, {notebook: formattedFixture})).catch(onerror).then(function(response) {
          expect(api.createNotebook).toHaveBeenCalled();
          expect(response.notebook).toEqual(formattedFixture);
        }).finally(done);
      });

  });

  describe('#updateNotebook', function() {

    var rawFixture, formattedFixture;
    beforeEach(function() {
      rawFixture = _.extend(fixtures.load('notebook'), {name: "New Name"});
      formattedFixture = NotebookTransformer.formatNotebook(rawFixture);
      api.updateNotebook.promise.resolve(rawFixture);
    });

    it("updates the notebook", function(done) {
      var req = request({id: formattedFixture}, {notebook: formattedFixture});
      controller.updateNotebook(ensession, req).catch(onerror).then(function(response) {
        var thriftyNotebook = api.updateNotebook.mostRecentCall().args[0];
        expect(thriftyNotebook).toBeInstanceOf(Evernote.Notebook);
        expect(thriftyNotebook.name).toEqual("New Name");
        expect(response.notebook).toEqual(formattedFixture);
      }).finally(done);
    });

  });

  describe('#tag', function() {

    var rawFixture, formattedFixture;
    beforeEach(function() {
      rawFixture = fixtures.load('tags')[0];
      api.tag.promise.resolve(rawFixture);
      formattedFixture = TagTransformer.formatTag(rawFixture);
    });

    it("wraps and transforms the tags from the API", function(done) {
      controller.tag(ensession, request({id: rawFixture.guid})).catch(onerror).then(function(tag) {
        expect(api.tag).toHaveBeenCalled();
        expect(tag.tag).toEqual(formattedFixture);
      }).finally(done);
    });

  });

  describe('#tags', function() {

    var rawFixture, formattedFixture;
    beforeEach(function() {
      rawFixture = fixtures.load('tags');
      api.tags.promise.resolve(rawFixture);
      formattedFixture = TagTransformer.formatTag(rawFixture);
    });

    it("wraps and transforms the tags from the API", function(done) {
      controller.tags(ensession, request()).catch(onerror).then(function(tags) {
        expect(api.tags).toHaveBeenCalled();
        expect(tags.tag).toEqual(formattedFixture);
      }).finally(done);
    });

  });

  describe('#createTag', function() {

      var rawFixture, formattedFixture;
      beforeEach(function() {
        rawFixture = fixtures.load('tags')[0];
        formattedFixture = TagTransformer.formatTag(rawFixture);
        api.createTag.promise.resolve(rawFixture);
      });

      it("creates a tag", function(done) {
        var req = request({id: formattedFixture.id}, {tag: formattedFixture});
        controller.createTag(ensession, req).catch(onerror).then(function(response) {
          expect(api.createTag).toHaveBeenCalledWith(formattedFixture);
          expect(response.tag).toEqual(formattedFixture);
        }).finally(done);
      });

  });

  describe('#updateTag', function() {

    var rawFixture, formattedFixture;
    beforeEach(function() {
      rawFixture = _.extend(fixtures.load('tags')[0], {name: "New Name"});
      formattedFixture = TagTransformer.formatTag(rawFixture);
      api.updateTag.promise.resolve(rawFixture);
    });

    it("updates the tag", function(done) {
      var req = request({id: formattedFixture.id}, {tag: formattedFixture});
      controller.updateTag(ensession, req).catch(onerror).then(function(response) {
        var thriftyTag = api.updateTag.mostRecentCall().args[0];
        expect(thriftyTag).toBeInstanceOf(Evernote.Tag);
        expect(thriftyTag.name).toEqual("New Name");
        expect(response.tag).toEqual(formattedFixture);
      }).finally(done);
    });

  });

  describe('#deleteTag', function() {

      var victimGuid, updateSequenceNumber;
      beforeEach(function() {
        victimGuid = _.uniqueId("tag");
        updateSequenceNumber = 12345;
        api.untagAll.promise.resolve(updateSequenceNumber);
      });

      it("deletes the tag and returns an empty object", function(done) {
        controller.deleteTag(ensession, request({id: victimGuid})).catch(onerror).then(function(response) {
          expect(api.untagAll).toHaveBeenCalledWith(victimGuid);
          expect(response).toEqual({});
        }).finally(done);
      });

  });

  function apiSpy(api) {
    _.functions(api).forEach(function(methodName) {
      var spyPromise = SpyPromise("EvernoteAPI spy for " + methodName);
      spyOn(api, methodName).andCallFake(function() {
        spyPromise.resolve.apply(null, arguments);
        return spyPromise;
      });
      api[methodName].promise = spyPromise;
    });
    return api;
  }

  function request(params, body) {
    var req = {params: params || {}};
    if(body) req.body = body;
    return req;
  }

  function noteFixtureWithContent(content) {
    return _.extend(fixtures.load('note'), {content: utils.wrapNoteContent(content)});
  }

});
