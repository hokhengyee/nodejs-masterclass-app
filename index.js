/* Primary file for the API */

// Dependancies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');

// the server should respond to all requests with a string
const server = http.createServer((req, res) => {
        // Get the URL and parse it
        const parsedUrl = url.parse(req.url, true);

        // Get the path from the URL
        const path = parsedUrl.pathname;
        const trimmedPath = path.replace(/^\/+|\/+$/g, '');

        // Get the query string as an object
        const queryStrObj = parsedUrl.query;

        // Get the HTTP method
        const method = req.method.toLowerCase();

        // Get the headers as an object
        const headers = req.headers;

        // Get the payload if any
        const decoder = new StringDecoder('utf-8');
        let buffer = '';
        req.on('data', (data) => {
                buffer += decoder.write(data);
        });
        req.on('end', () => {
                buffer += decoder.end();

                // Choose the handler this request should go to, if one is not found, use the not found handler
                const chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

                // Construct the data object to send to the handler
                const data = {
                        'trimmedPath': trimmedPath,
                        'queryStrObj': queryStrObj,
                        'method': method,
                        'headers': headers,
                        'payload': buffer
                };

                // Route the request to the handler specified in the router
                chosenHandler(data, (statusCode, payload) => {
                        // Use the status code called back by the handler, or default to 200
                        statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

                        // Use the payload called back by the handler, or default to an empty object
                        payload = typeof (payload) == 'object' ? payload : {};

                        // Convert the payload to a string
                        const payloadStr = JSON.stringify(payload);

                        // Return the response
                        res.setHeader('Content-Type', 'application/json');
                        res.writeHead(statusCode);
                        res.end(payloadStr);

                        // Log the request
                        console.log('Returning this response: ', statusCode, payloadStr);
                });
        });
});

// Start the server, and have it listen to port 8080
server.listen(config.port, () => {
        console.log('The server is listening on port ' + config.port + ' in ' + config.envName);
});

// Define the handlers
const handlers = {};

// Sample handler
handlers.hello = (data, callback) => {
        // Callback a http status code, and a payload object
        callback(200, { 'message': 'Hello Pirple!' });
};

// Ping handler
handlers.ping = (data, callback) => {
        // Callback a http status code, and a payload object
        callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
        callback(404);
}

// Define a request router
const router = {
        'hello': handlers.hello,
        'ping': handlers.ping
};
