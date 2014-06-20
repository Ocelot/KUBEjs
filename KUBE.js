(function(window,KUBEPrototype){
	"use strict";
	
	var KUBE,AutoLoader,config = { };

    //Moved safely to a short circuit because now a safe default exists
    config = (typeof window.KUBE === 'object' && typeof window.KUBE.config === 'object') ? window.KUBE.config : initDefaultConfig();

    /**
     * As an addendum KUBEjs is an ugly file with a ton of complex stuff going on which makes it ugly to work on.
     * Regardless I try to not have grouped logic just floating around in a non specific scope. Previously I was accepting
     * the global setting (window.KUBE.config). Now that we have internal logic to define a default config, I'll group that
     * into its own space with the assumption that it will probably be added to and extended later. This just assists in
     * future proofing for future developers/
     */

    //Because I went retarded, I removed the comments
    function initDefaultConfig(){
        var config = {
            "autoLoadPath" : getAutoLoadPath()
        };
        return config;

        function getAutoLoadPath() {
            var src = srcFromCurrentScript() || srcFallback();
            return parseAutoLoadPath(src);
        }

        function parseAutoLoadPath(_src) {
            var paths = _src.split('/');
            return paths.splice(0,paths.length-1).join('/') + '/';
        }

        function srcFromCurrentScript(){
            return (document.currentScript !== undefined) ? document.currentScript.getAttribute('src') : false;
        }

        function srcFallback(){
            var scripts;
            scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1].src;
        }
    }
	
	/* Create KUBE */
	KUBE = E();
	KUBEEvents(KUBE);
	window.KUBE = KUBE;
	
	/* Load in Patience */
	AutoLoader = new KUBELoader(KUBE);
    AutoLoader.SetAutoPath(config.autoLoadPath+'/Library');
	KUBE.LoadFactory('Patience', Patience);
	KUBE.LoadSingletonFactory('Loader',KUBELoader);
	
	/* Prototype onto native */
    /* Note: define property WILL break in IE8, however because we can set enumerable to false, it shouldn't break jQuery.  6 of one, half dozen of another. */
	//if(KUBEPrototype){
        Object.defineProperty(Boolean.prototype,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(this); }
        });
        Object.defineProperty(Number.prototype,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(this); }
        });
        Object.defineProperty(String.prototype,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(this); }
        });
        Object.defineProperty(Function.prototype,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(this); }
        });
        Object.defineProperty(Array.prototype,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(this); }
        });
        Object.defineProperty(Date.prototype,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(this); }
        });
        Object.defineProperty(RegExp.prototype,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(this); }
        });
        Object.defineProperty(Object.prototype,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(this); }
        });

	//}
	
	if(KUBE.Is(config.preLoad) === 'array'){
		for(var i=0;i<config.preLoad.length;i++){
			KUBE.SetAsLoaded(config.preLoad[i]);
		}
	}
	
	/* Primary definition */
	function E(){
		var nativeTable,$KUBEAPI;
		
		nativeTable = { '[object Boolean]':'boolean', '[object Number]':'number', '[object String]':'string', '[object Function]':'function', '[object Array]':'array', '[object Date]':'date', '[object RegExp]':'regExp', '[object Object]':'object', '[object Undefined]':'undefined', '[object Null]':'null' };
		$KUBEAPI = {
			'Is':Is,
			'LoadFunction':LoadFunction,
			'LoadFactory':LoadFactory,
			'LoadSingleton':LoadSingleton,
			'LoadSingletonFactory':LoadSingletonFactory,
			'AutoLoad':AutoLoad,
			'Uses':Uses,
			'SetAsLoaded':SetAsLoaded,
			'Extend':Extend,
			'Events':Events,
			'Config':Config
		};
		
		return $KUBEAPI;
		
		/* public */
		//Cleaned up is, single table object created, reuses it. Returns immediately on undefined and null, no additional function call.
		function Is(_val,_objType){
			var $return;
			if(_val === undefined){ return 'undefined'; }
			if(_val === null){ return 'null'; }
			
			$return = nativeTable[Object.prototype.toString.call(_val)];
			if(!_objType){
				return $return || 'object';
			}
			
			if($return !== 'object' && $return){
				return $return;
			}
			
			return (_val.toString ? _val.toString() : Object.prototype.toString.call(_val)).match(/\[object ([^\]]*)\]/)[1];
		}
		
		function LoadFunction(_fName,_f,_needs){
			if(Is(_f) === 'function'){
				AutoLoader.SetAsLoaded(_fName);
				(_needs ? AutoLoader.Uses(_needs,load,_fName) : load());
			}

			function load(){
				$KUBEAPI[_fName] = _f; 
				console.log('successfully loaded '+_fName);
				$KUBEAPI.EmitState(_fName);
			}
		}
		
		function LoadFactory(_class,_classFunction,_needs){
			if(Is(_classFunction) === 'function'){
				AutoLoader.SetAsLoaded(_class);
				(_needs ? AutoLoader.Uses(_needs,load,_class) : load());
			}

			function load(){
				$KUBEAPI[_class] = function(){
					var args = arguments;
					function F(){
						return _classFunction.apply(_classFunction,args);
					};
					return Events(new F());
				};
				console.log('successfully loaded '+_class);
				$KUBEAPI.EmitState(_class);
			}
		}
		
		function LoadSingleton(_class,_classFunction,_needs){
			if(Is(_classFunction) === 'function'){
				AutoLoader.SetAsLoaded(_class);
				(_needs ? AutoLoader.Uses(_needs,load,_class) : load());
			}

			function load(){
				var $static = _classFunction.apply(_classFunction);
				$static = Events($static);
				$KUBEAPI[_class] = function(){
					return (KUBE.Is($static) === 'function' ? $static.apply($static, Array.prototype.slice.call(arguments)) : $static);
				};
				console.log('successfully loaded '+_class);
				$KUBEAPI.EmitState(_class);
			}
		}
		
		function LoadSingletonFactory(_class,_classFunction,_needs){
			if(KUBE.Is(_classFunction) === 'function'){
				AutoLoader.SetAsLoaded(_class);
				(_needs ? AutoLoader.Uses(_needs,load,_class) : load());
			}

			function load(){
				var staticInstances = {};
				$KUBEAPI[_class] = function(instance){
					if(!staticInstances[String(instance).toLowerCase()]){
						staticInstances[String(instance).toLowerCase()] = Events(_classFunction.call(_classFunction,instance));
					}
					return staticInstances[String(instance).toLowerCase()];
				};			
				console.log('successfully loaded '+_class);
				$KUBEAPI.EmitState(_class);
			}			
		}
		
		function AutoLoad(_map,_overwrite){
			AutoLoader.Map(_map,config.autoLoadPath,_overwrite);
		}

		function SetAsLoaded(_codeName){
			AutoLoader.SetAsLoaded(_codeName);
		}
		
		function Uses(_dependancies,_callback){
			return AutoLoader.Uses(_dependancies,_callback);
		}
		
		function Extend(){
			return KUBEExtend();
		}
		
		function Events(_initObj){
			var type = Is(_initObj);
			return (type === 'object' ? KUBEEvents(_initObj) : (type === 'undefined' ? KUBEEvents({}) : _initObj));
		}
		
		function Config(){
			return config;
		}
	}

	/* KUBE Events */
	function KUBEEvents(obj){
		var eventCache = {},
			stateCache = {};
	
		if(KUBE.Is(obj) === 'object' && obj.initEvents !== false && obj.KUBEAuto !== false && !obj.On && !obj.Once && !obj.Emit && !obj.Clear && !obj.RemoveListener && !obj.EmitState && !obj.OnState && !obj.ClearState){
			delete obj.initEvents;
			obj.On = On;
			obj.Once = Once;
			obj.Emit = Emit;
			obj.Clear = Clear;
			obj.RemoveListener = RemoveListener;
			obj.EmitState = EmitState;
			obj.OnState = OnState;
			obj.ClearState = ClearState;
			obj.CheckState = CheckState;
		}
		return obj;

		/* Public */
		function On(_event, _callback,_context){
			var bind,i;
			
			bind = true;
			_event = initEventSpace(_event);
			_context = _context || obj;
			
			for(i=0;i<eventCache[_event].length;i++){
				if(eventCache[_event][i] === _callback){
					bind = false;
					break;
				}
			}
			if(bind && KUBE.Is(_callback) === 'function'){
				eventCache[_event].push({'e':function(){ return _callback.apply(_context,arguments);},'r':_callback});
				Emit('newListener', _callback);
			}
		}
		
		function Once(_event,_callback,_context){
			var bind,i,$return;
			
			bind = true;
			_event = initEventSpace(_event);
			_context = _context || obj;
			
			for(i=0;i<eventCache[_event].length;i++){
				if(eventCache[_event][i] === _callback){
					bind = false;
					break;
				}
			}
			if(bind && KUBE.Is(_callback) === 'function'){
				eventCache[_event].push({'e':function(){ RemoveListener(_event,_callback); var r = _callback.apply(_context,arguments); return r; },'r':_callback});
				$return = Emit('newListener', {'event': _event, 'listener':_callback});
			}
			return $return;
		}
		
		function Emit(_event){
			var i,length,args,eventCopy,$return;
			
			_event = initEventSpace(_event);
			args = new Array(arguments.length-1);
			
			for (i = 1; i < arguments.length; i++){
				args[i-1] = arguments[i];
			}
			
			if(eventCache[_event]){
				eventCopy = copyArray(eventCache[_event]);
				length = eventCopy.length;
				for (i=0;i<length;i++) {
					if(eventCopy[i].e.apply(obj, args) === false){
						$return = false;
						break;
					}
				}
				eventCopy = undefined;
			}
			return $return;
		}
		
		function EmitState(_state){
			var fireArray,i;
			//console.log('EmitState called: '+_state);
			_state = initStateSpace(_state);
			if(!stateCache[_state].state){
				stateCache[_state].state = true;
				fireArray = stateCache[_state].f;
				for(i=0;i<fireArray.length;i++){
					if(KUBE.Is(fireArray[i]) === 'function'){
						try{
							fireArray[i]();
						}
						catch(E){
							throw E; //This should probably be attached to a Debug flag...
						}
					}
				}
				stateCache[_state].f = [];
			}
		}
		
		function OnState(_state,_f){
			if(KUBE.Is(_f) === 'function'){
				_state = initStateSpace(_state);
				if(!stateCache[_state].state){
					stateCache[_state].f.push(_f);
				}
				else{
					try{
						_f();
					}
					catch(E){
						throw E; //Attach to debug flag...
					}
				}
			}
		}
		
		function CheckState(_state){
			_state = initStateSpace(_state);
			return stateCache[_state].state;
		}
		
		function ClearState(_state){
			if(_state){
				_state = initStateSpace(_state);
				stateCache[_state] = undefined;
				delete stateCache[_state];
			}
			else{
				stateCache = [];
			}
		}
		
//		function CheckState(_state){
//			initStateSpace(_state);
//			return stateCache[_state].state;
//		}
		
		function Clear(_event){
			if(_event){
				_event = initEventSpace(_event);
				eventCache[_event] = undefined;
				delete eventCache[_event];
			}
			else{
				eventCache = undefined;
				eventCache = {};
			}
		}
		
		function RemoveListener(_event,_callback){
			var i;
			_event = initEventSpace(_event);
			for(var i=0;i<eventCache[_event].length;i++){
				if(eventCache[_event][i].r === _callback){
					eventCache[_event].splice(i,1);
					break;
				}
			}
		}
		

		/* Private */
		function initEventSpace(_event){
			_event = String(_event).toLowerCase();
			if(KUBE.Is(eventCache[_event]) === 'undefined'){
				eventCache[_event] = [];
			}
			return _event;
		}
		
		function initStateSpace(_state){
			_state = String(_state).toLowerCase();
			if(stateCache[_state] === undefined){
				stateCache[_state] = {'state':false,'f':[]};
			}
			return _state;
		}
		
		function copyArray(origArray){
			var i,copyArray = [];
			if(KUBE.Is(origArray) === 'array'){
				for(i=0;i<origArray.length;i++){
					copyArray.push(origArray[i]);
				}
			}
			return copyArray;
		}
	}
		
	/* Patience Control Flow */
	function Patience(){
		var running,syncQ,resolveQ,argQ,$patienceAPI,pendingArgs;
		
		running = false;
		syncQ = [],resolveQ = [],argQ = [];
		$patienceAPI = {
			'Wait':Wait,
			'WaitInject':WaitInject,
			'LazyLoop':LazyLoop,
			'Clear':Clear,
			'Debug':Debug
		};
		
		if(arguments.length){
			Wait.apply(this,arguments);
		}
		return $patienceAPI;
		
		function Clear(){
			syncQ = [], resolveQ = [], argQ = [];
			running = false;
		}

		function Debug(){
			console.log(syncQ);
		}

		function Wait(){
			var i,i2,valid,fQ,aQ;
			
			valid = false;
			fQ = [], aQ = [];
			
			//Ugly, refactor this
			if(arguments.length){
				for(i=0;i<arguments.length;i++){
					if(KUBE.Is(arguments[i]) === 'function'){
						valid = true;
						fQ.push(arguments[i]);
						aQ.push(undefined);
					}
					else if(KUBE.Is(arguments[i]) === 'array'){
						for(i2=0;i2<arguments[i].length;i2++){
							if(KUBE.Is(arguments[i][i2]) === 'function'){
								valid = true;
								fQ.push(arguments[i][i2]);
								aQ.push(undefined);
							}							
						}
					}
				}
				if(valid){
					syncQ.push(fQ);
					argQ.push(aQ);
					resolveQ.push(false);
				}
			}
			runQ();
			return $patienceAPI;
		}
		
		function WaitInject(_f,_index){
			var valid,fQ,aQ;
			
			valid = false;
			fQ = [], aQ = [];
			
			if(KUBE.Is(_f) === 'function'){
				valid = true;
				fQ.push(_f);
				aQ.push(undefined);
			}
			
			if(valid){
				syncQ.splice(_index,0,fQ);
				argQ.splice(_index,0,aQ);
				resolveQ.splice(_index,0,false);
			}
			console.log('inject',_index);
			runQ();
			return $patienceAPI;
		}

		function LazyLoop(_iterableVal, _function,_index){
			if(KUBE.Is(_function) === 'function'){
				switch(KUBE.Is(_iterableVal)){
					case 'array':
						lazyLoopArray(_iterableVal, _function,_index);
						break;
						
					case 'object':
						lazyLoopObject(_iterableVal, _function,_index);
						break;
				}
			}
			return $patienceAPI;
		}

		/* Private methods */
		function lazyLoopArray(_array,_f,_index){
			var W = (_index ? WaitInject : Wait);
			W(function(){
				var i,resolve,args,endKey,rIndex;
				
				args = arguments;
				resolve = this.resolve;
				i = 0;
				endKey = _array.length-1;
				setTimeout(iterate,0);
				
				function iterate(){
					var a,localArgs,api;
					
					localArgs = [];
					api = {
						'stop':stop,
						'next':next,
						'last':last,
						'resolve':resolve,
						'resolveIndex':rIndex
					};
					
					localArgs.push(i);
					localArgs.push(_array);
					
					if(args.length){
						for(a=0;a<args.length;a++){
							localArgs.push(args[a]);
						}
					}
					
					if(i <= endKey){ 
						_f.apply(api,localArgs);
					}
					
					function stop(_v){
						resolve(_v);
					}
					
					function next(){
						i++;
						setTimeout(iterate,0);
					}
					
					function last(){
						return (i === endKey ? true : false);
					}
				}				
			},_index);
		}
		
		function lazyLoopObject(_obj,_f,_index){
			var W = (_index ? WaitInject : Wait);
			W(function(){
				var prop,args,resolve,i,endKey,propRef,objLength,resolveIndex;
				
				args = arguments;
				propRef = [];
				objLength = 0;
				for(prop in _obj){
					if(_obj.hasOwnProperty(prop)){
						objLength++;
						propRef.push(prop);
					}
				}
				
				resolve = this.resolve;
				resolveIndex = this.resolveIndex;
				
				i = 0;
				endKey = propRef.length-1;
				setTimeout(iterate,0);
				
				function iterate(){
					var a,localArgs,api;
					
					localArgs = [];
					api = {
						'stop':stop,
						'next':next,
						'last':last,
						'resolve':resolve,
						'resolveIndex':resolveIndex
					};

					localArgs.push(propRef[i]);
					localArgs.push(_obj);
					
					if(args.length){
						for(a=0;a<args.length;a++){
							localArgs.push(args[a]);
						}
					}

					if(i <= endKey){
						_f.apply(api,localArgs); 
						i++; 
					}
					
					function stop(_v){
						resolve(_v); 
					}
					
					function next(){ 
						setTimeout(iterate,0);	
					}
					
					function last(){
						return (i === endKey ? true : false); 
					}
				}
			},_index);			
		}
		
		function runQ(){
			if(!running){
				running = true;
				if(!startResolveQ()){
					running = false;
				}
			}
		}

		function startResolveQ(){
			var i,f,functions,$return,resetQ = true;
			
			$return = false;
			for(i=0;i<resolveQ.length;i++){
				if(!resolveQ[i]){
					resetQ = false;
					$return = true;
					functions = syncQ[i];
					for(f=0;f<functions.length;f++){
						if(KUBE.Is(functions[f]) === 'function'){
							resolveClosure(argQ,i,functions,f,function(){ resolveQ[i] = true; running = false; runQ(); },Clear);
						}
					}
					break;
				}
			}
			
			if(resetQ){
				if(argQ.length){
					pendingArgs = argQ.pop();
				}
				Clear();
			}
			
			return $return;
		}

		function resolveClosure(_argQ,_qKey,_functions,_i,_resolved,_Clear){
			if(pendingArgs){
				_argQ[_qKey-1] = pendingArgs;
				pendingArgs = undefined;
			}
			(function(_argQ,_qKey,_functions,_i,_resolved,_Clear){
				var cleared = false;
				
				function resolve(_v){
					var resolved,c;
					
					if(!cleared){
					   resolved = true;
					   _functions[_i] = true;
					   _argQ[_qKey][_i] = _v;
					   
					   for(c=0;c<_functions.length;c++){
						   if(KUBE.Is(_functions[c]) === 'function'){
							   resolved = false;
						   }
					   }
					   
					   if(resolved){
						   _resolved();
					   }
					}
				}
				
				function resolveIndex(){
					return _qKey+1;
				}
				
				function resolveClear(){
					cleared = true;
					_Clear();
				}
				
				setTimeout(function(){
					_functions[_i].apply({'resolve':resolve,'resolveIndex':resolveIndex,'clear':resolveClear},(!_qKey ? undefined : _argQ[_qKey-1]));
				},0);
			}(_argQ,_qKey,_functions,_i,_resolved,_Clear));
		}
	}
	
	//KUBE Extends
	var extendCache = {};
	function KUBEExtend(){
		//I need to refactor the Event system on this so it's compatible with non KUBE
		var $api = {
			'Load':Load,
			'Obj':Obj,
			'List':List
		};
		return $api;

		function List(_type){
			console.dir(extendCache[_type]);
		}

		function Load(_type,_name,_function){
			initCache(_type);
			if(!extendCache[_type][_name] && KUBE.Is(_function) === 'function'){
				extendCache[_type][_name] = _function;
			}
		}
		
		function Obj(_ref){
			var f,prop,$return,is;
			
			$return = {};
			is = KUBE.Is(_ref);
			
			for(prop in extendCache[is]){
				if(extendCache[is].hasOwnProperty(prop) && prop !== 'KUBE'){
					f = extendCache[is][prop];
					bindClosure(_ref,prop,f,$return);
				}
			}
			
			//This optimizes the process on types that handle a bound space (objects)
//			(function(_obj,_extend){
//				_obj.KUBE = function(){
//					return _extend;
//				};
//			}(_ref,$return));
			return $return;
		}

		function bindClosure(_context,_name,_f,_on){
			(function(_context,_name,_f,_on){
				_on = _on || _context;
				_on[_name] = function(){
					return _f.apply(_context,arguments);
				};
			}(_context,_name,_f,_on));
		}

		function initCache(_type){
			if(!extendCache[_type]){
				extendCache[_type] = {};
			}
		}
	}
	
	function KUBELoader(_EventObj){
		var callQ,map,$API,EventEmitter,loadedCode,maps,autoPath;
		
		callQ = [];
		map = {};
		maps = [];
		loadedCode = {};

		$API = {
			'Map':Map,
			'Uses':Uses,
			'SetEmitter':SetEmitter,
			'SetAsLoaded':SetAsLoaded,
            'SetAutoPath':SetAutoPath
		};
		if(_EventObj){
			SetEmitter(_EventObj);
		}
		return $API;

        //In the event that a request is made to a name that is not mapped, it will try to autoload from this path
        function SetAutoPath(_autoPath){
            if(KUBE.Is(_autoPath) === 'string'){
                autoPath = _autoPath;
            }
            return $API;
        }

		//Set up our EventEmitter. Without this, Loader won't work
		function SetEmitter(_EventObj){
			if(KUBE.Is(_EventObj) === 'object' && KUBE.Is(_EventObj.Once) === 'function'){
				EventEmitter = _EventObj;
			}
			else{
				throw new Error('Cannot initialize autoLoader. Invalid EventObject passed in');
			}
		}
		
		function validateEmitter(){
			if(!EventEmitter){
				throw new Error('Cannot use autoLoader. Valid EventObject must be set');				
			}
		}
		
		//Sets up our loader map
		function Map(_map,_basePath,_overwrite){
			var prop;
			_basePath = _basePath || '';
			if(KUBE.Is(_map) === 'object'){
				if(_overwrite) { overwrite(); }
				for(prop in _map){
					if(_map.hasOwnProperty(prop) && !map[prop]){
						map[prop] = {'state':0,'src':_basePath+_map[prop]};
					}
				}
			}
		}
		
		function overwrite(){
			var prop;
			for(prop in map){
				if(map.hasOwnProperty(prop) && !map[prop].state){
					delete map[prop];
				}
			}
		}
		
		//Returns a promise, also will shortcut a second argument directly into the promise
		function Uses(_dependancies,_callback,_useName){
			validateEmitter();
			return (validateDependancies(_dependancies) ? getPromise(_dependancies,_callback,_useName) : false);
		}
		
		function SetAsLoaded(_codeName){
			if(KUBE.Is(_codeName) === 'string'){
				loadedCode[_codeName] = true;
			}
		}

        function validateDependancies(_dependancies){
            var className,$return = false;
            if(KUBE.Is(_dependancies) === 'array'){
                $return = true;
                if(autoPath){
                    for(i=0;i<_dependancies.length;i++){
                        className = _dependancies[i];
                        if(!map[className]){
                            map[className] = {'state':0,'src':autoPath+"/"+className+".js"};
                        }
                    }
                }
            }
            return $return;
        }
		
		//The following is a bit hacky. Refactor
		function checkDependancyChain(_className,_dependancies){
			var i,dependancy;
			if(KUBE.Is(_dependancies) === 'array'){
				for(i=0;i<_dependancies.length;i++){
					dependancy = _dependancies[i];
					if(!checkResolveChain(_className,_dependancies[i])){
						_dependancies.splice(i,1);
						_dependancies = checkDependancyChain(_className,_dependancies);
						break;
					}
				}
			}
			return _dependancies;
		}
		
		function checkResolveChain(_resolveCheck,_class){
			var i,i2,d,_b,$allowDependancy = true;
			for(i=0;i<callQ.length;i++){
				for(i2=0;i2<callQ[i].callbacks.length;i2++){
					if(callQ[i].callbacks[i2].resolveName === _class){
						//We have the dependancy requirements
						d = callQ[i].dependancies;
						_b = true;
						break;
					}
				}
				if(_b){
					break;
				}
			}
			
			if(d){
				//I need to chase down the chain of each dependancy. 
				//Theoretically I shouldn't have an issue at this point because before a full chain is added I'm deciding which dependancy can resolve
				for(i=0;i<d.length;i++){
					$allowDependancy = (_resolveCheck === d[i] ? false : checkResolveChain(_resolveCheck,d[i]));
					if(!$allowDependancy){
						break;
					}
				}
			}
			return $allowDependancy;
		}
		
		function getPromise(_dependancies,_callback,_useName){
			var index;
			
			//Now, if _useName is set, we can look to see if a circular dependancy has been set up. If it has, we bail on the current one. Which resolves in reverse, etc
			if(_useName){
				_dependancies = checkDependancyChain(_useName,_dependancies);
			}
			
			index = checkForExistingIndex(_dependancies) || getNewIndex(_dependancies);
			addScripts(_dependancies);
			if(KUBE.Is(_callback) === 'function'){
				callQ[index].callbacks.push({'f':_callback,'resolveName':_useName});
				checkScriptReady(index);
			}
			return {
				'then':function(_callback){
					if(KUBE.Is(_callback) === 'function'){
						callQ[index].callbacks.push({'f':_callback,'resolveName':_useName});
						checkScriptReady(index);
					}
				}
			};
		}
		
		function checkForExistingIndex(_dependancies){
			var i,$index;
			for(i=0;i<callQ.length;i++){
				if(compareArray(callQ[i].dependancies,_dependancies) === true){
					$index = i;
					break;
				}
			}
			return $index;
		}
		
		function getNewIndex(_dependancies){
			var index;
			index = callQ.length;
			callQ.push({'dependancies':_dependancies,'callbacks':[]});
			return index;
		}

		function compareArray(_a1,_a2){
			var i,$return = false;
			if(KUBE.Is(_a1) === 'array' && KUBE.Is(_a2) === 'array' && _a1.length === _a2.length){
				$return = true;
				for(i=0;i<_a1.length;i++){
					if(_a1[i] !== _a2[i]){
						$return = false;
						break;
					}
				}
			}
			return $return;
		}
		
		function checkScriptReady(_index){
			var i,dependancies,fire,args;
			fire = true;
			args = [];
			dependancies = callQ[_index].dependancies;
			for(i=0;i<dependancies.length;i++){
				if(KUBE.Is(map[dependancies[i]]) === 'object'){
					if(map[dependancies[i]].state !== 2){
						fire = false;
						break;
					}
					else{
						addArg(args,dependancies[i]);
					}
				}
			}
			
			fireCalls(fire,_index,args);
		}
		
		function fireCalls(_fire,_index,_args){
			var i,calls,call;
			if(_fire === true){
				calls = callQ[_index].callbacks;
				for(i=0;i<calls.length;i++){
					if(calls[i] !== true){
						call = calls[i].f;
						calls[i] = true;
						call.apply(undefined,_args);
					}
				}
			}
		}
		
		function addArg(_argArray,_className){
			(KUBE.Is(EventEmitter[_className]) === 'function' ? _argArray.push(EventEmitter[_className]) : _argArray.push(_className));
		}

		function addScripts(_array){
			var i,className;
			for(i=0;i<_array.length;i++){
				className = _array[i];
				if(map[className] && !map[className].state){
					triggerLoad(className);
				}
			}
		}
		
		function triggerLoad(_class){
			var i;
			map[_class].state = 1;
			EventEmitter.OnState(_class,function(){
				map[_class].state = 2;
				for(i=0;i<callQ.length;i++){
					checkScriptReady(i);
				}
			});
			
			if(!loadedCode[_class] && map[_class].src){
				fetchScript(map[_class].src);				
			}
            else if(!loadedCode[_class]){

            }
		}
		
		function fetchScript(_src){
			var script = document.createElement('script');
			script.src = _src;
			document.head.appendChild(script);
		}
	}
}(window,true));

//KUBEjs utilities will autoload out of the Library subdirectory.
//External classes will need to use KUBE.AutoLoad({ClassName:FilePath})