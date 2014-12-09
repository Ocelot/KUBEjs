var http = require('http');
var port = 10999;

if(/^--port=/.test(process.argv[2])){
    var m = /^--port=([^\s]*)/.exec(process.argv[2]);
    port = m[1];
}

var server = http.createServer();
server.on('request',function(request,response){
    //Yes, I'm intentionally breaking CORS for this specific example.
    response.setHeader("Access-Control-Allow-Headers", request.headers['access-control-request-headers']);
    response.setHeader('Access-Control-Allow-Origin','*');
    response.setHeader('Access-Control-Allow-Methods','POST,PUT,GET');
    response.write('hi');
    setTimeout(function(){
        response.end();
    },500);


});
server.listen(port);