(function(KUBE) {
    "use strict";
    KUBE.LoadFactory('/Library/DOM/WebSocket', WebSocketWrap, ['/Library/Extend/Object']);

    //Right now, this is a pretty direct cover over the native WebSocket object.
    //We could, in the future, apply some other concepts to it. More connection management to allow you to close/reopen
    //a websocket connection.
    function WebSocketWrap(url,protocols){
        validateURL(url);
        var Events = KUBE.Events();
        var WSClient;
        //This is really stupid, but I need to do it. Even passing "undefined" in as 2nd param to WS causes strangeness.
        if(protocols){
            WSClient = new WebSocket(url,protocols);
        }
        else{
            WSClient = new WebSocket(url);
        }

        var ret = {};

        Object.defineProperties(ret,{
            "binaryType": {
                "enumerable": true,
                "configurable": false,
                "get": function(){return WSClient.binaryType},
                "set": function(v){ WSClient.binaryType = v;}
            },
            "bufferedAmount": {
                "enumerable": true,
                "configurable": false,
                "get": function(){return WSClient.bufferedAmount},
                "set": undefined
            },
            "extensions": {
                "enumerable": true,
                "configurable": false,
                "get": function(){return WSClient.extensions},
                "set": undefined
            },
            "protocol": {
                "enumerable": true,
                "configurable": false,
                "get": function(){return WSClient.protocol},
                "set": undefined
            },
            "readyState": {
                "enumerable": true,
                "configurable": false,
                "get": function(){return WSClient.readyState},
                "set": undefined
            },
            "url": {
                "enumerable": true,
                "configurable": false,
                "get": function(){return WSClient.url},
                "set": undefined
            },
            "Close": {
                "enumerable": true,
                "configurable": false,
                "value": Close
            },
            "close": {
                "enumerable": true,
                "configurable": false,
                "value": Close
            },
            "Send": {
                "enumerable": true,
                "configurable": false,
                "value": Send
            },
            "send": {
                "enumerable": true,
                "configurable": false,
                "value": Send
            },
            "On": {
                "enumerable": true,
                "configurable": false,
                "value": Events.On
            },
            "on": {
                "enumerable": true,
                "configurable": false,
                "value": Events.On
            }
        });


        WSClient.onclose = function(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift('close');
            Events.Emit.apply(this,args);
            Events.EmitState('close');
        };

        WSClient.onerror = function(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift('error');
            Events.Emit.apply(this,args);
        };

        WSClient.onmessage = function(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift('message');
            Events.Emit.apply(this,args);
        };

        WSClient.onopen = function(){
            var args = Array.prototype.slice.call(arguments);
            args.unshift('open');
            Events.Emit.apply(this,args);
            Events.EmitState('open');
        };

        return ret;


        function Send(data){
            if(WSClient.readyState === WebSocket.CONNECTING){
                Events.Once('open',function(){
                    Send(data);
                })
            } else{
                WSClient.send(data);
            }

        }

        function Close(shortCode,reason){
            WSClient.close(shortCode,reason);
        }

        function validateURL(url){
            //This is a hilarious hack.
            var parser = document.createElement('a');
            parser.href = url;

            if(parser.protocol != "ws:" && parser.protocol != "wss:"){
                throw new Error("WebSocket URL must be ws: or wss: protocol ")
            }

            if(!parser.hostname){
                throw new Error("WebSocket requires a hostname")
            }


        }

    }

}(KUBE));