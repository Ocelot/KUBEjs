/* 
 * Name: Ajax
 * Type: KUBESingletonFactoryClass
 */
//TODO: THIS HAS SOME CONCEPTUAL FLAWS! REWRITE!!!!!!!!!!!!!
//TODO: CHANGE THIS TO A FACTORY. SINGLETONS CAUSE PROBLEMS. REMEMBER UPLOAD EVENTS
(function(KUBE){
	KUBE.LoadSingletonFactory('/Library/DOM/Ajax', Ajax,['/Library/Extend/Object']);
	
	/* Currently this is an ugly piece of code and required refactoring and cleanup */
	Ajax.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function Ajax(){
		var interrupt = false;
		var processing = false;
		var currentRequest;
		var ajaxQ = [];
		var settings = {
			'requestHandler':'',
            'parseFailHandler': '',
			'freezeDelay':2500,
			'timeout':10000,
			'method':'post',
			'flatten':false,
            'customHeaders':{}
		};
		
		var $return = {
			'Settings':SettingsAPI,
			'Send':Send
		}.KUBE().create(Ajax.prototype);
		
		return $return;
		
		/* Public Methods */
		function SettingsAPI(){
			var $return = {
				'RequestHandler':RequestHandler,
                'ParseFailHandler': ParseFailHandler,
				'FreezeDelay':FreezeDelay,
				'Method':Method,
				'Timeout':Timeout,
                'AddCustomHeader':AddCustomHeader
			};
			return $return;
			
			function RequestHandler(_urlOrFunction){
				if(_urlOrFunction){
					settings.requestHandler = _urlOrFunction;
				}
				return settings.requestHandler;
			}

            function ParseFailHandler(_function){
                if(KUBE.Is(_function) === "function"){
                    settings.parseFailHandler = _function;
                }
                return settings.parseFailHandler;
            }
			
			function Timeout(_ms){
				if(KUBE.Is(_ms) == 'number'){
					settings.timeout = _ms;
				}
				return settings.timeout;
			}
			
			function FreezeDelay(_ms){
				if(KUBE.Is(_ms) == 'number'){
					settings.freezeDelay = _ms;
				}
				return settings.freezeDelay;
			}
			
			function Method(_method){
				if(KUBE.Is(_method) == 'string'){
					switch(_method.toLowerCase()){
						case 'get': case 'post': case 'put':
							settings.method = _method.toLowerCase();
							break;
					}
				}
				return settings.method;
			}
			
			function Flatten(_bool){
				if(_bool === true || _bool === false){
					settings.flatten = _bool;
				}
				return settings.flatten;
			}
			
			function Format(_json){
				
			}

            function AddCustomHeader(_headerName,_headerData){
                settings.customHeaders[_headerName] = _headerData;
            }
		};
		
		function Send(_json, _interrupt, _responseEvent){
			_responseEvent = _responseEvent || 'response';
			if(_interrupt === true){
				interrupt = true;
				if(currentRequest){
					currentRequest.cancel();
				}
				$return.Once('clearedQ', function(){
					Send(_json, false, _responseEvent);
					return false;
				});
				startQ();
			}
			else{
				addRequestToQ(_json, _responseEvent, copySettings(settings));
				if(!processing && ajaxQ.length){
					KUBE.console.log('trigger start from send method...');
					startQ();
				}
			}
		};
		
		function Cancel(){
			if(processing && currentRequest){
				KUBE.console.log('cancel has been requested...');
				currentRequest.cancel();
				ajaxQ = [];
				processing = false;
			}
		};
		
		/* Private Methods */
		function addRequestToQ(_json, _responseEvent, _settings){
			var add = true;
			KUBE.console.log('addRequest called: adding...');
			for(var i=0,length=ajaxQ.length;i<length;i++){
				if(ajaxQ.json == _json && ajaxQ.settings == _settings && ajaxQ.responseEvent === _responseEvent){
					add = false;
					break;
				}
			}
			if(add){
				KUBE.console.log(_json);
				ajaxQ[ajaxQ.length] = {'json':_json, 'responseEvent':_responseEvent, 'settings':_settings};
			}
		};
		
		function startQ(_fireQEvent){
			if(ajaxQ.shift && ajaxQ.length > 0 && !processing){
				var obj = ajaxQ.shift();
				if(interrupt){
					startQ();
				}
				else{
					currentRequest = startRequest(obj.json, obj.responseEvent, obj.settings);
				}
			}
			else{
				interrupt = false;
				if(_fireQEvent !== false){
					$return.Emit('clearedQ');
				}
			}
		};
		
		function startRequest(_data, _responseEvent, _settings){
			var requestData,response,XHR, status;
			var timer = {};
			var $api = {
				'cancel':cancel,
                'data':_data,
                'responseEvent':_responseEvent,
                'settings':_settings
			};
			
			processing = true;
			if(KUBE.Is(_settings.requestHandler) == 'string'){
				//XHR Request
				var XHR = initXHR();
                var retry = false;
				
				if(XHR){
					requestData = setupMethod(XHR,_settings.method,_settings.requestHandler,_data,_settings.flatten);
					if(!requestData){
						requestData = '';
					}
					XHR.onreadystatechange = function(){
						if(KUBE.Is(XHR) != 'undefined' && XHR.readyState == 4){
							//In theory our request has responded, but as we've found this doesn't work entirely how expected
							try{
								response = XHR.responseText;
                                if(XHR.getResponseHeader('X-CSRF')){
                                    settings.customHeaders['X-CSRF'] = XHR.getResponseHeader('X-CSRF');
                                    if(XHR.status == 449){
                                        retry = true;
                                    }
                                }

                                if(retry){
                                    startRequest(_data,_responseEvent,_settings);
                                }
                                else if(response){
                                    try{
                                        response = JSON.parse(response);
                                    }
                                    catch(e) {
                                        KUBE.console.log('AJAX ERROR: ', response);
                                        if (settings.parseFailHandler) {
                                            settings.parseFailHandler(response);
                                        }
                                        else {
                                            //document.body.innerHTML = _settings.requestHandler+"<br />"+response+"<br />"+JSON.stringify(_data);
                                            throw new Error('AJAX JSON Parse Failed. Possibly Not JSON?');
                                        }
                                    }
                                    completeRequest(response,_responseEvent);
                                }
							}
							catch(e){
								$return.Emit('error',e);
							}
						}
					}
					startRequestTimer();
					XHR.send(requestData);
					$return.Emit('request', $api);
				}
			}
			else{
				//We're in function land
				KUBE.console.log('pre function call...',_data);
				startRequestTimer();
				response = _settings.requestHandler.call(undefined,_data);
				if(KUBE.Is(response) == 'object' && response.On && response.HandleRequest){
					KUBE.console.log('event object found, waiting for ready...');
					response.On('ready', function(responseData){
						KUBE.console.log('ready fired');
						completeRequest(responseData,_responseEvent);
					});
					response.HandleRequest(_data);
				}
				else{
					completeRequest(response,_responseEvent);
				}
			}
			
			return $api;
			
			/* request methods */
			function initXHR(){
				try { return new XMLHttpRequest(); } catch(e) {}
				try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
			};
			
			function setupMethod(_XHR, _method, _url, _data, _flatten){
				var $return,count,key,val,uri;
				switch(_method){
                    case 'post':
						_XHR.open('post', _url, true);
                        //So, FormData intentionally doesn't have a header set as xhr.send will automatically set the correct
                        //ContentType AND Boundary.  If you set it manually, you will have bad time.
						if(KUBE.Is(_data,true) === "FormData"){
							$return = _data;
						}
						else if(_flatten && KUBE.Is(_data) == 'object'){
                            _XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
							count = 0;
							$return = '';
							for(var prop in _data){
								key = encodeURIComponent(prop);
								val = encodeURIComponent((KUBE.Is(_data[prop]) == 'object' ? JSON.stringify(_data[prop]) : _data[prop]));
								$return = $return+(!count ? key+'='+val : '&'+key+'='+val);
								count++;
							}
						}
						else if(!_flatten && KUBE.Is(_data) == 'object'){
                            _XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
							$return = 'data='+encodeURIComponent((KUBE.Is(_data) == 'object' ? JSON.stringify(_data) : _data));
						}
						else{
                            _XHR.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
							$return = 'data='+encodeURIComponent(_data);
						}
						break;

					case 'put':
						_XHR.open('put', _url, true);
                        switch(KUBE.Is(_data,true)){
                            case "Object":
                                _XHR.setRequestHeader("Content-type", "application/json")
                                $return = encodeURIComponent(_data);
                                break;
                            case "FormData": //Do no headers for FormData. (Not sure if it makes sense with PUT, but w/e.
                                $return = _data;
                                break;
                            default:
                                _XHR.setRequestHeader("Content-type", "text/plain")
                                $return = encodeURIComponent(_data);
                                break;
                        }
						break;

					case 'get':
						if(KUBE.Is(_data) == 'object'){
							count = 0;
							for(var prop in _data){
								key = encodeURIComponent(prop);
								val = (KUBE.Is(_data[prop]) == 'object' ? encodeURIComponent(JSON.stringify(_data[prop])) : (KUBE.Is(_data[prop]) == 'string' ? encodeURIComponent(_data[prop]) : ''));
								uri = uri+(!count ? key+'='+val : '&'+key+'='+val);
							}
						}
						else if(KUBE.Is(_data,true) === "FormData"){
                            // This isn't entirely correct, but a File in FormData with get will cause issues, and in some
                            // server configs, cause the request to fail anyways (URI string limit).  If people are trying to
                            // do this, they're probably crazy. :) (We might wanna change it a bit eventually, but for now, lets leave it).

							throw new Error('FormData objects cannot be used with GET request type.');
						}

						_XHR.open('get', _url+uri, true);
						break;
				}

                if(!settings.customHeaders.KUBE().isEmpty()){
                    settings.customHeaders.KUBE().each(function(_headerName,_headerData){
                        _XHR.setRequestHeader(_headerName,_headerData);
                    });
                }

				return $return;
			};			

			function startRequestTimer(){
				var D = new Date();
				timer.startTime = D.getTime();
				if(settings.freezeDelay){
					timer.freezeTimer = setTimeout(function(){ $return.Emit('freeze', true); }, settings.freezeDelay);
				}

				if(settings.timeout){
					timer.timeoutTimer = setTimeout(function(){ $return.Emit('timeout', _data); cancel(); }, settings.timeout)
				}
			};


			function cancel(){
				//Abort
				if(KUBE.Is(XHR) == 'object' && XHR.abort){
					XHR.aborted = true;
					XHR.abort();
				}
				else if(KUBE.Is(response) == 'object' && response.Emit){
					response.Emit('abort', _data);
				}
				
				//Cancel our freeze
				requestData = undefined;
				response = undefined;
				if(timer.freezeTimer){
					clearTimeout(timer.freezeTimer);
				}
				$return.Emit('freeze', false);
				if(timer.timeoutTimer){
					clearTimeout(timer.timeoutTimer);
				}
				timer = {};
				currentRequest = undefined;
				XHR = undefined;
				processing = false;
			};
			
			function completeRequest(_response,_responseEvent){
				//Cancel our freeze if it exists
				$return.Emit('freeze', false);
				
				//First we cancel our timers
				if(timer.freezeTimer){
					clearTimeout(timer.freezeTimer);
				}
				if(timer.timeoutTimer){
					clearTimeout(timer.timeoutTimer);
				}
				timer = {};
				
				//Now we kill our currentXHR
				currentRequest = undefined;
				
				//We Emit our response
				if(XHR){
					if(processing && XHR.status !== 0){
						$return.Emit(_responseEvent, _response);
					}
				}
				else{
					$return.Emit(_responseEvent, _response);
				}
				
				//We flag our processing to finished
				XHR = undefined;
				processing = false;
				
				//We let our Q take over
				startQ(false);
			};
		};

		function copySettings(_obj){
			var $return = {};
			if(KUBE.Is(_obj) == 'object'){
				for(var prop in _obj){
					if(_obj.hasOwnProperty(prop)){
						$return[prop] = _obj[prop];
					}
				}
			}
			return $return;
		};
	};
	
	Ajax.prototype.class = 'Ajax';
	
}(KUBE));
