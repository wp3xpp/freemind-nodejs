/*!
 * FreeMind
 * Copyright(c) 2014-2015 freemind
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
//RESTful
//RESTful主要思想是对一个资源的操作主要体现在HTTP请求方法上，而不是体现在URL上
var url = require('url');
var logger = require('./logger.js');
var handlers = require('./controllers/handlers.js');
var handle404 = handlers.handle404;

var routes = {'all': []};
var app = {};

module.exports = app;

//可以使用如下注册中间件方法
//app.use(querystring)
//app.use(cookie)
//app.use(session)
//app.get('/user/:username', getUser)
//app.put('/user/:username', authorize, updateUser)
app.use = function(path){
	var handle;
	if(typeof path === 'string'){
		logger.info('register: ' + 'use' + ' ' + path );
		handle = {
			//第一个参数作为路径
			path : pathRegexp(path),
			//其他都是处理单元
			stack : Array.prototype.slice.call(arguments, 1)
		};
	}
	else{
		handle = {
			//第一个参数作为路径
			path : pathRegexp('*'),
			//其他是处理单元
			stack : Array.prototype.slice.call(arguments, 0)
		};
	}

	routes.all.push(handle);
};

['get', 'put', 'delete', 'post'].forEach(function(method){
	routes[method] = [];
	app[method] = function(path){
		var handle;
		if(typeof path === 'string'){
			logger.info('register: ' + method + ' ' + path );
			handle = {
				//第一个参数作为路径
				path : pathRegexp(path),
				//其他都是处理单元
				stack : Array.prototype.slice.call(arguments, 1)
			};
		}
		else{
			handle = {
				//第一个参数作为路径
				path : pathRegexp('*'),
				//其他是处理单元
				stack : Array.prototype.slice.call(arguments, 0)
			};
		}
		routes[method].push(handle);
	};
});

//中间件具体如何调用交给handle,递归性的执行数组中的中间件
//为next方法添加err参数,捕获中间件直接抛出的同步异常
var handle = function(req, res, stack){
	var next = function(err){
		if (err) {
			return handleError(err, req, res, stack);
		}
		//从stack数组中取出中间件并执行
		var middleware = stack.shift();
		if(middleware){
			//传入next()函数自身，使中间件能够执行结束后递归
			try{
				middleware(req, res, next);
			}		
			catch(err){
				next(err);
			}	
		}
	};

	//启动执行
	next();
};

//为了区分普通中间件和异常处理中间件,handleError()方法会按照参数个数进行选取
var handleError = function(err, req, res, stack){
	//选取异常处理中间件
	stack = stack.filter(function(middleware){
		return middleware.length === 4;
	});

	var next = function(){
		//从stack数组中取出中间件并执行
		var middleware = stack.shift();
		if(middleware){
			//传递异常对象
			middleware(err, req, res, next);
		}
	};

	//启动执行
	next();
};

//匹配部分由下面的match方法完成
//返回路由所匹配的中间件
var match = function(pathname, routes, req){
	var stacks = [];
	for(var i=0;i < routes.length; i++){
		var route = routes[i];
		//正则匹配
		var reg = route.path.regexp;
		var keys = route.path.keys;
		var matched = reg.exec(pathname);
		if(matched){
			//抽取具体值
			var params = {};
			for(var j=0, l=keys.length; j < l; j++){
				var value = matched[j+1];
				if (value) {
					params[keys[j]] = value;
				}
			}
			req.params = params;
			//储存匹配中间件
			stacks = stacks.concat(route.stack);
		}
	}
	return stacks;
};

//以下为分发部分
app.dispatch = function(req, res){
	var pathname = url.parse(req.url).pathname;
	//将请求方法变为小写
	var method = req.method.toLowerCase();
	//获取all方法的中间件
	var stacks = match(pathname, routes.all, req);
	var middlewareLength = stacks.length;
	if(routes.hasOwnProperty(method)){
		//根据请求方法分发,获取相关的中间件	
		//stacks.concat(match(pathname, routes[method], req, res));
		stacks.push.apply(stacks, match(pathname, routes[method], req));
	}
	if(middlewareLength < stacks.length){
		handle(req, res, stacks);
	}
	else{
		handle404(req, res);
	}
}

//以下为改进路由匹配方式,将路径转换为正则表达式
// /profile/:username => /profile/jacksontian, /profile/hushiwei
// /user.:ext => /user.xml, /user.json
var pathRegexp = function(path){
	var keys = [];
	var strict = strict || false;

	path = path
		   .concat(strict ? '' : '/?')
		   .replace(/\/\(/g, '(?:/')
		   .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, 
		   	optional, star){
		   	//将匹配到的键值保存起来
		   	keys.push(key);

		   	slash = slash || '';
		   	return ''
		   		   + (optional ? '' : slash)
		   		   + '(?:'
		   		   + (optional ? slash : '')
		   		   + (format || '') + (capture || (format &&  '([^/.]+?' || '(^/]+?)')) + ')' 
		   		   + (optional || '')
		   		   + (star ? '(/*)' : '');
		   })
		   .replace(/([\/.])/g, '\\$1')
		   .replace(/\*/g, '(.*)');
	return {
		keys : keys, 
		regexp : new RegExp('^' + path + '$')
	};
}


