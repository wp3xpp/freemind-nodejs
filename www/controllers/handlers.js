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
var uuid = require('../uuid.js');

var salt = "freemind"; //给密码加盐
var COOKIE_NAME = "googleid"; 

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
		if(req.cookies[COOKIE_NAME]){
			var email = req.cookies[COOKIE_NAME].split('-')[0];
			var sha1 = req.cookies[COOKIE_NAME].split('-')[1];
			models.users.find({email:email}, function(err, user){
				if(err){
					logger.error(err.toString());
				}
				if(getHash(user[0].email+user[0].passwd+salt) === sha1 && user[0].admin === true){
					res.redirect('/manage/blogs');
				}else{
					res.writeHead(403, {"Content-Type" : "text/html; charset=utf8"});
					res.end("<h1>403 Forbidden, you are not admin</h1>");
				}				
			});
		}else{
			res.render('login.html', {});
		}
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

function getHash(str){
	var shasum = crypto.createHash('sha1');
	return shasum.update(str).digest('hex');
}

function serialize(name, val, opt){
	var pairs = [name + '=' + val];
	opt = opt || {};
	if(opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
	if(opt.domain) pairs.push('Domain=' + opt.domain);
	if(opt.path) pairs.push('Path=' + opt.path);
	if(opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
	if(opt.httpOnly) pairs.push('HttpOnly');
	if(opt.secure) pairs.push('Secure');

	return pairs.join(';');
}

function user2cookie(user){
	return (user.email + "-" + getHash(user.email+user.passwd+salt));
}

exports.api_login = function api_login(req, res){
	try{
		models.users.find({email:req.body.email}, 1, function(err, user){
			if(err){
				logger.error(err.toString());
			}
			if(user[0]){
				if(user[0].passwd === getHash(salt + req.body.passwd)){
					var opt = {};
					if(req.body.remember === 'on'){
						opt.maxAge = 86400*7;
						opt.path = '/';
					}else{
						opt.maxAge = 86400;
						opt.path = '/';
					}
					res.setHeader('Set-Cookie', serialize(COOKIE_NAME, user2cookie(user[0]), opt));
					res.redirect('/');
				}else{
					res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
					res.end("<script>alert('密码错误');location.assign('/manage')</script>");
				}
			}
			else{
				res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
				res.end("<script>alert('该邮箱未注册');location.assign('/manage')</script>");
			}
		});
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.api_register_user = function api_register_user(req, res){
	if (req.body.email === undefined || req.body.passwd === undefined){
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
		res.end("post数据传输过程中丢失");
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
		};
		
		emailExist(req, res).then(function(func){
			models.users.create(
			{	email : func.req.body.email,
				passwd : getHash(salt + func.req.body.passwd), 
				admin : false, 
				name : func.req.body.name
			},function(err){
				if(err){
					logger.error(err.toString());
					throw err;
				}
				var opt = { maxAge : 86400, path : '/' };
				func.res.setHeader('Set-Cookie', serialize(COOKIE_NAME, user2cookie(func.req.body), opt));
				func.res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
				func.res.end("success create");
			});
		})
		.fail(function(res){
			res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
			res.end("邮箱已经被注册了,不好意思啊");
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
	catch(err){
		logger.error(err.toString());
	}
};

exports.manageUsers = function manageBlogs(req, res){
	try{
		res.render('manageUsers.html', {layout:'manage_base.html'});
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.getUsers = function getUsers(req, res){
	try{
		models.users.find({}, ["created_at", "Z"], function(err, users){
			if(err){
				logger.error(err.toString());
			}
			for(var user of users){
				user.passwd = "******";
				user.created_at = new Date(user.created_at).toLocaleString();
			}
			return res.json(users);
		});
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.getBlogs = function getUsers(req, res){
	try{
		models.blogs.find({}, ["created_at", "Z"], function(err, blogs){
			if(err){
				logger.error(err.toString());
			}
			for(var blog of blogs){
				blog.created_at = new Date(blog.created_at).toLocaleString();
			}
			return res.json(blogs);
		});
	}
	catch(err){
		logger.error(err.toString());
	}
};


exports.api_get_blog = function api_get_blog(req, res){
	try{
		models.blogs.find({blog_id: req.params.blogid}, 1, function(err, blog){
			if(err){
				logger.error(err.toString());
			}
			res.json(blog[0]);
		});	
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.showBlog = function showBlog(req, res){
	try{
		models.blogs.find({blog_id: req.params.blogid}, 1, function(err, blog){
			if(err){
				logger.error(err.toString());
			}
			if(blog[0]){
				res.render("blog.html", {blog_id: blog[0].blog_id});
			}
			else{
				exports.handle404(req, res);
			}
		});	
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.editBlog = function editBlog(req, res){
	try{
		models.blogs.find({blog_id: req.params.blogid}, 1, function(err, blog){
			if(err){
				logger.error(err.toString());
			}
			if(blog[0]){
				res.render("manage_blog_edit.html", {blog: blog[0]});
			}
			else{
				res.render("manage_blog_edit.html", {blog: {blog_id:req.params.blogid, title:'', user_name:'', summary:'', content:''}});
			}
		});		
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.updateBlog = function updateBlog(req, res){
	try{
		models.blogs.find({blog_id: req.body.blog_id}, 1, function(err, blog){
			if(err){
				throw err;
			}
			if(blog[0]){
				blog[0].user_name = req.body.author;
				blog[0].title = req.body.title;
				blog[0].summary = req.body.summary;
				blog[0].content = req.body.content;
				blog[0].created_at = new Date().getTime();
				blog[0].save(function(err){
					if(err){
						res.end("update failed");
						logger.error(err.toString());
					}
					res.end("update success");
				});
			}
			else{
				models.blogs.create({
					blog_id : uuid(),
					user_name : req.body.author, 
					title : req.body.title, 
					summary : req.body.summary,
					content : req.body.content
				},function(err){
					if(err){
						res.end("save failed");
						logger.error(err.toString());
					}
					res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
					res.end("success save");
				});
			}
		});	
	}
	catch(err){
		logger.info(err.toString());
	}
};

exports.deleteBlog = function deleteBlog(req, res){
	try{
		models.blogs.find({ blog_id:req.body.blog_id }).remove(function (err) {
    		if(err){
    			res.end("删除失败");
    			logger.error(err.toString());
    		}
    		res.end("删除成功");
		});
	}
	catch(err){
		logger.error(err.toString());
	}
};

exports.deleteUser = function deleteUser(req, res){
	try{
		models.users.find({ id:req.body.user_id }).remove(function (err) {
    		if(err){
    			res.end("删除失败");
    			logger.error(err.toString());
    		}
    		res.end("删除成功");
		});
	}
	catch(err){
		logger.error(err.toString());
	}
};