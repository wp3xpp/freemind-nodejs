//RESTful
//RESTful主要思想是对一个资源的操作主要体现在HTTP请求方法上，而不是体现在URL上
var routes = {'all': []};
var app = {};
app.use = function(path, action){
	routes.all.push([pathRegexp(path), action]);
};

['get', 'put', 'delete', 'post'].forEach(function(method){
	routes[method] = [];
	app[method] = function(path, action){
		routes[method].push([pathRegexp(path), action]);
	};
});
//目的是由以下方式完成路由映射
//增加用户
app.post('/user/:username', aadUser);
//删除用户
app.delete('/user/:username', removeUser);
//修改用户
app.put('/user/:username', updateUser);
//查询用户
app.get('/user/:username', getUser);

//匹配部分由下面的match方法完成
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

			var action = route[1];
			action(req, res);
			return true;
		}
	}
	return false;
};
//以下为分发部分
function(req, res){
	var pathname = url.parse(req.url).pathname;
	//将请求方法变为小写
	var method = req.method.toLowerCase();
	if(routes.hasOwnPerperty(method)){
		//根据请求方法分发
		if(match(pathname, routes[method])){
			return;
		}
		else{
			//如果路径没有匹配成功,尝试让all()来处理
			if(match(pathname, routes.all)){
				return;
			}
		}
	}
	else{
		//直接让all处理
		if(match(pathname, routes.all)){
			return;
		}
	}
	//处理404请求
	handle404(req, res);
}
