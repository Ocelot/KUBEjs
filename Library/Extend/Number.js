/* 
 * Name: NumberKUBE
 * Type: KUBEExtendFunctions
 */

(function(KUBE){
	"use strict";
	
	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('/Library/Extend/Number');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('number','debug',Debugger);

		KUBE.EmitState('/Library/Extend/Number');
		KUBE.console.log('/Library/Extend/Number Loaded');
	}
	
	/* Declare functions */
	function Debugger(){
		debugger;
		return this;
	}


}(KUBE));