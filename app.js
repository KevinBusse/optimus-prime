var http = require("http"),
    fs = require('fs'),
    util = require('util'),
    xmlBuilder = require('xmlbuilder'),
    doT = require('dot'),
    generateError;

function convertRequestToXml(request) {
    var requestXml = xmlBuilder.create(
        'h:request',
        {encoding: 'UTF-8'},
        {headless: false}
    );

    requestXml.att('protocolVersion', request.httpVersion);
    requestXml.att('method', request.method);
    requestXml.att('encoding', 'utf-8');
    requestXml.att('xmlns:h', 'http://example.com/http');

    // TODO: apply urlmap before putting in url
    requestXml.ele('h:url', null, request.url);

    var headersXml = requestXml.ele('h:headers');
    for (var header in request.headers) {
        headersXml.ele('h:param', {'name': header}, request.headers[header]);
    }

    requestXml.ele('h:remoteIP', null, request.connection.remoteAddress);
    return requestXml;
}

util.log("Initializing, started in " + __dirname);

generateError = doT.template(fs.readFileSync(__dirname + "/templates/errors.html").toString());

http.createServer(function(request, response){
    // TODO: create & apply project / site mapper

    var requestXml = convertRequestToXml(request);
    console.log(requestXml.end({pretty: true}));

/*
    // reply with xml
    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write(requestXml.end({pretty: true}));
    response.end();
*/
/*
    fs.readFile('errorpages/project-not-found.html', function(err, data) {
        response.writeHead(200, {"Content-Type": "text/html", "Content-Length": data.length});
        response.write(data);
        response.end();
    });
*/
    var data = generateError({error: 'Project not found.'});
    response.writeHead(200, {"Content-Type": "text/html", "Content-Length": data.length});
    response.write(data);
    response.end();
}).listen(80);

util.log("Server Running on 80");