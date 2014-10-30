(function(KUBE){
	"use strict";
	KUBE.LoadSingleton('/Library/DOM/WinDocJack',WinDocJack,['/Library/Extend/Function','/Library/Extend/Object']);

	WinDocJack.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function WinDocJack(){
		var domListeners,ready,Events,$api,mouseX,mouseY, __windowAbs, __documentAbs;

		domListeners = {};
		ready = false;
		Events = KUBE.Events();
		$api = {
			'WindowHeight':WindowHeight,
			'WindowWidth':WindowWidth,
			'MouseX':MouseX,
			'MouseY':MouseY,
			'IsReady':IsReady,
			'Ready':Ready,
			'On':On,
			'Once':Once,
			'Emit':Emit,
			'Clear':Clear,
			'RemoveListener':RemoveListener,
			'Style':Style,
            'Window': function(){return __windowAbs},
            'Document': function(){return __documentAbs}
		}.KUBE().create(WinDocJack.prototype);

        __windowAbs = _Window();
        __documentAbs = _Document();

        initReady();
		return $api;

		/******* PUBLIC *******/

		//Window specific methods
		function WindowHeight(){
			return window.innerHeight || window.document.documentElement.clientHeight;
		}

		function WindowWidth(){
			return window.innerWidth || window.document.documentElement.clientWidth;
		}

		function MouseX(){
			return mouseX;
		}

		function MouseY(){
			return mouseY;
		}

		//Events handling
		function On(_event,_callback){
			if(_event.toLowerCase() === "ready"){
				Ready(_callback);
			}
			else{
				_event = translateEvent(_event);
				if(!catchReady(_event,_callback)){
					initDomListener(_event);
					Events.On(_event, _callback, $api);
				}
			}
		}

		function Once(_event,_callback){
			_event = translateEvent(_event);
			initDomListener(_event);
			Events.Once(_event,_callback, $api);
		}

		function Emit(_event){
			_event = translateEvent(_event);
			initDomListener(_event);
			Events.Emit(_event);
		}

		function Clear(_event){
			_event = translateEvent(_event);
			initDomListener(_event);
			Events.Clear(_event);
			cleanListeners(_event);
		}

		function RemoveListener(_event){
			// This is wrong. FIX (not sure how this is wrong months after the fact, look into more later)
			_event = translateEvent(_event);
			initDomListener(_event);
			Events.RemoveListener(_event);
			if(domListeners[_event]){
				domListeners[_event] = false;
			}
		}

		//Special event handling
		function Ready(_callback){
			if(KUBE.Is(_callback) === 'function'){
				if(document.readyState === 'complete'){
					ready = true;
					_callback();
				}
				else{
					initReady();
					Events.Once('ready',_callback);
				}
			}
		}

		//Think I might deprecate this
		function IsReady(){
			return ready;
		}

		function Style(){
			return {
				'Top':function(_val){ return handleFauxStyle(_val,0); },
				'Right':function(_val){ return handleFauxStyle(_val,0); },
				'Bottom':function(_val){ return handleFauxStyle(_val,0); },
				'Left':function(_val){ return handleFauxStyle(_val,0); },
				'Width':function(_val){ return handleFauxStyle(_val,WindowWidth()); },
				'Height':function(_val){ return handleFauxStyle(_val,WindowHeight()); }
			};

			function handleFauxStyle(_val,_return){
				return returnRawVal(_val,_return) || returnFauxGet(_return);
			}

			function returnFauxGet(_return){
				return {'Get':function(){ return _return; }};
			}

			function returnRawVal(_val,_return){
				return (_val ? (_val === '$' ? _return+'px' : triggerError()) : false);
			}

			function triggerError(){
				throw new Error('Cannot set Style on the Window/Document object');
			}
		}

		//Private methods
		function catchReady(_event,_callback){
			var $return = false;
			if(_event === 'ready'){
				Ready(_callback);
			}
			return $return;
		}

		function initReady(){
			var f;
			if(!ready && !domListeners.ready){
				f = function(e){ domTrigger('ready',e); };
				domListeners.ready = f;
				if(document.addEventListener){
					document.addEventListener('DOMContentLoaded', f, true);
					window.addEventListener('load', f, true);
				}
				else{
					document.attachEvent("onreadystatechange", f);
					window.attachEvent("onload", f);
					ieReadyPoll();
				}
			}
			initMouseMove();
			Events.On('mousemove',mousePosition);
		}

		function initMouseMove(){
			var f;
			if(!domListeners.mousemove){
				f = function(e){ domTrigger('mousemove',e); };
				if(window.addEventListener){
					window.addEventListener('mousemove',f,true);
				}
				else{
					window.attachEvent('onmousemove',f);
				}
			}
		}

		function initDomListener(_event){
			var f;
			_event = translateEvent(_event);
			if(!domListeners[_event] && KUBE.Is(document['on'+_event]) !== 'undefined'){
				f = function(e){ domTrigger(_event,e); };
				domListeners[_event] = f;
                (document.addEventListener ? document.addEventListener(_event,f,true) : document.attachEvent('on'+_event,f))
			}
		}

		function cleanListeners(_event){
			var prop;
			if(_event){
				if(domListeners[_event]){
					(document.removeEventListener ? document.removeEventListener(_event, domListeners[_event],true) : document.detachEvent('on'+_event, domListeners[_event]));
					domListeners[_event] = undefined;
					delete domListeners[_event];
				}
			}
			else{
				for(prop in domListeners){
					if(domListeners.hasOwnProperty(prop)){
						cleanListeners(prop);
					}
				}
			}
		}

		function domTrigger(_eventName, _eventObj){
			var action = domTriggerReady(_eventName,_eventObj) || Events.Emit(_eventName,_eventObj);
			domPreventDefault(action,_eventObj);
		}

		function domTriggerReady(_event,_e){
			var $return = false;
			if(_event === 'ready' && !ready){
				ready = true;
				if (document.addEventListener){
					document.removeEventListener("DOMContentLoaded", domListeners.ready, true);
				}
				else if(document.readyState === "complete"){
					document.detachEvent( "onreadystatechange", domListeners.ready);
				}
				$return = Events.Emit(_event, _e);
				Events.RemoveListener('ready');
			}
			return $return;
		}

		function domPreventDefault(_action,_eventObj){
			if(_action === false && KUBE.Is(_eventObj) === 'object'){
				if(_eventObj.preventDefault){
					_eventObj.preventDefault();
				}
				else{
					_eventObj.returnValue = false;
				}
			}
		}

		function translateEvent(_event){
			_event = String(_event).toLowerCase();
			if(_event.substr(0,2) === 'on'){
				_event = _event.substr(2);
			}
			if(_event === 'resize'){
				initResize();
			}
			return _event;
		}


		function ieReadyPoll(){
			// Use the trick by Diego Perini
			// http://javascript.nwbox.com/IEContentLoaded/
			var top = false;

			try{
				top = window.frameElement === null && document.documentElement;
			}catch(e) {}

			if(top && top.doScroll){
				(function doScrollCheck(){
					if(!$api.ready){
						try{
							top.doScroll("left");
						}catch(e) {
							return setTimeout( doScrollCheck, 50 );
						}
						domTrigger('ready');
					}
				}());
			}
		}

		function mousePosition(e){
			mouseX = e.clientX;
			mouseY = e.clientY;
		}

        //Weird _ to try to avoid problems with the real window and document objects

        function _Window(){
            var $API;
            var domListeners = {};
            var Events = KUBE.Events();

            $API = {
                'On':On,
                'Once':Once,
                'Emit':Emit,
                'Clear':Clear,
                'RemoveListener':RemoveListener
            };

            return $API;

            //Events handling
            function On(_event,_callback){
                _event = translateEvent(_event);
                if(!catchReady(_event,_callback)){
                    initDomListener(_event);
                    Events.On(_event, _callback, $api);
                }
            }

            function Once(_event,_callback){
                _event = translateEvent(_event);
                initDomListener(_event);
                Events.Once(_event,_callback, $api);
            }

            function Emit(_event){
                _event = translateEvent(_event);
                initDomListener(_event);
                Events.Emit(_event);
            }

            function Clear(_event){
                _event = translateEvent(_event);
                initDomListener(_event);
                Events.Clear(_event);
                cleanListeners(_event);
            }

            function RemoveListener(_event){
                // This is wrong. FIX (not sure how this is wrong months after the fact, look into more later)
                _event = translateEvent(_event);
                initDomListener(_event);
                Events.RemoveListener(_event);
                if(domListeners[_event]){
                    domListeners[_event] = false;
                }
            }

            function initDomListener(_event){
                var f;
                _event = translateEvent(_event);
                //MENTAL NOTE INCASE THINGS DON'T WORK. I REMOVED THE CHECK ON THE DOCUMENT OBJECT FOR PRESENCE OF ON + event
                if(!domListeners[_event]){
                    f = function(e){ domTrigger(_event,e); };
                    domListeners[_event] = f;
                    (window.addEventListener ? window.addEventListener(_event,f,true) : window.attachEvent('on'+_event,f))
                }
            }

            function domTrigger(_eventName, _eventObj){
                var action = domTriggerReady(_eventName,_eventObj) || Events.Emit(_eventName,_eventObj);
                domPreventDefault(action,_eventObj);
            }

            function cleanListeners(_event){
                var prop;
                if(_event){
                    if(domListeners[_event]){
                        (window.removeEventListener ? window.removeEventListener(_event, domListeners[_event],true) : window.detachEvent('on'+_event, domListeners[_event]));
                        domListeners[_event] = undefined;
                        delete domListeners[_event];
                    }
                }
                else{
                    for(prop in domListeners){
                        if(domListeners.hasOwnProperty(prop)){
                            cleanListeners(prop);
                        }
                    }
                }
            }

            function domPreventDefault(_action,_eventObj){
                if(_action === false && KUBE.Is(_eventObj) === 'object'){
                    if(_eventObj.preventDefault){
                        _eventObj.preventDefault();
                    }
                    else{
                        _eventObj.returnValue = false;
                    }
                }
            }

            function translateEvent(_event){
                _event = String(_event).toLowerCase();
                if(_event.substr(0,2) === 'on'){
                    _event = _event.substr(2);
                }
                return _event;
            }

        }

        function _Document(){
            var $API = {};
            var domListeners = {};

            $API = {
                'On':On,
                'Once':Once,
                'Emit':Emit,
                'Clear':Clear,
                'RemoveListener':RemoveListener
            };

            return $API;

            //Events handling
            function On(_event,_callback){
                _event = translateEvent(_event);
                if(!catchReady(_event,_callback)){
                    initDomListener(_event);
                    Events.On(_event, _callback, $api);
                }
            }

            function Once(_event,_callback){
                _event = translateEvent(_event);
                initDomListener(_event);
                Events.Once(_event,_callback, $api);
            }

            function Emit(_event){
                _event = translateEvent(_event);
                initDomListener(_event);
                Events.Emit(_event);
            }

            function Clear(_event){
                _event = translateEvent(_event);
                initDomListener(_event);
                Events.Clear(_event);
                cleanListeners(_event);
            }

            function RemoveListener(_event){
                // This is wrong. FIX (not sure how this is wrong months after the fact, look into more later)
                _event = translateEvent(_event);
                initDomListener(_event);
                Events.RemoveListener(_event);
                if(domListeners[_event]){
                    domListeners[_event] = false;
                }
            }

            function initDomListener(_event){
                var f;
                _event = translateEvent(_event);
                //MENTAL NOTE INCASE THINGS DON'T WORK. I REMOVED THE CHECK ON THE DOCUMENT OBJECT FOR PRESENCE OF ON + event
                if(!domListeners[_event]){
                    f = function(e){ domTrigger(_event,e); };
                    domListeners[_event] = f;
                    (document.addEventListener ? document.addEventListener(_event,f,true) : document.attachEvent('on'+_event,f))
                }
            }

            function domTrigger(_eventName, _eventObj){
                var action = domTriggerReady(_eventName,_eventObj) || Events.Emit(_eventName,_eventObj);
                domPreventDefault(action,_eventObj);
            }

            function cleanListeners(_event){
                var prop;
                if(_event){
                    if(domListeners[_event]){
                        (document.removeEventListener ? document.removeEventListener(_event, domListeners[_event],true) : document.detachEvent('on'+_event, domListeners[_event]));
                        domListeners[_event] = undefined;
                        delete domListeners[_event];
                    }
                }
                else{
                    for(prop in domListeners){
                        if(domListeners.hasOwnProperty(prop)){
                            cleanListeners(prop);
                        }
                    }
                }
            }

            function domPreventDefault(_action,_eventObj){
                if(_action === false && KUBE.Is(_eventObj) === 'object'){
                    if(_eventObj.preventDefault){
                        _eventObj.preventDefault();
                    }
                    else{
                        _eventObj.returnValue = false;
                    }
                }
            }

            function translateEvent(_event){
                _event = String(_event).toLowerCase();
                if(_event.substr(0,2) === 'on'){
                    _event = _event.substr(2);
                }
                return _event;
            }

        }
	}
}(KUBE));