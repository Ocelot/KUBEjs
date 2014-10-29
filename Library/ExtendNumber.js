/* 
 * Name: NumberKUBE
 * Type: KUBEExtendFunctions
 */

(function(KUBE){
	"use strict";
	
	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('/Library/ExtendNumber');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('number','debug',Debugger);

		KUBE.EmitState('/Library/ExtendNumber');
		KUBE.console.log('ExtendNumber Loaded');
	}
	
	/* Declare functions */
	function Debugger(){
		debugger;
		return this;
	}


}(KUBE));