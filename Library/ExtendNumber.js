/* 
 * Name: NumberKUBE
 * Type: KUBEExtendFunctions
 */

(function(KUBE){
	"use strict";
	
	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('ExtendNumber');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('number','debug',Debugger);

		KUBE.EmitState('ExtendNumber');
		console.log('ExtendNumber Loaded');
	}
	
	/* Declare functions */
	function Debugger(){
		debugger;
		return this;
	}


}(KUBE));