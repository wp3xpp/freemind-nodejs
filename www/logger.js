/*!
 * freemind
 * Copyright(c) 2015-2016 胡时玮 mailto:wp3xpp@163.com
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
//自定义logger 使用log4js模块
var log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'log/SERVER.log' }
  ]
});
var logger = log4js.getLogger('SERVER');
logger.setLevel('TRACE');
 
//logger.trace('Entering SERVER testing');
//logger.debug('Got SERVER.');
//logger.info('Cheese is Gouda.');
//logger.warn('Cheese is quite smelly.');
//logger.error('Cheese is too ripe!');
//logger.fatal('Cheese was breeding ground for listeria.');

module.exports = logger;
