var switchMethod = function(req, res){
	switch(req.method){
		case 'POST':
			update(req, res);
			break;
		case 'DELETE':
			remove(req, res);
		case 'PUT':
			create(req, res);
			break;
		case 'GET':
		default:
			get(req, res);
		}
};