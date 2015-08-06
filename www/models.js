/*!
 * freemind
 * Copyright(c) 2014-2015 胡时玮 mailto:wp3xpp@163.com
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
var logger = require('./logger.js');
var opts = require('./config/dbConfig.js');
var orm = require('orm');

var db = orm.connect(opts, function (err, db) {
    db.settings.set('instance.cache', true);
	if(err){
		logger.error(err.toString());
		throw err;
	}    
});

var initDB = function(){

	users.sync(function (err) {
	    !err && logger.info("users has been created!");
	});

	blogs.sync(function (err) {
	    !err && logger.info("blogs has been created!");
	});

	comments.sync(function (err) {
	    !err && logger.info("comments has been created!");
	});

}

exports = module.exports = initDB;

var users = exports.users = db.define('users', {      
    email : { type:"text", size:50, required:true},
    passwd : { type:"text", size:50, required:true },
    admin : { type:"boolean", required:true },
    name : { type:"text", size:50, required:true },
    image : { type:"text", size:500 },
    created_at: { type:"number", required:true, size:8, defaultValue:new Date().getTime() },
}, {
    // options (optional)
    
});

var blogs = exports.blogs = db.define('blogs', {
	blog_id : { type:"text", size:50, required:true, key:true },
	user_name : { type:"text", size:50, required:true },
	user_image : { type:"text", size:500},
	title : { type:"text", size:50, required:true },
	summary : { type:"text", size:200, required:true },
	content : { type:"text", size:20000, required:true },
	created_at: { type:"number", required:true, size:8, defaultValue:new Date().getTime() },
}, {
	
});

var comments = exports.comments = db.define('comments', {
	blog_id : { type:"text", size:50, required:true },
	user_id : { type:"text", size:50, required:true },
	user_name : { type:"text", size:50, required:true },
	user_image : { type:"text", size:500, required:true },
	content : { type:"text", required:true },
	created_at: { type:"number", required:true, unsigned:true, defaultValue:new Date().getTime() },
}, {
	
});