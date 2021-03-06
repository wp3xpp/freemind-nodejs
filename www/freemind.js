/*!
 * freemind
 * Copyright(c) 2015-2016 胡时玮 mailto:wp3xpp@163.com
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter;
var http = require('http');
var merge = require('merge-descriptors');
var logger = require('./logger.js');
var res = require('./response.js');
var req = require('./request.js');
var app = require('./route.js');

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

/**
 * Create an freemind application.
 *
 * @return {Function}
 * @api public
 */
function createApplication(){
	merge(app, http, false);
	merge(app, EventEmitter.prototype, false);
	app.response = { __proto__: res, app: app };
	app.request = { __proto__:req, app:app };
	return app;
}

exports.request = req;
exports.response = res;

//简化创建方式，初始化中间件
app.listen = function listen(port){
	if (typeof port !== 'number'){
		 throw new TypeError('argument port must be a number');
	}
	try{
		var Server = this.createServer();
		Server.listen(port, '0.0.0.0');
		logger.info('Server running at http://127.0.0.1:' + port);
		var self = this;

		Server.on('request', function(req, res){
			req.__proto__ = self.request;
			res.__proto__ = self.response;
			logger.info(req.headers['host'] + ' ' + req.method + ' ' + req.url);
			self.dispatch(req, res); //分发请求
		});
		
		Server.on('close', function(){
			logger.info('SERVER CLOSED');
		});
	}
	catch(e){
		logger.error(e.toString());
	}
};

var showFunctions = function(object){
 Object.getOwnPropertyNames(object).forEach(function forEachOwnPropertyName(name) {
     console.log(name);
 });
};