var Evernote = require('evernote').Evernote,
    RSVP = require('rsvp'),
    settings = require('../config/settings'),
    ConcurrencyFunnel = require('../lib/concurrency_funnel'),
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
    var notestore = this.notestore();
    return new RSVP.Promise(function(resolve, reject) {
      notestore.listNotebooks(function(err, notebooks) {
        err ? reject(err) : resolve(notebooks);
      });
    });
  },

  notes: function(options) {
    var self = this,
        notestore = self.notestore();

    var queryOptions = optionsFromDefaults(options, {
      offset: 0,
      max: Evernote.EDAM_USER_NOTES_MAX
    });

    return new RSVP.Promise(function(resolve, reject) {
      // Both of these know how to cherry-pick their options.
      var filter = Filter(options),
          resultSpec = ResultSpecification(options);

      notestore.findNotesMetadata(
          filter,
          queryOptions.offset,
          queryOptions.max,
          resultSpec,
          function(err, results) {
            err ? reject(err) : resolve(results);
          });
    });
  },

  note: function(guid) {
    var notestore = this.notestore();
    return new RSVP.Promise(function(resolve, reject) {
      notestore.getNote(guid, true, false, true, true, function(err, note) {
        err ? reject(err) : resolve(note);
      });
    });
  },

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

//  tags: function() {
//    var client = this.client();
//    return new RSVP.Promise(function(resolve, reject) {
//      client.getNoteStore().listTags(function(err, tags) {
//        err ? reject(err) : resolve(tags);
//      });
//    });
//  },

  tags: function() {
    var client = this.client();
    return promiseTranslator(function(callback) {
      client.getNoteStore().listTags(callback);
    });
  }

};

function promiseTranslator(fn) {
  return new RSVP.Promise(function(resolve, reject) {
    fn(function(err, result) {
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
  attributes: true,
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
