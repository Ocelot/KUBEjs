/*
 * This file is part of the KUBEjs package
 *
 * (c) Red Scotch Software Inc <kube+js@redscotch.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
(function(KUBE){
	"use strict";
	
	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('/Library/Extend/Function');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('function','promise',Promise);
		KUBE.EmitState('/Library/Extend/Function');
		KUBE.console.log('/Library/Extend/Function Loaded');
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