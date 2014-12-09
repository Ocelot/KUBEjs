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
        response.setHeader('Access-Control-Allow-Methods',request.method);
        response.statusCode = 500;
        response.write(createOutput());
        response.end();
    });

    chaosFunctions.push(function(){
        var d = "";
        //Yes, I'm intentionally breaking CORS for this specific example.
        response.setHeader("Access-Control-Allow-Headers", request.headers['access-control-request-headers']);
        response.setHeader('Access-Control-Allow-Origin','*');
        response.setHeader('Access-Control-Allow-Methods',request.method);

        request.on('data',function(chunk){
            d += chunk.toString();
        });

        request.on('end',function(){
            response.write(createOutput(d));
            response.end();
        })


    });

    randomFunction = Math.floor(Math.random() * 3);

    console.log('EXECUTING: ' + randomFunction)

    setTimeout(chaosFunctions[randomFunction], 200);

    function createOutput(data){
        var out = {};
        out['headers'] = request.headers;
        out['requestMethod'] = request.method;
        if(data){
            out['receivedData'] = data;
        }
        return JSON.stringify(out);
    }
});
server.listen(port);