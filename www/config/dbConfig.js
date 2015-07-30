//database connect option
var opts = module.exports = {
  database : "freemind",
  protocol : "mysql",
  host     : "127.0.0.1",
  port     : 3306,         // optional, defaults to database default
  user     : "root",
  password : "612526",
  query    : {
    pool     : true,   // optional, false by default
    debug    : true,   // optional, false by default
    strdates : true    // optional, false by default
  }
};

/*{
  database : "dbname",
  protocol : "[mysql|postgres|redshift|sqlite]",
  host     : "127.0.0.1",
  port     : 3306,         // optional, defaults to database default
  user     : "..",
  password : "..",
  query    : {
    pool     : true|false,   // optional, false by default
    debug    : true|false,   // optional, false by default
    strdates : true|false    // optional, false by default
  }
};*/