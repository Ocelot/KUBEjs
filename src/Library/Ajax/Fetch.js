(function(KUBE){

    KUBE.LoadFunction('/Library/Ajax/Fetch',Fetch,['/Library/Ajax/Request','/Library/Ajax/Client','/Library/Extend/Object']);

    function Fetch(url, opts){
        var Client, Request;
        opts = opts || {};
        if(KUBE.Is(url) !== "string"){ throw new Error('URL must be a string.'); }
        if(KUBE.Is(opts) !== "object"){throw new Error("Options must be an object")};
        Request = KUBE.Class('/Library/Ajax/Request')();
        Client = KUBE.Class('/Library/Ajax/Client')();

        initOptions();
        return Client.SendRequest(Request);


        function initOptions(){
            Client.SetTarget(url);
            if(KUBE.Is(opts.headers) === "object"){
                opts.headers.KUBE().each(function(k,v){
                    Request.AddHeader(k,v);
                });
            }

            if(opts.body){
                //This seems silly that SetData accepts an object. It shouldn't care.
                Request.SetData(opts.body);
            }

            if(KUBE.Is(opts.method) && KUBE.Is(opts.method) === "string"){
                var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
                (methods.indexOf(opts.method.toUpperCase()) > -1)
                    ? Request.SetMethod(opts.method.toUpperCase())
                    : Request.SetMethod(opts.method);
            }

        }

    }

}(KUBE));