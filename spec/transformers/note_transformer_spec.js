var _ = require("underscore"),
    Evernote = require("evernote").Evernote,
    fixtures = require("../support/fixtures"),
    transformer = require("../../transformers/note_transformer");

describe('NoteTransformer', function() {

  describe('formatNote', function() {
    it("walks the happy path", function() {
      var formatted = transformer.formatNote(fixtures.load("note")),
          expectedKeys = ["id", "title", "notebook_id", "created", "updated"];

      expect(_.keys(formatted).sort()).toEqual(expectedKeys.sort());

      expect(formatted.content).toBeUndefined(); // notes don't normally have content when queried from a list

      expect(formatted.id).toBeString();
      expect(formatted.title).toBeString();
      expect(formatted.notebook_id).toBeString();
      expect(formatted.created).toBeNumber();
      expect(formatted.updated).toBeNumber();
    });

    it("includes body if content is present", function() {
      var noteFixture = fixtures.load("note");
      noteFixture.content = str();
      var formatted = transformer.formatNote(noteFixture);
      expect(formatted.body).toEqual(noteFixture.content);
    });

    it("does not include body if content is undefined", function() {
      var formatted = transformer.formatNote(fixtures.load("note"));
      expect(formatted.body).toBeUndefined();
    });
  });

  describe('formatNotesResponse', function() {

    it("unwraps and formats every note", function() {
      var results = transformer.formatNotesResponse(fixtures.load("notes_result"));
      expect(results).toBeArray();
      var note = results[0];
      expect(note.id).toBeString();
      expect(note.title).toBeString();
      expect(note.notebook_id).toBeString();
    });

  });

  describe('toThrift', function() {

    it("returns a new Evernote.Note", function() {
      expect(transformer.toThrift({})).toBeInstanceOf(Evernote.Note);
    });

    it("sets id from guid", function() {
      expect(transformer.toThrift({id: "test"}).guid).toEqual("test");
    });

    it("passes guid, title, content, notebookGuid, tagGuids, and tagNames through", function() {
      var given = {
        guid: str(),
        title: str(),
        content: str(),
        notebookGuid: str(),
        tagGuids: [str(), str()],
        tagNames: [str(), str()]
      };
      var thrifty = transformer.toThrift(given);
      _.keys(given).forEach(function(key) {
        expect(thrifty[key]).toEqual(given[key]);
      });
    });

    it("converts body to content", function() {
      var body = str();
      expect(transformer.toThrift({body: body}).content).toEqual(body);
    });

    it("converts tags to tagNames", function() {
      var tags = [str(), str()];
      expect(transformer.toThrift({tags: tags}).tagNames).toEqual(tags);
    });

    it("converts tag_ids to tagGuids", function() {
      var tags = [str(), str()];
      expect(transformer.toThrift({tag_ids: tags}).tagGuids).toEqual(tags);
    });

    it("converts notebook_id to notebookGuid", function() {
      var guid = str();
      expect(transformer.toThrift({notebook_id: guid}).notebookGuid).toEqual(guid);
    });

    it("blocks resources, attributes (for now)", function() {
      var thrifty = transformer.toThrift({resources: str(), attributes: str()});
      expect(thrifty.resources).toBeEmpty();
      expect(thrifty.attributes).toBeEmpty();
    });

    it("does not set any of the virtual attributes on the Thrift object", function() {
      var virtualAttrs = {
        notebook_id: str(),
        tag_ids: [str()],
        tags: [str()],
        id: str()
      };
      var thrifty = transformer.toThrift(virtualAttrs);
      _.keys(virtualAttrs).forEach(function(key) {
        expect(thrifty[key]).toBeUndefined();
      });
    });

  });

  function str() {
    return _.uniqueId("test");
  }
});
