/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(window,KUBEPrototype){
	"use strict";
	
	var KUBE,AutoLoader,config = { };

    //Moved safely to a short circuit because now a safe default exists
    config = (typeof window.KUBE === 'object' && typeof window.KUBE.config === 'object') ? window.KUBE.config : initDefaultConfig();

    if(!config.autoLoadPath){
        var tempConfig = initDefaultConfig();
        config.autoLoadPath = tempConfig.autoLoadPath;
    }

    //Because I went retarded, I removed the comments
    function initDefaultConfig(){
        var config = {
            "autoLoadPath" : getAutoLoadPath(),
            "debug": true,
            "key1":false,
            "key2":false
        };
        return config;

        function getAutoLoadPath() {
            var src = srcFromCurrentScript() || srcFallback();
            return parseAutoLoadPath(src);
        }

        function parseAutoLoadPath(_src) {
            var paths = _src.split('/');
            return paths.splice(0,paths.length-1).join('/')+'/';
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

    function initFakeConsole(){
        var $return = {};
        var consoleProps = ['memory'];
        var consoleFunctions = ["debug", "error", "info", "log", "warn", "dir", "dirxml", "table", "trace", "assert", "count", "markTimeline", "profile", "profileEnd", "time", "timeEnd", "timeStamp", "timeline", "timelineEnd", "group", "groupCollapsed", "groupEnd", "clear"];
        for(var i = 0; i < consoleProps.length; i++){ $return[consoleProps[i]] = consoleProps[i]; }
        for(i = 0; i < consoleFunctions.length; i++){ $return[consoleFunctions[i]] = function(){}; }
        return $return;
    }
	
	/* Create KUBE */
	KUBE = E();
	KUBEEvents(KUBE);
	window.KUBE = KUBE;
    //Random experiment.
	KUBE.console = window.console || initFakeConsole();

	/* Load in Patience */
	AutoLoader = new KUBELoader(KUBE, KUBE.Class);
    //AutoLoader.SetAutoPath(config.autoLoadPath);
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
        //THIS IS TO FIX IE9 WITH constructor.name.. I MIGHT KILL THIS
        if (Function.prototype.name === undefined && Object.defineProperty !== undefined) {
            Object.defineProperty(Function.prototype, 'name', {
                get: function() {
                    var funcNameRegex = /function\s+([^\s(]+)\s*\(/;
                    var results = (funcNameRegex).exec((this).toString());
                    return (results && results.length > 1) ? results[1] : "";
                },
                set: function(value) {}
            });
        }

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



        Object.defineProperty(Math,"KUBE",{
            "enumerable": false,
            "configurable": false,
            "writable": false,
            "value": function(){ return KUBE.Extend().Obj(Math,true); }
        });

	//}
	
	if(KUBE.Is(config.preLoad) === 'array'){
		for(var i=0;i<config.preLoad.length;i++){
			KUBE.SetAsLoaded(config.preLoad[i]);
		}
	}
	
	/* Primary definition */
	function E(){
		var nativeTable,kubeManager,$KUBEAPI;

        kubeManager = {};
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
            'Promise':Promise,
			'Config':Config,
            'Class':Class,
            'UUID': UUID
		};

		return $KUBEAPI;
		
		/* public */
		//Cleaned up is, single table object created, reuses it. Returns immediately on undefined and null, no additional function call.
		function Is(_val,_objType){
			var $return;
			if(_val === undefined){ return 'undefined'; }
			if(_val === null){ return 'null'; }
            if(_val instanceof Error){ return 'Error' };
			
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
				//$KUBEAPI[_fName] = _f;

                kubeManager[_fName] = _f;
                KUBE.console.log('successfully loaded '+_fName);
				$KUBEAPI.EmitState(_fName);
			}
		}

		function LoadFactory(_class,_classFunction,_needs){
			if(Is(_classFunction) === 'function'){
				AutoLoader.SetAsLoaded(_class);
				(_needs ? AutoLoader.Uses(_needs,load,_class) : load());
			}

			function load(){
                kubeManager[_class] = function(){
					var args = arguments;
					function F(){
						return _classFunction.apply(_classFunction,args);
					};
					return Events(new F());
				};
				KUBE.console.log('successfully loaded '+_class);
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
				kubeManager[_class] = function(){
					return (KUBE.Is($static) === 'function' ? $static.apply($static, Array.prototype.slice.call(arguments)) : $static);
				};
				KUBE.console.log('successfully loaded '+_class);
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
				kubeManager[_class] = function(instance){
					if(instance && !staticInstances[String(instance).toLowerCase()]){
						staticInstances[String(instance).toLowerCase()] = Events(_classFunction.call(_classFunction,instance));
					}
					return (instance ? staticInstances[String(instance).toLowerCase()] : Events(_classFunction.call(_classFunction)));
				};
				KUBE.console.log('successfully loaded '+_class);
				$KUBEAPI.EmitState(_class);
			}
		}

		function AutoLoad(){
            return AutoLoader;
		}

		function SetAsLoaded(_codeName){
			AutoLoader.SetAsLoaded(_codeName);
		}

		function Uses(_dependancies,_callback){
			return AutoLoader.Uses(_dependancies,_callback);
		}

        function Class(_mixed){
            var $return;
            switch(KUBE.Is(_mixed)){
                case 'string':
                    $return = kubeManager[_mixed];
                    break;

                case 'array':
                    $return = [];
                    for(var i=0;i<_mixed.length;i++){
                        $return.push(kubeManager[_mixed[i]]);
                    }
                    break;

                case 'object':
                    $return = {};
                    for(var aliasName in _mixed){
                        if(_mixed.hasOwnProperty(aliasName)){
                            $return[aliasName] = kubeManager[_mixed[aliasName]];
                        }
                    }
                    break;
            }
            return $return;
        }


		function Extend(){
			return KUBEExtend();
		}

		function Events(_initObj){
			var type = Is(_initObj);
			return (type === 'object' ? KUBEEvents(_initObj) : (type === 'undefined' ? KUBEEvents({}) : _initObj));
		}

        function Promise(_callback){
            return (KUBE.Is(_callback) === "function" ? new KUBEPromise(_callback) : new KUBEPromise);
        }

		function Config(){
			return config;
		}

        function UUID(_includeDashes){
            _includeDashes = (_includeDashes === false ? false : true);
            var r = [
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(16384,20479).toString(16),
                Math.KUBE().random(32768,49151).toString(16),
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(0,65535).toString(16),
                Math.KUBE().random(0,65535).toString(16)
            ];
            if(_includeDashes){
                return (r[0]+r[1]+'-'+r[2]+'-'+r[3]+'-'+r[4]+'-'+r[5]+r[6]+r[7]).toUpperCase();
            }
            else{
                return r.join('').toUpperCase();
            }
        }

	}

    KUBEPromise.prototype.resolve = function(value){
        if(this.hasCallback){
            throw new Error('Invalid use of resolve on a Promise object with an executor function');
        }
        return new KUBEPromise(function(resolve,reject){resolve(value)});
    };
    KUBEPromise.prototype.reject = function(value){
        if(this.hasCallback){
            throw new Error('Invalid use of reject on a Promise object with an executor function');
        }
        return new KUBEPromise(function(resolve,reject){reject(value)});
    };

    KUBEPromise.prototype.all = function(promises){
        if(this.hasCallback){
            throw new Error('Invalid use of all on a Promise object with an executor function');
        }
        var accumulator = [];
        var ready = (new KUBEPromise).resolve(null);

        promises.KUBE().each(function(promise){
            ready = ready.then(function(){
                return promise;
            });
            ready.then(function(value){
                accumulator.push(value);
            });
        });
        return ready.then(function(){ return accumulator});

    };

    KUBEPromise.prototype.race = function(promises){
        if(this.hasCallback){
            throw new Error('Invalid use of race on a Promise object with an executor function');
        }
        return new KUBEPromise(function(_res,_rej){
            promises.KUBE().each(function(promise){
                promise.then(function(val){
                    KUBE.Promise().resolve(val).then(_res,_rej);
                });
            })
        });
    };


    KUBEPromise.prototype.toString = function(){ return '[object Promise]' };
    function KUBEPromise(_callback){
        var stateEnum = {};
        stateEnum.PENDING = 0;
        stateEnum.RESOLVED = 1;
        stateEnum.REJECTED = 2;
        stateEnum[0] = "pending";
        stateEnum[1] = "resolved";
        stateEnum[2] = "rejected";

        var resolveQ,state,reason,promiseValue,self;
        if(KUBE.Is(this) !== 'object'){
            throw new TypeError("KUBEPromise must be constructed with new");
        }
        if(KUBE.Is(_callback) !== "function" && KUBE.Is(_callback) !== "undefined" ){
            throw new TypeError("KUBEPromise must be initialized with an initial executor function");
        }
        self = this; //Can't pass this promise into itself as a then, gotta have a way to test it.
        resolveQ = [];
        state = 0;
        reason = "";

        if(_callback){
            //If an executor is passed in, then this object is a Promise.
            //Else, we don't want to bind promise-like methods, as it's just an intermediatary to access the prototype methods

            Object.defineProperty(this,"hasCallback",{
                "value": true,
                "writable": false,
                "enumerable": false,
                "configurable": false
            });

            Object.defineProperty(this,"[[PromiseStatus]]",{
                "value": stateEnum[state],
                "writable": false,
                "enumerable": false,
                "configurable": false
            });
            Object.defineProperty(this,"[[PromiseReason]]",{
                "value": reason,
                "writable": false,
                "enumerable": false,
                "configurable": false
            });
            Object.defineProperty(this,"[[PromiseValue]]",{
                "value": promiseValue,
                "writable": false,
                "enumerable": false,
                "configurable": false
            });

            executeResolve(_callback,resolve,reject)

            this.then = this.Then = function(_resolveCallback,_rejectCallback){
                return new self.constructor(function(resolve,reject){
                    manage(new deferredObj(_resolveCallback,_rejectCallback,resolve,reject));
                })
            }

            this.catch = this.Catch = function(onRejected){
                return this.then(null, onRejected);
            }
        }

        function deferredObj(onResolve,onReject,resolve,reject){
            this.onResolve = (KUBE.Is(onResolve) === "function" ? onResolve : null);
            this.onReject = (KUBE.Is(onReject) === "function" ? onReject : null);
            this.resolve = (KUBE.Is(resolve) === "function" ? resolve : null);
            this.reject = (KUBE.Is(reject) === "function" ? reject : null);
        }


        function manage(deferred){
            if(state === stateEnum.PENDING){
                resolveQ.push(deferred);
                return;
            }
            (function(){
                var promiseThenable,newVal;
                if(state === stateEnum.RESOLVED){
                    promiseThenable = deferred.onResolve
                }
                else{
                    promiseThenable = deferred.onReject
                }

                if(promiseThenable === null){
                    if(state === stateEnum.RESOLVED){
                        deferred.resolve(promiseValue);
                    }
                    else{
                        deferred.reject(promiseValue);
                    }
                    return;
                }

                try{
                    newVal = promiseThenable(promiseValue);
                }
                catch(e){
                    deferred.reject(e);
                    return;
                }
                deferred.resolve(newVal);

            })()

        }

        function resolve(_value){
            var then;
            try{
                if(_value !== undefined && _value === this){ throw new TypeError('A promise cannot be resolved with itself.') }
                if(_value && (KUBE.Is(_value) === "object" || KUBE.Is(_value) === "function")){
                    then = _value.then;
                    if(KUBE.Is(then) === 'function'){
                        executeResolve(then.bind(_value),resolve,reject);
                        return;
                    }
                }
                state = stateEnum.RESOLVED;
                promiseValue = _value;
                loopOverResolveQ();
            }
            catch(e){
                reject(e);
            }
        }

        function reject(_value){
            state = stateEnum.REJECTED;
            promiseValue = _value;
            loopOverResolveQ();
            resolveQ = [];
        }

        function loopOverResolveQ(){
            //I'm not using KUBE.each in this context because ArrayExtend isn't loaded.
            var rQ = resolveQ; //Done to attempt to proactively prevent a potential async problem with undefined indexes
            for(var i = 0; i < rQ.length; i++){
                manage(rQ[i]);
            }
        }


        function executeResolve(executor,onResolve,onReject){
            var resolvedOrRejected = false;
            try{
                executor(function(value){
                    if(resolvedOrRejected){return;}
                    resolvedOrRejected = true;
                    onResolve(value);
                },
                function(reason){
                    if(resolvedOrRejected){return;}
                    resolvedOrRejected = true;
                    onReject(reason);
                    KUBE.console.error("Promise has been rejected", reason);
                })
            }
            catch(e){
                if(resolvedOrRejected){return;}
                resolvedOrRejected = true;
                onReject(e);
                KUBE.console.error("Promise has been rejected", e);
            }
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
            obj.ListenerCount = ListenerCount;
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
			//KUBE.console.log('EmitState called: '+_state);
			_state = initStateSpace(_state);
			if(!stateCache[_state].state){
				stateCache[_state].state = true;
				fireArray = stateCache[_state].f;
				for(i=0;i<fireArray.length;i++){
					if(KUBE.Is(fireArray[i]) === 'function'){
                        //TODO: At one point I had a catch here, and it just caught everything. Not sure why?
                        fireArray[i]();
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

        function ListenerCount(_event){
            _event = initEventSpace(_event);
            return eventCache[_event].length;
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
			KUBE.console.log(syncQ);
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
			KUBE.console.log('inject',_index);
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
		
		function Obj(_ref,_useTrueType){
			var f,prop,$return,is;
			_useTrueType = !!(_useTrueType);
			$return = {};
			is = KUBE.Is(_ref,_useTrueType);

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

    //KUBELoaderIndex
    function KUBELoaderIndex(){
        var $API,index,namespace,baseURL;
        $API = {
            'GetIndex':GetIndex,
            'GetNamespace':GetNamespace,
            'GetBaseURL':GetBaseURL,
            'SetIndex':SetIndex,
            'SetNamespace':SetNamespace,
            'SetBaseURL':SetBaseURL
        };
        return $API;

        //Getters
        function GetNamespace(){
            return namespace;
        }

        function GetBaseURL(){
            return baseURL;
        }

        function GetIndex(){
            return index;
        }

        //Setters
        function SetNamespace(_namespace){
            if(KUBE.Is(_namespace) === 'string'){
                namespace = _namespace;
            }
            return $API;
        }

        function SetBaseURL(_baseURL){
            if(KUBE.Is(_baseURL) === 'string'){
                baseURL = _baseURL;
            }
            return $API;
        }

        function SetIndex(_index){
            if(KUBE.Is(_index) === 'array'){
                index = _index;
            }
            return $API;
        }
    }

	function KUBELoader(_EventObj,_StorageContext){
		var callQ,map,$API,EventEmitter,loadedCode,maps,autoPath,autoIndexPaths,deferred;
		var StorageContext = (KUBE.Is(_StorageContext) === 'function' ? _StorageContext : null);
		callQ = [];
		map = {};
		maps = [];
		loadedCode = {};
        autoIndexPaths = {};
        deferred = [];
        var waitForIndex = {};

		$API = {
			'Uses':Uses,
			'SetEmitter':SetEmitter,
			'SetAsLoaded':SetAsLoaded,
            'GetNewIndex':GetNewIndex,
            'AddIndex':AddIndex,
            'LoadAutoIndex':LoadAutoIndex
		};
		if(_EventObj){
			SetEmitter(_EventObj);
		}
		return $API;

        //Working on our new AutoIndex methodology
        function GetNewIndex(){
            return new KUBELoaderIndex();
        }

        function AddIndex(_AutoIndex){
            //_AutoIndex should be KUBEAutoIndex (we may want to verify this later)
            var baseURL,namespace,index,fullNS,fullSrc;
            baseURL = _AutoIndex.GetBaseURL();
            namespace = _AutoIndex.GetNamespace();
            index = _AutoIndex.GetIndex();

            for(var i=0;i<index.length;i++){
                fullNS = namespace+"/"+index[i];
                if(!map[fullNS]){
                    fullSrc = baseURL+"/"+index[i]+".js";
                    map[fullNS] = {'state':0,'src':fullSrc};
                }
            }

            //Then we copy our deferred list, turn the new one into a new array, and attempt to validate / load scripts
            var deferredCopy = deferred;
            deferred = [];
            for(var i=0;i<deferredCopy.length;i++){
                if(validateDependancies(deferredCopy[i])){
                    addScripts(deferredCopy[i]);
                }
            }
        }

        function LoadAutoIndex(_namespace,_indexURL){
            if(!autoIndexPaths[_namespace]){
                autoIndexPaths[_namespace] = [];
            }

            var addNew = true;
            for(var i=0;i<autoIndexPaths[_namespace].length;i++){
                if(autoIndexPaths[_namespace][i] == _indexURL){
                    addNew = false;
                    break;
                }
            }

            if(addNew){
                autoIndexPaths[_namespace].push(_indexURL);
            }
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
		
		//Returns a promise, also will shortcut a second argument directly into the promise
		function Uses(_dependancies,_callback,_useName){
            var aliasObject = false;
            switch(KUBE.Is(_dependancies)){
                case 'string':
                    _dependancies = [_dependancies];
                    break;

                case 'object':
                    var tempDependancies = [];
                    for(var key in _dependancies){
                        if(_dependancies.hasOwnProperty(key)){
                            tempDependancies.push(_dependancies[key]);
                        }
                    }
                    aliasObject = _dependancies;
                    _dependancies = tempDependancies;
                    break;
            }


			validateEmitter();
			return (validateDependancies(_dependancies,_callback) ? getPromise(_dependancies,_callback,_useName,aliasObject) : false);
		}
		
		function SetAsLoaded(_codeName){
			if(KUBE.Is(_codeName) === 'string'){
				loadedCode[_codeName] = true;
			}
		}


        function validateDependancies(_dependancies){
            var className,defer,$return;
            $return = false;
            defer = false;
            if(KUBE.Is(_dependancies) === 'array'){
                $return = true;
                for(var i=0;i<_dependancies.length;i++){
                    className = _dependancies[i];
                    if(!map[className]){
                        //This is where we want to attempt to load in the namespace?
                        var nameSpace = parseNamespace(className);
                        if(nameSpace && autoIndexPaths[nameSpace]){
                            if(!waitForIndex[nameSpace]){
                                waitForIndex[nameSpace] = true;
                                for(var i2=0;i2<autoIndexPaths[nameSpace].length;i2++){
                                    initAutoLoadLoop(autoIndexPaths[nameSpace],className);
                                }
                            }
                            defer = true;
                        }
                        else{
                            //In this case a request for a namespace that has not been set up has occurred. So throw an error I'd imagine?
                            throw new Error('A class was requested for a namespace that has no reference ('+nameSpace+':'+className+') KUBE will not be able to resolve this. Ensure namespace index is registered and namespace case is correct');
                        }
                    }
                }
            }

            if(defer){
                var add = true;
                for(var i=0;i<deferred.length;i++){
                    if(compareArray(_dependancies,deferred[i])){
                        add = false;
                        break;
                    }
                }
                if(add){
                    deferred.push(_dependancies);
                }
            }

            return $return;
        }

        function parseNamespace(_classPath){
            if(KUBE.Is(_classPath) === 'string'){
                var splitPath = _classPath.split("/");
                splitPath.pop();
                return splitPath.join("/");
            }
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
		
		function getPromise(_dependancies,_callback,_useName,_aliasObject){
			var index;
			
			//Now, if _useName is set, we can look to see if a circular dependancy has been set up. If it has, we bail on the current one. Which resolves in reverse, etc
			if(_useName){
				_dependancies = checkDependancyChain(_useName,_dependancies);
			}
			
			index = checkForExistingIndex(_dependancies) || getNewIndex(_dependancies);
			addScripts(_dependancies);
			if(KUBE.Is(_callback) === 'function'){
				callQ[index].callbacks.push({'f':_callback,'resolveName':_useName,'aliasObj':_aliasObject});
				checkScriptReady(index);
			}
			return {
				'then':function(_callback){
					if(KUBE.Is(_callback) === 'function'){
						callQ[index].callbacks.push({'f':_callback,'resolveName':_useName,'aliasObj':_aliasObject});
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
                else{
                    fire = false;
                }
			}
			fireCalls(fire,_index,args);
		}
		
		function fireCalls(_fire,_index,_args){
			var i,calls,call,aliasObj;
			if(_fire === true){
				calls = callQ[_index].callbacks;
				for(i=0;i<calls.length;i++){
					if(calls[i] !== true){
                        aliasObj = calls[i].aliasObj;
						call = calls[i].f;
						calls[i] = true;

						call.apply(undefined,(StorageContext ? buildArgs(_args,aliasObj) : []));
					}
				}
			}

            function buildArgs(_args,_aliasObj){
                //So we have 2 variations, one is a multiargument list in order of the arguments that were passed in that contain the class/function constructs
                var Alias,$return = [];
                if(KUBE.Is(_aliasObj) === 'object'){
                    Alias = {};
                    for(var aliasName in _aliasObj){
                        if(_aliasObj.hasOwnProperty(aliasName)){
                            Alias[aliasName] = StorageContext(_aliasObj[aliasName]);
                        }
                    }
                    $return.push(Alias);
                }
                else{
                    for(var i=0;i<_args.length;i++){
                        if(KUBE.Is(_args[i]) !== 'function'){
                            $return.push(StorageContext(_args[i]));
                        }
                        else{
                            $return.push(_args[i]);
                        }
                    }
                }
                return $return;
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

        //This occurs when a namespace has been requested that we do not have an actively mapped class for. If there was
        function initAutoLoadLoop(_indexSrc,_class){
            var totalLoops = 0;
            var loopId = setInterval(function(){
                if(!map[_class]){
                    totalLoops++;
                    if(totalLoops > 25){
                        clearTimeout(loopId);
                    }
                    else{
                        fetchScript(_indexSrc);
                    }
                }
                else{
                    clearTimeout(loopId);
                }
            },200);
        }
	}
}(window,true));

KUBE.AutoLoad().LoadAutoIndex('/Library/DOM',KUBE.Config().autoLoadPath+'/Indexes/DOMIndex.js');
KUBE.AutoLoad().LoadAutoIndex('/Library/DOM/Dragger',KUBE.Config().autoLoadPath+'/Indexes/DOMIndex.js');
KUBE.AutoLoad().LoadAutoIndex('/Library/Ajax',KUBE.Config().autoLoadPath+'/Indexes/AjaxIndex.js');
KUBE.AutoLoad().LoadAutoIndex('/Library/Drawing',KUBE.Config().autoLoadPath+'/Indexes/DrawingIndex.js');
KUBE.AutoLoad().LoadAutoIndex('/Library/Extend',KUBE.Config().autoLoadPath+'/Indexes/ExtendIndex.js');
KUBE.AutoLoad().LoadAutoIndex('/Library/Tools',KUBE.Config().autoLoadPath+'/Indexes/ToolsIndex.js');
KUBE.AutoLoad().LoadAutoIndex('/Library/UI',KUBE.Config().autoLoadPath+'/Indexes/UIIndex.js');