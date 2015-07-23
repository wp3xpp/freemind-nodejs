//假设这是一个处理用户设置信息的控制器
export.setting = function(req, res) {
	//TODO
};

//映射方法
var routes = [];
var use = function(path, action) {
	routes.push([path, action]);
}
//程序入口判断URL，然后执行对应逻辑
function(req, res) {
	var pathname = url.parse(req.url).pathname;
	for(var i = 0; i < routes.length; i++){
		var route = routes[i];
		if(pathname === route[0]){
			var action = route[1];
			action(req, res);
			return;
		}
	}
	//处理404请求
	handle404(req, res);
}
//这种手工映射方式可以将两个路径映射到相同业务
//use('/user/setting', export.setting);
//use('/user/setting', export.setting);
//use('/user/setting/hushiwei', export.setting);
//
//
//以下为改进路由匹配方式,将路径转换为正则表达式
var pathRegexp = function(path){
	var keys = [];

	path = path
		   .concat(strict ? '' : '/?')
		   .replace(/\/\(/g, '(?:/')
		   .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, 
		   	optional, start){
		   	//将匹配到的键值保存起来
		   	keys.push(key);

		   	slash = slash || '';
		   	return ''
		   		   + (optional ? '' : slash)
		   		   + '(?:'
		   		   + (optional ? slash : '')
		   		   + (format || '') + (capture || (format &&  '([^/.]+?' || '(^/]+?)')) + ')' 
		   		   + (optional || '')
		   		   + (start ? '(/)');
		   })
		   .replace(/([\/.])/g, '\\$1')
		   .replace(/\*/g, '(.*)');
	return {
		keys : keys,
		regexp : new RegExp('^' + path + '$');}
}

//上述正则表达式可以实现如下匹配:
// /profile/:username => /profile/jacksontian, /profile/hushiwei
// /user.:ext => /user.xml, /user.json

//改进后的use函数如下
var use = function(path, action){
	routes.push([pathRegexp(path), acton]);
}
//改进后的匹配部分,根据抽取的键值和实际URL得到键值匹配到的实际值，并设置到req.params处
function(req, res){
	var pathname = url.parse(rea.url).pathname;
	for(var i = 0; i < routes.length; i++){
		var route = routes[i];
		//正则匹配
		var reg = route[0].regexp;
		var keys = route[0].keys;
		var matched = reg.exec(pathname);
		if(matched){
			//抽取具体值
			var params = {};
			for(var i = 0, l = keys.length; i < l; i++){
				var value = matched[i+1];
				if (value) {
					params[keys[i]] = value;
				}
			}

			req.params = params;

			var action = route[1];
			action(req, res);
			return;
		} 
	}
	//处理404请求
	handle404(req, res);
}
//自然映射
//自然映射的方式可以处理一下类似路径
// /controller/action/param1/param2/param3
//自然映射的缺点是如果url发生变化，对应的文件也需要改动，而手工映射只需要改动路由映射
function(req, res){
	var pathname = url.parse(req.url).pathname;
	var paths = pathname.split('/');
	var controller = paths[1] || 'index';
	var action = paths[2] || 'index';
	var args = paths.slice(3);
	var module;
	try{
		//require的缓存机制使得只有第一次是阻塞的
		module = require('./controller/' + controller);
	}
	catch(ex){
		handle500(req, res);
		return;
	}
	var method = module[action];
	if(method){
		method.apply(null, [req, res].concat(args));
	}
	else{
		handle500(req, res);
	}
}