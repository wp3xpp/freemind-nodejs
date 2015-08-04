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

modles(); //如果还没建立起对应数据库，调用该方法可以创建

var initMiddlewares = function(){
	app.use(middlewares.getQueryString);
	app.use(middlewares.cookie);
	app.use(middlewares.handleData, middlewares.handlePostdata);
	app.get('/static/*', middlewares.staticFile);
	app.get('/', handles.index);
	app.get('/manage', handles.login);
	app.get('/registe', handles.register);
	app.get('/blogs/:blogid', handles.showBlog);
	app.get('/api/users', handles.getUsers);
	app.get('/api/blogs', handles.getBlogs);
	app.get('/api/blog/:blogid', handles.api_get_blog);
	app.get('/manage/blogs', handles.manageBlogs);
	app.get('/manage/users', handles.manageUsers);
	app.post('/api/register', handles.api_register_user);
};
initMiddlewares();

app.listen(8000);

