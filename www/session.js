var sessions = {};
var key = 'session_id';
var EXPIRES = 20 * 60 * 1000;

//生成session的代码
var generate = function(){
	var session = {};
	session.id = (new Date()).getTime() + Math.random();
	session.cookie = {
		expires: (new Date()).getTime + EXPIRES
	};
	sessions[session.id] = session;
	return session;
};

//请求到来时检查cookie的口令和服务端数据，如果过期，就重新生成，这部分只管服务端
function(req, res){
	var id = req.cookies[key];
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
	handle(req, res); //最后转给业务逻辑
}

//服务端修改完了还需要设置客户端内容，这里采用注入writeHead方法
var writeHead = res.writeHead;
res.writeHead = function(){
	var cookies = res.getHeader('Set-Cookie');
	var session = serialize(key, req.session.id);
	cookies = Array.isArray(cookies) ? cookies.concat(session) : [cookies, session];
	res.setHeader('Set-Cookie', cookies);
	return writeHead.apply(this, arguments);
};
//业务逻辑设置和判断session
var handle = function(req, res){
	if(!req.session.isVisit){
		req.session.isVisit = true;
		res.writeHead(200);
		res.end("欢迎首次访问本网站");
	}
	else{
		res.writeHead(200);
		res.end("欢迎再次访问本站");
	}
};
//------------------------------------------------------------
//通过查询字符串来实现浏览器端和服务器端数据的对应
var getURL = function(_url, key, value){
	var obj = url.parse(_url, true);
	obj.query[key] = value;
	return url.format(obj);
};

function(req, res){
	var redirect = function(url){
		res.setHeader('Location', url);
		res.writeHead(302);
		res.end();
	};

	var id = req.query[key];
	if(!id){
		var session = generate();
		redirect(getURL(req.url, key, session.id));
	}
	else{
		var session = sessions[id];
		if(session){
			if(session.cookie.expires > (new Date()).getTime()){
				//更新超时时间
				session.cookie.expires = (new Date()).getTime() + EXPIRES;
				req.session = session;
				handle(req, res);
			}
			else{
				//超时了，删除旧的数据，并重新生成
				delete sessions[id];
				var session = generate();
				redirect(getURL(req.url, key, session.id));
			}
		}
		else{
			//如果session过期或口令不对，重新生成session
			var session = generate();
			redirect(getURL(req.url, key, session.id));
		}
	}
}
//为了避免生成session的算法被破解，采用签名的方式保障session的安全
var crypto = require("crypto");
//签名函数
var sign = function(val, secret){
	return val + '.' + crypto
	.createHmac('sha256', secret)
	.update(val)
	.digest('base64')
	.replace(/\=+$/,'');
};
//在响应时，设置session到cookie或者跳转URL
var val = sign(req.sessionID, secret);
res.setHeader('Set-Cookie', cookie.serialize(key, val));

//取出口令部分进行签名，对比用户提交的值
var unsign = function(val, secret){
	var str = val.slice(0, val.lastIndexOf('.'));
	return sign(str, secret) == val ? str : false;
};

