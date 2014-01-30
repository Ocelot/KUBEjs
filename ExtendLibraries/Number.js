/* 
 * Name: NumberKUBE
 * Type: KUBEExtendFunctions
 */

(function(KUBE){
	"use strict";
	
	/* Load functions */
	var ExtendAPI;
	KUBE.SetAsLoaded('NumberKUBE');
	if(KUBE.Extend){
		ExtendAPI = KUBE.Extend();
		ExtendAPI.Load('number','debug',Debugger);

		KUBE.EmitState('NumberKUBE');
		console.log('NumberKUBE Extend Loaded');
	}
	
	/* Declare functions */
	function Debugger(){
		debugger;
		return this;
	}


}(KUBE));