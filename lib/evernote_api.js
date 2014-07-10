var Evernote = require('evernote').Evernote,
    RSVP = require('rsvp'),
    settings = require('../config/settings'),
    ConcurrencyFunnel = require('../lib/concurrency_funnel'),
    NoteTransformer = require('../transformers/note_transformer'),
    NotebookTransformer = require('../transformers/notebook_transformer'),
    TagTransformer = require('../transformers/tag_transformer'),
    _ = require('underscore'),
    _s = require('underscore.string');

EvernoteAPI.Filter = Filter;
EvernoteAPI.ResultSpecification = ResultSpecification;
module.exports = EvernoteAPI;

function EvernoteAPI(options) {
  this.options = _.defaults(options || {}, {
    sandbox: settings.sandbox
  });
}

EvernoteAPI.prototype = {

  client: function() {
    return new Evernote.Client(this.options);
  },

  notestore: function() {
    return this.client().getNoteStore();
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
    return promiseTranslator(function(callback) {
      this.notestore().listNotebooks(callback);
    }, this);
  },

  createNotebook: function(notebook) {
    return promiseTranslator(function(callback) {
      this.notestore().createNotebook(NotebookTransformer.toThrift(notebook), callback);
    }, this);
  },

  createTag: function(tag) {
    return promiseTranslator(function(callback) {
      this.notestore().createTag(TagTransformer.toThrift(tag), callback);
    }, this);
  },

  createNote: function(note) {
    return promiseTranslator(function(callback) {
      this.notestore().createNote(NoteTransformer.toThrift(note), callback);
    }, this);
  },

  notes: function(options) {
    var queryOptions = optionsFromDefaults(options, { offset: 0, max: Evernote.EDAM_USER_NOTES_MAX });
    return promiseTranslator(function(callback) {
      // Both of these know how to cherry-pick their options.
      var filter = Filter(options),
          resultSpec = ResultSpecification(options);

      this.notestore().findNotesMetadata(filter, queryOptions.offset, queryOptions.max, resultSpec, callback);
    }, this);
  },

  note: function(noteGUID) {
    return promiseTranslator(function(callback) {
      this.notestore().getNote(noteGUID, true, false, false, false, callback);
    }, this);
  },

  tags: function() {
    return promiseTranslator(function(callback) {
      this.notestore().listTags(callback);
    }, this);
  },

  deleteNote: function(noteGUID) {
    return promiseTranslator(function(callback) {
      this.notestore().deleteNote(noteGUID, callback);
    }, this);
  },

  // TODO controller
  deleteNotebook: function(notebookGuid) {
    throw("TODO")
  },

  untagAll: function(tagGUID) {
    return promiseTranslator(function(callback) {
      this.notestore().untagAll(tagGUID, callback);
    }, this);
  },

  // May be useful for showing search results that include bodies. This call to notes() should send ResultSpecification
  // options which significantly reduce what's included in the results since each note is fetched independently.
  notesWithContent: function() {
    var self = this;
    return self.notes.apply(self, arguments).then(function(results) {
      var promiseFactory = function() {
        return self.note(this.guid);
      };
      var funnel = new ConcurrencyFunnel(settings.concurrentAPIRequests, results.notes, promiseFactory);
      return funnel.start();
    }).then(function(funnelResults) {
      var successful = _.where(funnelResults, {state: 'fulfilled'});
      return RSVP.Promise.cast(_.pluck(successful, 'value'));
    });
  },

};

// Invokes a function (with a context if useful) which receives a special callback function that works well with the
// Evernote API's signatures of function(err, result). The Promise returned from this is resolved or rejected when the
// callback is invoked. This may not work for *all* Evernote API functions.
function promiseTranslator(fn, context) {
  return new RSVP.Promise(function(resolve, reject) {
    fn.call(context, function(err, result) {
      if(err) reject(err);
      else resolve(result);
    });
  });
}

Filter.FILTER_DEFAULTS = {words: ""};
function Filter(options) {
  options = optionsFromDefaults(options, Filter.FILTER_DEFAULTS);
  var self = new Evernote.NoteFilter();
  _.extend(self, options);
  return self;
}

ResultSpecification.INCLUDED_DEFAULTS = {
  title: true,
  contentLength: true,
  created: true,
  updated: true,
  deleted: true,
  updateSequenceNum: true,
  notebookGuid: true,
  tagGuids: true,
  attributes: false,
  largestResourceMime: true,
  largestResourceSize: true
};

function ResultSpecification(inclusions) {
  inclusions = optionsFromDefaults(inclusions, ResultSpecification.INCLUDED_DEFAULTS);

  var self = new Evernote.NotesMetadataResultSpec();

  // sets each flag with real name, e.g. notebookGuid => includeNotebookGuid
  _.each(inclusions, function(bool, name) {
    self["include" + _s.capitalize(name)] = bool;
  });

  return self;
}

function optionsFromDefaults(options, defaults) {
  var optionsWithExtraKeys = _.defaults(options || {}, defaults);
  var whitelistedKeys = _.keys(defaults);
  var whitelistedOptions = _.pick.apply(null, _.flatten([optionsWithExtraKeys, whitelistedKeys]));
  return  whitelistedOptions;
}
