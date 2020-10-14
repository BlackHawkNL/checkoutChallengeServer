'use strict';


const register = function (server, serverOptions) {

    server.route({
        method: 'GET',
        path: '/api/cart/new',
        handler: function (request, h) {
          const obj = { my: "Special", variable: 42 };
          const success = myCache.set( "myKey", obj, 10000 )

            return success
        }
    });

    server.route({
        method: 'GET',
        path: '/api/cart/get',
        handler: function (request, h) {
            return  
        }
    });
};


module.exports = {
    name: 'api-cart',
    dependencies: [],
    register
};
