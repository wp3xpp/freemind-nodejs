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
	if(err){
		logger.error(err.toString());
		throw err;
	}
	db.settings.set('instance.cache', true);    
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

/*create table users (
    `id` varchar(50) not null,
    `email` varchar(50) not null,
    `passwd` varchar(50) not null,
    `admin` bool not null,
    `name` varchar(50) not null,
    `image` varchar(500) not null,
    `created_at` real not null,
    unique key `idx_email` (`email`),
    key `idx_created_at` (`created_at`),
    primary key (`id`)
) engine=innodb default charset=utf8;*/
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

/*
create table blogs (
    `id` varchar(50) not null,
    `user_id` varchar(50) not null,
    `user_name` varchar(50) not null,
    `user_image` varchar(500) not null,
    `name` varchar(50) not null,
    `summary` varchar(200) not null,
    `content` mediumtext not null,
    `created_at` real not null,
    key `idx_created_at` (`created_at`),
    primary key (`id`)
) engine=innodb default charset=utf8;
*/

var blogs = exports.blogs = db.define('blogs', {
	user_id : { type:"text", size:50, required:true },
	user_name : { type:"text", size:50, required:true },
	user_image : { type:"text", size:500, required:true },
	name : { type:"text", size:50, required:true },
	summary : { type:"text", size:200, required:true },
	content : { type:"text", required:true },
	created_at: { type:"number", required:true, unsigned:true, defaultValue:new Date().getTime() },
}, {
	
});

/*
create table comments (
    `id` varchar(50) not null,
    `blog_id` varchar(50) not null,
    `user_id` varchar(50) not null,
    `user_name` varchar(50) not null,
    `user_image` varchar(500) not null,
    `content` mediumtext not null,
    `created_at` real not null,
    key `idx_created_at` (`created_at`),
    primary key (`id`)
) engine=innodb default charset=utf8;
*/

var comments = exports.comments = db.define('comments', {
	blog_id : { type:"text", size:50, required:true },
	user_id : { type:"text", size:50, required:true },
	user_name : { type:"text", size:50, required:true },
	user_image : { type:"text", size:500, required:true },
	content : { type:"text", required:true },
	created_at: { type:"number", required:true, unsigned:true, defaultValue:new Date().getTime() },
}, {
	
});