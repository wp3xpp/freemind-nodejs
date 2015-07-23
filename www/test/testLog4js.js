var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'log/SERVER.log' }
  ]
});
//var logger = log4js.getLogger();
//logger.debug("Some debug messages");
var logger = log4js.getLogger('SERVER');
logger.setLevel('TRACE');
 
logger.trace('Entering runtime testing');
logger.debug('Got SERVER.');
logger.info('Cheese is Gouda.');
logger.warn('Cheese is quite smelly.');
logger.error('Cheese is too ripe!');
logger.fatal('Cheese was breeding ground for listeria.');