//按照预期，按照如下格式添加中间件
app.use('/user/:username', querystring, cookie, session, function(req, res){
	//TODO
});

//querystring中间件
var querystring = function(req, res, next){
	req.query = url.parse(req.url, true).query;
	next();
};



//将路由分离开来，将中间件和具体业务逻辑都看成业务处理单元，改进use()方法如下
//将use()方法存进stack数组中保存，等待匹配后触发执行
var routes = {'all': []};
var app = {};
app.use = function(path){
	var handle = {
		//第一个参数座位路径
		path : pathRegexp(path),
		//其他都是处理单元
		stack: Array.prototype.slice.call(arguments, 1)
	};
	routes.all.push(handle);
};

//匹配部分也需要进行部分修改
var match = function(pathname, routes){
	for(var i=0;i < routes.length; i++){
		var route = routes[i];
		//正则匹配
		var reg = route[0].regexp;
		var keys = route[0].keys;
		var matched = reg.exec(pathname);
		if(matched){
			//抽取具体值
			var params = {};
			for(var i=0, l=keys.length; i < l; i++){
				var value = matched[i+1];
				if (value) {
					params[keys[i]] = value;
				}
			}
			req.params = params;

			//将中间件数组交给handle()方法处理
			handle(req, res, route.stack);
			return true;
		}
	}
	return false;
};

//中间件具体如何调用交给handle,递归性的执行数组中的中间件
var handle = function(req, res, stack){
	var next = function(){
		//从stack数组中取出中间件并执行
		var middleware = stack.shift();
		if(middleware){
			//传入next()函数自身，使中间件能够执行结束后递归
			middleware(req, res, next);
		}
	};

	//启动执行
	next();
};

//由于中间件和业务逻辑是等价的，应该将路由和中间件结合
//需要满足以下类似调用
//app.use(querystring)
//app.use(cookie)
//app.use(session)
//app.get('/user/:username', getUser)
//app.put('/user/:username', authorize, updateUser)

app.use = function(path){
	var handle;
	if(typeof path === 'string'){
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
			path : pathRegexp('/'),
			//其他是处理单元
			stack : Array.prototype.slice.call(arguments, 0)
		};
	}

	routes.all.push(handle);
};

//改进匹配过程，与前面一旦一次匹配后就不再执行后续匹配不同，还会继续后续逻辑
//这里将所有匹配到中间件的都暂时保存起来

var match = function(pathname, routes){
	var stacks = [];
	for(var i=0;i < routes.length; i++){
		var route = routes[i];
		//正则匹配
		var reg = route[0].regexp;
		var keys = route[0].keys;
		var matched = reg.exec(pathname);
		if(matched){
			//抽取具体值
			var params = {};
			for(var i=0, l=keys.length; i < l; i++){
				var value = matched[i+1];
				if (value) {
					params[keys[i]] = value;
				}
			}
			req.params = params;

			//将中间件都保存起来
			stacks = stacks.concat(route.stack);
		}
	}
	return stacks;
};

//改进分发过程

function(req, res){
	var pathname = url.parse(req.url).pathname;
	//将请求方法变为小写
	var method = req.method.toLowerCase();
	//获取all()方法里的中间件
	var stacks = match(pathname, routes.all);
	if(routes.hasOwnPerperty(method)){
		//根据请求方法分发,获取相关中间件
		stacks.concat(match(pathname, routes[method]));
	}
	
	if(stacks.length){
		handle(req, res, stacks);
	}
	//处理404请求
	handle404(req, res);
}

//为next方法添加err参数,捕获中间件直接抛出的同步异常

var handle = function(req, res, stack){
	var next = function(err){
		if (err) {
			return handle500(err, req, res, stack);
		}
		//从stack数组中取出中间件并执行
		var middleware = stack.shift();
		if(middleware){
			//传入next()函数自身，使中间件能够执行结束后递归
			try{
				middleware(req, res, next);
			}		
			catch(ex){
				next(err);
			}	
		}
	};

	//启动执行
	next();
};



//可以通过use()将左右异常处理的中间件注册起来
app.use(function(err, req, res, next){
	//TPDO
	next();
});

//为了区分普通中间件和异常处理中间件,handle500()方法会按照参数个数进行选取

var handle500 = function(err, req, res, stack){
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

var staticFile = function(req, res, next){
	var pathname = url.parse(req.url).pathname;

	fs.readFile(path.join(ROOT, pathname), function(err, file){
		if(err){
			return next();
		}
		res.writeHead(200);
		res.end(file);
	});
};
//如果app.use(staticFile);这样注册误伤率会太高
//应该使用app.use('/static', staticFile)类似方式注册提高效率