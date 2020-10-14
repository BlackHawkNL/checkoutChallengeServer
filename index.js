'use strict';
require = require('esm')(module)
const Glue = require('@hapi/glue');
const Manifest = require('./manifest');
const Dotenv = require('dotenv');


Dotenv.config({
    silent: true
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
    console.error(promise)
});


const main = async function () {
    const options = { relativeTo: __dirname };
    const server = await Glue.compose(Manifest.get('/'), options);

    await server.start();

    console.log(`Server started on port ${Manifest.get('/server/port')}`);
};


main();