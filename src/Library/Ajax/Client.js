/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

(function(KUBE){
    KUBE.LoadFactory('/Library/Ajax/Client', Client,['/Library/Ajax/Request','/Library/Ajax/Response','/Library/Extend/Object','/Library/Extend/RegExp','/Library/Extend/Array']);

    Client.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
    function Client(_target,_timeout,_freezeDelay) {
        var $API,target,timeoutDelay,freezeDelay,auth;


        auth = {'username':'','password':''};
        timeoutDelay = (KUBE.Is(_timeout) === 'number' ? _timeout : 10000);
        freezeDelay = (KUBE.Is(_freezeDelay) === 'number' ? _freezeDelay : 2500);
        target = (KUBE.Is(_target) === 'function' || KUBE.Is(_target) === 'string' ? _target : undefined);

        $API = {
            "SetTarget":SetTarget,
            "SetTimeout":SetTimeout,
            "SetFreezeDelay":SetFreezeDelay,
            "SetAuth":SetAuth,
            "SendRequest":SendRequest,
            "CreateRequest":CreateRequest
        }.KUBE().create(Client.prototype);
        return $API;

        //Get

        //Set
        function SetTarget(_target){
            if(KUBE.Is(_target) === 'function' || KUBE.Is(_target) === 'string'){
                target = _target;
            }
        }

        function SetTimeout(_ms){
            if(KUBE.Is(_ms) === 'number'){
                timeoutDelay = _ms;
            }
        }

        function SetFreezeDelay(_ms){
            if(KUBE.Is(_ms) === 'number'){
                freezeDelay = _ms;
            }
        }

        //Should this be part of Request? Seems like it
        function SetAuth(_username,_password){
            if(KUBE.Is(_username) === 'string' && KUBE.Is(_password) === 'string'){
                auth.username = _username;
                auth.password = _password;
            }
        }

        //Utilities
        function SendRequest(_Request){
            if(!target){
                throw Error('Client cannot send AjaxRequest. Target not set in Client.');
            }
            if(KUBE.Is(_Request,true) === 'Request'){
                //Every Request is a new chain, if you want to send another request...
                return KUBE.Promise(function(_resolve,_reject){
                    switch(KUBE.Is(target)){
                        case 'function':
                            sendToFunction(_resolve,_reject,_Request);
                            break;

                        case 'string':
                            sendRemote(_resolve,_reject,_Request);
                            break;
                    }
                });
            }
        }

        function CreateRequest(){
            return KUBE.Class('/Library/Ajax/Request')();
        }

        //Send Remotely (XHR)
        function sendRemote(_resolve,_reject,_Request){
            var remotePkg;
            remotePkg = initXHR(new XMLHttpRequest(),_Request);
            XHRListen(remotePkg.XHR,_resolve,_reject,_Request);
            remotePkg.XHR.send(remotePkg.sendData);
        }

        function XHRListen(_XHR,_resolve,_reject,_Request){
            var timedOut,timeoutId;
            timedOut = false;

            timeoutId = setTimeout(function(){
                timedOut = true;
                _reject({
                    'message':'Timeout limit reached. Rejecting Request. Cancelling Promise',
                    'data':_Request
                });
            },timeoutDelay);

            _XHR.onreadystatechange = function(){
                if(!timedOut && _XHR !== undefined && _XHR.readyState == 4){
                    //In theory our request has responded, but as we've found this doesn't work entirely how expected
                    clearTimeout(timeoutId);

                    //Parse it into a proper Response Object here...
                    var Response = KUBE.Class('/Library/Ajax/Response')(_Request);
                    Response.SetStatusCode(_XHR.status);
                    Response.SetStatusText(_XHR.statusText);
                    Response.SetResponseType(_XHR.responseType);
                    Response.SetHeaders(parseRequestHeaders(_XHR.getAllResponseHeaders()));
                    Response.SetData(_XHR.response);

                    if(Response.GetStatusCode()){
                        _resolve(Response);
                    }
                    else{
                        //CORS. Fail as if network error
                        _reject({
                            'message':'Timeout limit reached. Rejecting Request. Cancelling Promise',
                            'data': _Request
                        });
                    }
                }
            }
        }

        function initXHR(_XHR,_Request){
            var sendData;

            //Set up our RequestType
            if(_Request.GetResponseType()){
                _XHR.responseType = _Request.GetResponseType();
            }

            switch(_Request.GetMethod().toLowerCase()){
                case 'post':
                    _XHR.open('post', target, true);
                    sendData = prepXHRForData(_XHR,_Request.GetData(),_Request.GetMethod());
                    break;

                case 'put':
                    _XHR.open('put', target, true);
                    sendData = prepXHRForData(_XHR,_Request.GetData(),_Request.GetMethod());
                    break;

                case 'get':
                    sendData = prepXHRForData(_XHR,_Request.GetData(),_Request.GetMethod());
                    _XHR.open('get', target+"?"+sendData, true);
                    break;
            }

            //Now add custom headers
            addCustomHeadersToXHR(_XHR,_Request.GetHeaders());
            return {'XHR':_XHR,'sendData':sendData};
        }

        function prepXHRForData(_XHR,_data,_method){
            var check,$returnData;
            check = _method+":"+KUBE.Is(_data,true);
            switch(check.toLowerCase()){
                case 'post:object':
                    _XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    $returnData = prepObjectData(_data);
                    break;

                case 'get:object':
                    $returnData = prepObjectData(_data);
                    break;

                case 'put:string':
                    _XHR.setRequestHeader("Content-type", "text/plain")
                    $returnData = encodeURIComponent(_data);
                    break;

                case 'put:object':
                    _XHR.setRequestHeader("Content-type", "application/json")
                    $returnData = encodeURIComponent(_data.KUBE().toJSON());
                    break;

                case 'post:formdata':
                case 'put:formdata':
                    $returnData = _data;
                    break;

                default:
                    //The data in our RequestData hit a combination of fail
                    break;
            }
            return $returnData;
        }

        function prepObjectData(_data){
            var count,$return;
            count = 0;
            $return = '';
            _data.KUBE().each(function(_key,_val){
                _key = encodeURIComponent(_key);
                _val = (KUBE.Is(_val) === 'object' ? _val.KUBE().toJSON() : _val);
                _val = encodeURIComponent(_val);
                $return = $return+(!count ? _key+'='+_val : '&'+_key+'='+_val);
                count++;
            });
            return $return;
        }

        function addCustomHeadersToXHR(_XHR,_headers){
            if(KUBE.Is(_headers) === 'object' && !_headers.KUBE().isEmpty()){
                _headers.KUBE().each(function(_headerName,_headerData){
                    _XHR.setRequestHeader(_headerName,_headerData);
                });
            }
        }

        function parseRequestHeaders(_responseHeaderString){
            var headers = {};
            var matchArray = /\r\n{0,1}([^:]*): (.*)/m.KUBE().matchAll(_responseHeaderString);
            matchArray.KUBE().each(function(_matchArray){
                headers[_matchArray[1]] = _matchArray[2];
            });
            return headers;
        }

        //Send to a Function Server
        function sendToFunction(_resolve,_reject,_Request){
            var timedOut,timeoutId,ResponsePromise = target(_Request);
            timedOut = false;
            if(KUBE.Is(ResponsePromise,true) !== 'Promise'){
                _reject({
                    'message':'Client target function did not return promise object. Could not resolve Request',
                    'data':''
                });
            }
            else{
                //Handle our timeout
                var timeoutId = setTimeout(function(){
                    timedOut = true;
                    _reject({
                        'message':'Timeout limit reached. Rejecting Request. Cancelling Promise',
                        'data':''
                    });
                },timeoutDelay);


                ResponsePromise.Then(function(_targetResolve,_targetReject,_Response){
                debugger;
                    if(!timedOut){
                        if(KUBE.Is(_Response,true) === 'Response'){
                            clearTimeout(timeoutId);
                            _resolve(_Response);
                            _targetResolve();
                        }
                        else{
                            clearTimeout(timeoutId);
                            _reject({
                                'message':'Client target function did not return Response object. Could not resolve Request',
                                'data':''
                            });
                            _targetResolve();
                        }
                    }
                    else{
                        _targetReject();
                    }
                });

                ResponsePromise.Catch(function(_targetResolve,_targetReject,_err){
                    if(!timedOut){
                        _reject({
                            'message':_err.message+' (Client target rejected request)',
                            'data':_err
                        });
                        _targetResolve();
                    }
                    else{
                        _targetReject();
                    }
                });
            }
        }

    }
}(KUBE));
