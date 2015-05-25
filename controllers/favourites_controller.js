var models = require('../models/models.js');

//GET /user/:userId/favourites
exports.index = function(req, res, next) {
  models.User.findAll( {where: {id: Number(UserId)},
                        include: [{ model: models.Quiz}]})
		.then(function(quizes) {
			res.render('favourites/index.ejs', {quizes: quizes, errors: []});
			}
	).catch(function(error) { next(error);})

}

//PUT /user/:userId/favourites/:quizId
exports.add = function(req, res, next) {
  var redir = req.body.redir || '/user/' + req.user.id + '/favourites';

  req.user.addFavourite(req.quiz)
  .then(function() {
    res.redirect(redir);
  }).catch(function(error) {next(error);
  });
};

//DELETE /user/:userId/favourites/:quizId
exports.delete = function(req, res, next) {
  var redir = req.body.redir || '/user/' + req.user.id + '/favourites';

  req.user.removeFavourite(req.quiz)
  .then(function() {
    res.redirect(redir);
  }).catch(function(error) {next(error);
  });
};
