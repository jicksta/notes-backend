var ConcurrencyFunnel = require('./lib/concurrency_funnel');

module.exports = {
  cleanNotes: function(ensession) {

    ensession.api.notes().then(function(notes) {
      console.log("Found " + notes.length + " notes");
      return new ConcurrencyFunnel(25, notes, function() {
        var note = this;
        var deletion = ensession.api.deleteNote(note.guid);
        deletion.then(function() {
          console.log("Deleted note with id " + note.guid)
        });
        return deletion;
      }).start();
    }).catch(function(error) {
      console.error(error);
    });

  }

};

