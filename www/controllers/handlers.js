/*!
 * freemind
 * Copyright(c) 2014-2015 胡时玮 mailto:wp3xpp@163.com
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var logger = require('../logger.js');

exports.handle404 = function handle404(req, res){
	res.render('404.html', {});
};

exports.handle500 = function handle500(req, res){
	res.writeHead(500, {'Content-Type': 'text/html; charset=utf8'});
	res.end('500 Internal server error!\n');
};


exports.index = function index(req, res, next){
	try{
		res.render('index.html', {user:'freemind'}); 
		next();
	}
	catch(e){
		logger.error(e.toString());
	}
	
};
