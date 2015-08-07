/*!
 * FreeMind
 * Copyright(c) 2015-2016 freemind
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
	app.post(middlewares.handleData, middlewares.handlePostdata);
	app.get('/static/*', middlewares.staticFile);
	app.use('/manage/*', middlewares.authorization);

	app.get('/api/users', handles.getUsers);
	app.get('/api/blogs', handles.getBlogs);
	app.get('/api/blog/:blogid', handles.api_get_blog);
	app.get('/api/signout', handles.signout);
	app.post('/api/register', handles.api_register_user);
	app.post('/api/update/blog', handles.updateBlog);
	app.post('/api/delete/blog', handles.deleteBlog);
	app.post('/api/delete/user', handles.deleteUser);
	app.post('/api/login', handles.api_login);

	app.get('/', handles.index);
	app.get('/registe', handles.register);
	app.get('/blogs/:blogid', handles.showBlog);

	app.get('/manage', handles.login);
	app.get('/manage/blogs', handles.manageBlogs);
	app.get('/manage/users', handles.manageUsers);
	app.get('/manage/blog/edit/:blogid', handles.editBlog);
};
initMiddlewares();

app.listen(8000);

