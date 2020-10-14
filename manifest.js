'use strict';
const Confidence = require('confidence');
const Package = require('./package.json');
//tewst

const criteria = {
  env: process.env.NODE_ENV
};


const manifest = {
  $meta: 'This file defines the plot device.',
  server: {
    debug: {
      request: ['*']
    },
    routes: {
      security: false,
      cors: true,
    },
    port: 3000
  },
  register: {
    plugins: [{
        plugin: './server/api/index'
      },
      {
        plugin: './server/api/payment'
      },
      {
        plugin: './server/api/cart'
      }

    ]
  }
};


const store = new Confidence.Store(manifest);


exports.get = function(key) {

  return store.get(key, criteria);
};


exports.meta = function(key) {

  return store.meta(key, criteria);
};
