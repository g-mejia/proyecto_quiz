var models = require('../models/models.js');

// MW que permite acciones solamente si el quiz objeto
// pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next) {
	var objQuizOwner = req.quiz.UserId;
	var logUser = req.session.user.id;
	var isAdmin = req.session.user.isAdmin;

	if(isAdmin || objQuizOwner === logUser) {
		next();
	} else {
		res.redirect('/');
	}
};

//Autoload :id- factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }]
	}).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId)); }
		}
	).catch(function(error) {next(error);});
};

// GET /quizes
exports.index = function(req, res) {
			var s = req.query.search || '';
			var s_like = "%" + s.replace(/ +/g, "%") + "%";
			models.Quiz.findAll({ where: ["pregunta like ?", s_like],
														order: ["pregunta"]})
			.then(function(quizes) {
				res.render('quizes/index', {quizes: quizes, errors: []});
			}
	).catch(function(error) { next(error);})
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: []});
};

//GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	}
	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: []});
};

//GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build(    //crea objeto
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);

	res.render('quizes/new', {quiz: quiz, errors: []});
};

//POST /quizes/create
exports.create = function(req, res) {
	req.body.quiz.UserId = req.session.user.id;
	var quiz = models.Quiz.build( req.body.quiz );

  quiz.validate().then(
		function(err){
			if(err) {
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				//guarda en DB los campos pregunta y respuesta de quiz
				quiz.save({fields: ["pregunta", "respuesta", "UserId"]}).then(function(){
					res.redirect('/quizes')  //Redirección HTTP (URL relativo) lista de preguntas
				})
			}
		}
	);
};

//GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;  //Autoload de instancia de quiz

	res.render('quizes/edit', {quiz: quiz, errors: []});
};

//PUT /quizes/:id
exports.update = function(req,res){
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta;

	req.quiz
	.validate()
	.then(
		function(err){
			if (err) {
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				req.quiz  //guarda en DB los campos pregunta y respuesta de quiz
				.save({fields: ["pregunta", "respuesta"]})
				.then(function(){res.redirect('/quizes');});
			}				//Redirección HTTP (URL relativo) lista de preguntas
		}
	);
};

//DELETE /quizes/:id
exports.destroy = function(req, res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};

//GET /quizes/statistics
exports.showStatistics = function(req, res) {
	models.Quiz.findAll({include:[{model: models.Comment}]})
	.then(function(quizes){
		models.Comment.count().then(function(comments){

			var numPreguntas = quizes.length;
			var media = comments/numPreguntas;
			var preguntasConComentarios=0;
			for(i=0; i<numPreguntas; i++){
				if(quizes[i].Comments.length>0){
					preguntasConComentarios++;
				}
			}
			var preguntasSinComentarios= numPreguntas - preguntasConComentarios;
			res.render('quizes/statistics', {numPreguntas: numPreguntas, comments: comments, media: media, preguntasConComentarios: preguntasConComentarios, preguntasSinComentarios: preguntasSinComentarios, errors:[]});
		});
	});
};
