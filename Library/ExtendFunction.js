/* 
 * Name: FunctionKUBE
 * Type: KUBEExtendFunctions
 */
(function(KUBE){
	"use strict";
	
	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('ExtendFunction');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('function','promise',Promise);
		KUBE.EmitState('ExtendFunction');
		KUBE.console.log('ExtendFunction Loaded');
	}
	
	/* Declare functions */	
	function Promise(){
		var resolved,
			f = this, //Best code evar!
			resolveQ = [];
	
		f.resolve = resolve;
		f.apply(f,arguments);
		
		return { 'then': then };

		function resolve(){
			if(KUBE.Is(resolved) === 'undefined'){
				resolved = (arguments.length ? arguments : true);
				fireQ();
			}
		}

		function then(_callback){
			(KUBE.Is(resolved) !== 'undefined' ? fireCallback(_callback) : resolveQ.push(_callback));
		}

		function fireQ(){
			var i,t;
			for(i=0;i<resolveQ.length;i++){
				t = resolveQ[i];
				resolveQ[i] = undefined;
				fireCallback(t);
			}
		}

		function fireCallback(_callback){
			if(KUBE.Is(_callback) === 'function'){
				_callback.apply(_callback,resolved);
			}
		}
	}
}(KUBE));