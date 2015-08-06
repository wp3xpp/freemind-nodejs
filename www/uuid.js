/*!
 * freemind
 * Copyright(c) 2015-2016 胡时玮 mailto:wp3xpp@163.com
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */
module.exports =  function genuuid() {
      return 'xxxxxxxxxxxx4xxxyxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0,
              v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      }).toLowerCase();
 };
