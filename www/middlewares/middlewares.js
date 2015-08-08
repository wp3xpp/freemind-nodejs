var url = require('url');
var querystring = require('querystring');
var logger = require('../logger.js');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var xml2js = require('xml2js');
var formidable = require('formidable');
var crypto = require('crypto');
var models = require('../models.js');

/**中间件统一格式
 *  exports.function(req, res, next){
 *		TODO:
 *	 	next();
 *	}
 */
//需要与handlers.js中的salt，COOKIE_NAME保持一致
var salt = "freemind"; //给密码加盐
var COOKIE_NAME = "googleid"; 

//查询字串中间件
exports.getQueryString = function(req, res, next){
	//var query = querystring.parse(url.parse(req.url).query); //一种获得查询字符串的方法
	//var query = url.parse(req.url, true).query; //更简洁的获得查询字符串的方法
	req.query = url.parse(req.url, true).query; //将查询字符串挂载在req上 
	return next();
};

//cookie解析中间件
exports.cookie = function(req, res, next){
	var cookie = req.headers.cookie;
	var cookies = {};
	if(cookie){
		var list = cookie.split(';');
		for(var i=0;i < list.length; i++){
			var pair = list[i].split('=');
			cookies[pair[0].trim()] = pair[1];
		}
	}

	req.cookies = cookies;
	return next();
};

var getEtag = function(str){
	var shasum = crypto.createHash('sha1');
	return shasum.update(str).digest('base64');
};

//如果app.use(staticFile);这样注册误伤率会太高
//应该使用app.use('/static', staticFile)类似方式注册提高效率
//静态文件加载中间件
//引入缓存机制
exports.staticFile = function(req, res, next){
	var ROOT = './';
	var PATH = url.parse(req.url).pathname;
	var pathname = PATH.slice(PATH.lastIndexOf('static'));
	var contenType = mime.lookup(pathname);
	var pipeStream = /^static\/fonts|i\/.*$/g;
	if(pipeStream.test(pathname)){
		//字体文件需要用流形式传送
		res.sendfile(path.join(ROOT, pathname));
	}
	else{
		fs.readFile(path.join(ROOT, pathname), 'utf8', function(err, file){
			if(err){
				return next(err);
			}
			var hash = getEtag(file);
			var noneMatch = req.headers['if-none-match'];
			if(hash === noneMatch){
				res.writeHead(304, "Not Modified");
				res.end();
			}
			else{
				res.setHeader("Etag", hash);
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.setHeader("Content-Type", contenType +';charset=utf8');
				res.end(file);
			}
		});
	}
	return next();
};

function getType(req){
	var str = req.headers['content-type'] || '';
	return str.split(';')[0];
}

function hasBody(req){
	return 'transfer-encoding' in req.headers || 'content-length' in req.headers;
}

//HTTP_Parser解析报头结束后，报文内容部分会用过data事件触发
exports.handleData = function(req, res, next){
	
	try{
		if(hasBody(req)){
			var  buffers = [];
			req.on('data', function(chunk){
				buffers.push(chunk);
			});
			req.on('end', function(){
				req.rawBody = Buffer.concat(buffers).toString();
				return next();
			});
		}
		else{
			return next();
		}
	}
	catch(err){
		next(err);
	}
};

//获取post数据中间件
exports.handlePostdata = function(req, res, next){
	if(hasBody(req)){
		if(getType(req) === 'application/x-www-form-urlencoded'){
			req.body = querystring.parse(req.rawBody);
		}
	
		if(getType(req) === 'application/json'){
			try{
				req.body = JSON.parse(req.rawBody);
			}
			catch(e){
				//异常内容,响应Bad request
				res.writeHead(400);
				res.end('Invalid JSON');
				return next(err);
			}
		}

		if(getType(req) === 'application/xml'){
			xml2js.parseString(req.rawBody, function(err, xml){
				if(err){
					//异常内容,响应Bad request
					res.writeHead(400);
					res.end('Invalid xml');
					return next(err);
				}
				req.body = xml;
			});
		}

		if(getType(req) === 'multipart/form-data'){
			try{
				var form = new formidable.IncomingForm();
				form.parse(req, function(err, fields, files){
					req.body = fields;
					req.files = files;
				});
			}
			catch(err){
				res.writeHead(400);
				res.end('upload error');
				next(err);
			}		
		}
	}
	logger.info(req.body);
	return next();
};	

//Basic 认证
var encode  = function(username, password) {
	return new Buffer(username + ':' + password).toString('base64');
};

exports.basic =  function(req, res, next){
	var auth = req.headers['authorization'] || '';
	var parts = auth.split(' ');
	var method = parts[0] || ''; //Basic
	var encoded = parts[1] || '';
	var decoded = new Buffer(encoded, 'base64').toString('utf-8').split(":");
	var user = decoded[0]; //user
	var pass = decoded[1]; //pass
	if(!checkUser(user, pass)){
		res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
		res.writeHead(401);
		res.end();
	}
	next();
};

function getHash(str){
	var shasum = crypto.createHash('sha1');
	return shasum.update(str).digest('hex');
}

exports.authorization = function(req, res, next){
	if(req.cookies[COOKIE_NAME]){
		var email = req.cookies[COOKIE_NAME].split('-')[0] || 'delete';
		var sha1 = req.cookies[COOKIE_NAME].split('-')[1];
		models.users.find({email:email}, function(err, user){
			if(err){
				logger.error(err.toString());
			}
			if(user[0]){
				if(getHash(user[0].email+user[0].passwd+salt) === sha1 && user[0].admin === true){
					req.__user__ = user[0];
				}else{
					res.writeHead(403, {"Content-Type" : "text/html; charset=utf8"});
					res.end("<h1>403 Forbidden, you are not admin.</h1>");
				}
			}
			else{
				res.writeHead(403, {"Content-Type" : "text/html; charset=utf8"});
				res.end("<h1>403 Forbidden, you are not admin.</h1>");
			}
			next();				
		});
	}
	else{
		res.writeHead(403, {"Content-Type" : "text/html; charset=utf8"});
		res.end("<h1>403 Forbidden, you are not admin.</h1>");
		next();
	}
};

var sessions = {};
var session_key = 'freemind_session';
var EXPIRES = 20 * 60 * 1000;

//生成session的代码
var generate = function(){
	var session = {};
	session.id = (new Date()).getTime() + Math.random();
	session.cookie = {
		expires: (new Date()).getTime() + EXPIRES
	};
	sessions[session.id] = session;
	return session;
};

//请求到来时检查cookie的口令和服务端数据，如果过期，就重新生成，这部分只管服务端
exports.session =  function(req, res, next){
	var id = req.cookies[session_key];
	if(!id){
		req.session = generate();
	}
	else{
		var session = sessions[id];
		if(session){
			if(session.cookie.expires > (new Date()).getTime()){
				//更新超时时间
				session.cookie.expires = (new Date()).getTime() + EXPIRES;
				req.session = session;
			}
			else{
				//超时了，删除旧的数据，并重新生成
				delete sessions[id];
				req.session = generate();
			}
		}
		else{
			//如果session过期或者口令不对，重新生成session
			req.session = generate();
		}
	}
	var session = serialize(session_key, req.session.id, {path : '/'});
	res.setHeader('Set-Cookie', session);
	
	next();
};

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
