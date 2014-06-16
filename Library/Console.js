(function(KUBE){
	"use strict";
	KUBE.LoadSingleton('Console',Console,['ArrayKUBE','ObjectKUBE']);
	
	Console.prototype.toString = function(){ return '[object '+this.constructor.name+']' };
	function Console(){
		var $consoleAPI,logStore;
		logStore = [];
		$consoleAPI = {
			'Log':Log,
			'Get':Get
		};
		
		return function(){
			if(arguments.length){
				Log.apply($consoleAPI,[].KUBE().args(arguments));
			}
			return $consoleAPI;
		};
		
		function Log(){
			//Is console defined? log it to the global console, but still store it in the logstore? Possibly copy before logging?
			//Take in a dynamic list of arguments
			[].KUBE().args(arguments).KUBE().each(function(_arg){
				switch(KUBE.Is(_arg)){
					case 'object': logObject(_arg); break;
					case 'array': logArray(_arg); break;
					default: logOther(_arg); break;
				}
			});
		}
		
		function Get(){
			return logStore;
		}
		
		function logObject(_obj){
			var newObj = _obj.KUBE().copy();
			addToStore(newObj);
			defaultConsole(newObj);
		}
		
		function logArray(_array){
			var newArray = _array.KUBE().copy();
			addToStore(newArray);
			defaultConsole(newArray);
		}
		
		function logOther(_other){
			addToStore(_other);
			defaultConsole(_other);
		}
		
		function addToStore(_logOut){
			logStore.push(_logOut);
		}
		
		function defaultConsole(_logOut){
			if(window.console){
				console.log(_logOut);
			}
		}
	}	
}(KUBE));