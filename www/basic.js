//Basic 认证
var encode  = function(username, password) {
	return new Buffer(username + ':' + password).toString('base64');
};

function(req, res){
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
	else{
		handle(req, res);
	}
}