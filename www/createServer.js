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
var modles = require('./models.js');

var app = freemind();

modles(insertModel);

var initMiddlewares = function(){
	app.use(middlewares.getQueryString);
	app.get('/static/*', middlewares.staticFile);
	app.get('/', handles.index);
	app.get('/manage', handles.login);
};
initMiddlewares();

function insertModel(){
	modles.users.create([
	{
		email : "wp3xpp",
    	passwd : "Hsw2mapei",
    	admin : true,
    	name : "freemind"
	}
	],function(err){if(err) throw err;})
};


app.listen(8000);

