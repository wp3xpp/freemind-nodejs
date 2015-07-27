/*!
 * FreeMind
 * Copyright(c) 2014-2015 freemind
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var logger = require('./logger.js');
var freemind = require('./freemind.js');
var middlewares = require('./middlewares/middlewares.js');

var app = freemind(); 

var test = function(req, res, next){	
	res.end("It's ok la \n");
	next();
};

var renderTest = function(req, res, next){
	try{
		res.render('index.html', {user:'freemind'}); 
		next();
	}
	catch(e){
		logger.error(e.toString());
	}
	
};


var addRoutes = function(){
	app.use(middlewares.getQueryString);
	app.use('/static/*', middlewares.staticFile);
	app.get('/haha', test);
	app.use('/', renderTest);
};
addRoutes(); 

app.listen(8000);

