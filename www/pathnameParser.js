//静态文件解析
var staticParser = function(req, res){
	var pathname = url.parse(req.url).pathname;
	fs.readFile(path.join(ROOT, pathname), function(err, file){
		if(err){
			res.writeHead(404);
			res.end('找不到相关文件， = = !');
			return;
		}
		res.writeHead(200);
		res.end(file);
	});
};

//controller对应一个控制器，action对应控制器的行为
var actionParser = function(req, res){
	var pathname = url.parse(req.url).pathname;
	var paths = pathname.split('/');
	var controller = paths[1] || 'index';
	var action = paths[2] || 'index';
	var args = paths.slice(3);
	if (handles[controller] && handles[controller][action]) {
		handles[controller][action].apply(null, [req, res].concat(args));
	}else{
		res.writeHead(500);
		res.end('找不到响应控制器');
	}
};
//业务处理部分
handles.index = {};
handles.index.index = function(req, res, foo, bar){
	res.writeHead(200);
	res.end(foo);
};