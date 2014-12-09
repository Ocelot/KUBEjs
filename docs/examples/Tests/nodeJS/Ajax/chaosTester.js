var http = require('http');
var port = 10999;

if(/^--port=/.test(process.argv[2])){
    var m = /^--port=([^\s]*)/.exec(process.argv[2]);
    port = m[1];
}

var server = http.createServer();
server.on('request',function(request,response){
    var randomFunction;
    var chaosFunctions = [];
    chaosFunctions.push(function(){
        server.close();
        server.listen(port);
    });

    chaosFunctions.push(function(){
        //Yes, I'm intentionally breaking CORS.
        response.setHeader("Access-Control-Allow-Headers", request.headers['access-control-request-headers']);
        response.setHeader('Access-Control-Allow-Origin','*');
        response.setHeader('Access-Control-Allow-Methods','POST,PUT,GET');
        response.statusCode = 500;
        response.write('hi');
        response.end();
    });

    chaosFunctions.push(function(){
        //Yes, I'm intentionally breaking CORS for this specific example.
        response.setHeader("Access-Control-Allow-Headers", request.headers['access-control-request-headers']);
        response.setHeader('Access-Control-Allow-Origin','*');
        response.setHeader('Access-Control-Allow-Methods','POST,PUT,GET');
        response.write('hi');
        response.end();
    });

    randomFunction = Math.floor(Math.random() * 3);

    console.log('EXECUTING: ' + randomFunction)

    setTimeout(chaosFunctions[randomFunction], 200);




});
server.listen(port);