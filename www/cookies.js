//HTTP_Parser会把所有的报文字段解析到req.header上，那么cookie就是req.headers.cookie

var parserCookie = function(cookie){
	var cookies = {};
	if(!cookie){
		return cookies;
	}
	var list = cookie.split(';');
	for(var i = 0; i < list.length; i++){
		var pair = list[i].split('=');
		cookies[pair[0].trim()] = pair[1];
	}
	return cookies;
};

//在执行业务逻辑之前，会将cookie挂载在req对象上
function(req, res){
	req.cookies = parserCookie(req.headers.cookie);
	handle(req, res);
}

var serialize = function(name, val, opt){
	var pairs = [name + '=' + encode(val)];
	opt = opt || {};
	if(opt.maxAge) pairs.push('Max-Age=' + opt.maxAge);
	if(opt.domain) pairs.push('Domain=' + opt.domain);
	if(opt.path) pairs.push('Path=' + opt.path);
	if(opt.expires) pairs.push('Expires=' + opt.expires.toUTCString());
	if(opt.httpOnly) pairs.push('HttpOnly');
	if(opt.secure) pairs.push('Secure');

	return pairs.join(';');
};

var handle = function(req, res){
	res.writeHead(200);
	if(!req.cookies.isVisit){
		res.setHeader('Set-Cookie', serialize('isVisit', '1'));
		res.writeHead(200);
		res.end('欢迎首次访问本网站!');
	}else{
		//TODO
		res.writeHead(200);
		res.end('欢迎再次访问本站');
	}
};