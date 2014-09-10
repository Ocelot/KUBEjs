(function(KUBE){
	"use strict";
	KUBE.LoadSingleton('WinDocJack',WinDocJack,['ExtendFunction','ExtendObject']);
	
	WinDocJack.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function WinDocJack(){
		var domListeners,ready,Events,$api,mouseX,mouseY;
		
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
			'Resize':Resize,
            'PopState':PopState,
			'On':On,
			'Once':Once,
			'Emit':Emit,
			'Clear':Clear,
			'RemoveListener':RemoveListener,
			'Style':Style
		}.KUBE().create(WinDocJack.prototype);

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
		
		function Resize(_callback){
			initResize();
			Events.On('resize', _callback);
		}

        function PopState(_callback){
            initPopState();
            Events.On('popstate',_callback);
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
		
		function initResize(){
			var f;
			if(!domListeners.resize){
				f = function(e){ domTrigger('resize', e); };
				if(window.addEventListener){
					window.addEventListener('resize', f, true);
				}
				else{
					window.attachEvent('onresize', f);
				}
			}
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

        function initPopState(){
            var f;
            if(!domListeners.resize){
                f = function(e){ domTrigger('popstate', e); };
                if(window.addEventListener){
                    window.addEventListener('popstate', f, true);
                }
                else{
                    window.attachEvent('onpopstate', f);
                }
            }
        }

		function initDomListener(_event){
			var f;
			_event = translateEvent(_event);
			if(!domListeners[_event] && KUBE.Is(document['on'+_event]) !== 'undefined'){
				f = function(e){ domTrigger(_event,e); };
				domListeners[_event] = f;
				(document.addEventListener ? document.addEventListener(_event,f,true) : document.attachEvent('on'+_event,f));
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
	}
}(KUBE));