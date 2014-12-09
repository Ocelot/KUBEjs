var http = require('http');

var port = 10999;

if(/^--port=/.test(process.argv[2])){
    var m = /^--port=([^\s]*)/.exec(process.argv[2]);
    port = m[1];
}

var server = http.createServer();

server.on('request',function(request,response){
    response.setHeader('Access-Control-Allow-Origin','*');
    response.write('hi');
    setTimeout(function(){
        response.end();
    },500);


});
server.listen(port);