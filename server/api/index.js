'use strict';


const register = function (server, serverOptions) {

    server.route({
        method: 'GET',
        path: '/api',
        handler: function (request, h) {
            return {
                message: 'Welcome to the API.'
            };
        }
    });
};


module.exports = {
    name: 'api-main',
    dependencies: [],
    register
};
