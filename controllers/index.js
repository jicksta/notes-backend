// var User = require('../models/user');
exports.index = function (req, res) {
  res.render('index', {
    title: 'notes-backend-express'
  });
};
