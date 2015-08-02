/*!
 * freemind
 * Copyright(c) 2014-2015 胡时玮 mailto:wp3xpp@163.com
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var Q = require('q');
var crypto = require('crypto');
var logger = require('../logger.js');
var models = require('../models.js');

exports.handle404 = function handle404(req, res){
	res.writeHead(404);
	res.render('404.html', {});
};

exports.handle500 = function handle500(req, res){
	res.writeHead(500, {'Content-Type': 'text/html; charset=utf8'});
	res.end('500 Internal server error!\n');
};


exports.index = function index(req, res){
	try{
		res.render('index.html', {}); 
	}
	catch(e){
		logger.error(e.toString());
	}
};

exports.login = function login(req, res){
	try{
		res.render('login.html', {}); 
	}
	catch(e){
		logger.error(e.toString());
	}
};

exports.register = function register(req, res){
	try{
		res.render('register.html', {});
	}
	catch(e){
		logger.error(e.toString());
	}
};

var getHash = function(str){
	var shasum = crypto.createHash('sha1');
	return shasum.update(str).digest('hex');
};

var salt = "freemind"; //给密码加盐

exports.api_register_user = function api_register_user(req, res){
	if (req.body.email === undefined || req.body.passwd === undefined){
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
		res.write('<h1>email passwd is undefined</h1>');
		res.end("<script>window.history.go(-1);</script>");
	}
	try{
		var emailExist = function(req, res){
			var deferred = Q.defer();
			models.users.exists({email: req.body.email}, function(err, exists){
				if(exists){
					deferred.reject(res);
				}
				else{
					deferred.resolve({req:req, res:res});
				}
			});
			return deferred.promise;
		}
		
		emailExist(req, res).then(function(func){
			models.users.create({email : func.req.body.email,
				passwd : getHash(salt + func.req.body.passwd), 
				admin : true, 
				name : func.req.body.name
			},function(err){
				if(err){
					logger.error(err.toString());
					throw err;
				}
				func.res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
				func.res.end("<script>window.location.href='/';</script>");
			});
		})
		.fail(function(res){
			logger.info(typeof res);
			res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
			res.write('<h1>sorry, email is already in use</h1>');
			res.end("<script>setTimeout(function(){window.history.go(-1)}, 3000);</script>");
		});
		
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.manageBlogs = function manageBlogs(req, res){
	try{
		res.render('manageBlogs.html', {layout:'manage_base.html'});
	}
	catch(e){
		logger.error(e.toString());
	}
};

exports.manageUsers = function manageBlogs(req, res){
	try{
		res.render('manageUsers.html', {layout:'manage_base.html'});
	}
	catch(e){
		logger.error(e.toString());
	}
};