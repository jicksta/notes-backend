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
        controller.notes(ensession, requestWithParams({per_page: perPage}));
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
          controller.notes(ensession, requestWithParams({per_page: 101}));
        }).toThrow();
        expect(api.notes).not.toHaveBeenCalled();
      });

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

  describe('#note', function() {

    var rawFixture, formattedFixture;
    beforeEach(function() {
      rawFixture = noteFixtureWithContent("notes#note");
      api.note.promise.resolve(rawFixture);
      formattedFixture = NoteTransformer.formatNote(rawFixture);
    });

    it("returns the note with its body", function(done) {
      controller.note(ensession, requestWithParams({id: rawFixture.guid})).catch(onerror).then(function(response) {
        expect(api.note).toHaveBeenCalledWith(rawFixture.guid);
        expect(response.note).toEqual(formattedFixture);
        expect(response.note.body).toBeString(); // so the server can post-process a note for the client
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

  describe('#createNotebook', function() {

      var rawFixture, formattedFixture;
      beforeEach(function() {
        rawFixture = fixtures.load('notebook');
        formattedFixture = NotebookTransformer.formatNotebook(rawFixture);
        api.createNotebook.promise.resolve(rawFixture);
      });

      it("creates a notebook with the name given in the params", function(done) {
        controller.createNotebook(ensession, requestWithParams({notebook: formattedFixture})).catch(onerror).then(function(response) {
          expect(api.createNotebook).toHaveBeenCalled();
          expect(response.notebook).toEqual(formattedFixture);
        }).finally(done);
      });

  });

  describe('#createNote', function() {

      var rawFixture, formattedFixture;
      beforeEach(function() {
        rawFixture = noteFixtureWithContent("notes##createNote");
        formattedFixture = NoteTransformer.formatNote(rawFixture);
        api.createNote.promise.resolve(rawFixture);
      });

      it("creates a note", function(done) {
        controller.createNote(ensession, requestWithParams({note: formattedFixture})).catch(onerror).then(function(response) {
          expect(api.createNote).toHaveBeenCalledWith(formattedFixture);
          expect(response.note).toEqual(formattedFixture);
          expect(response.note).toHaveKey("body");
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

  function request() {
    return {params: {}};
  }

  function requestWithParams(params) {
    var req = request();
    _.extend(req.params, params);
    return req;
  }

  function noteFixtureWithContent(content) {
    return _.extend(fixtures.load('note'), {content: utils.wrapNoteContent(content)});
  }

})
;
