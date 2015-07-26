/*!
 * FreeMind
 * Copyright(c) 2014-2015 freemind
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var http = require('http');
var logger = require('./logger.js');
var app = require('./router.js').app;
var dispatch = require('./router.js').dispatch;
var middlewares = require('./middlewares/middlewares.js');
var res = require('./render.js');


var test2 = function(req, res, next){	
	res.end("It's ok la \n");
	next();
}

var renderTest = function(req, res, next){
	res.render('test.html', {}); 
	next();
}

var addRoutes = function(){
	app.use(middlewares.getQueryString);
	app.use('/static/*', middlewares.staticFile);
	app.get('/haha', test2);
	app.use('/', renderTest);
}
addRoutes(); 

var awesomeServer = http.createServer();
awesomeServer.listen(8888, '127.0.0.1');
logger.info('Server running at http://127.0.0.1');

awesomeServer.on('request', function(req, res){
	logger.info(req.headers['host'] + ' ' + req.method + ' ' + req.url);
	dispatch(req, res); //分发请求
})

awesomeServer.on('close', function(){
	logger.info('SERVER CLOSED');
})


