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
var handles = require('./controllers/handlers.js');

var app = freemind(); 

(function(){
	app.use(middlewares.getQueryString);
	app.get('/static/*', middlewares.staticFile);
	app.get('/', handles.index);
})();


app.listen(8000);

