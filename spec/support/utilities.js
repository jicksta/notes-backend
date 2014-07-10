module.exports = {
  wrapNoteContent: function(innerXHTML) {
    return "" +
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">' +
        '<en-note>' + innerXHTML + '</en-note>';
  }
};
