const http = require('http');
const config = require('./config');
const { StringDecoder } = require('string_decoder');
const url = require('url');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, ''); //remove trial slash
    const queryStringObject = parsedUrl.query;
    const method = req.method.toLowerCase();
    const headers = req.headers;
    const decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', chunk => {
        buffer += decoder.write(chunk);
    });
    req.on('end', () => {
        const _handler = handlers[trimmedPath] ? handlers[trimmedPath] : handlers.notFound;
        const data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            payload: buffer
        }
        _handler(data, (statusCode, payload) => {
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;
            payload = typeof (payload) === 'object' ? payload : {};
            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log('Response is:', statusCode, payloadString)
        });
    })

})

server.listen(config.port, () => {
    console.log('The app is running on port', config.port);
})

var handlers = {};
handlers.notFound = (data, callback) => {
    callback(404);
}